import React, { useState, useRef, useEffect } from 'react';
import { PolaroidItem } from '../types';
import { spawnPixelBurst } from '../utils/fx';
import { fetchPortfolioState, saveServerPhotos, uploadServerPhoto, getStoredAdminToken } from '../utils/portfolioApi';
import { compressImage } from '../utils/imageCompressor';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { TRANSLATIONS } from '../utils/translations';

interface PolaroidPinboardProps {
  onOpenContact: (e?: React.MouseEvent) => void;
}

const LOCAL_STORAGE_KEY = 'pa_custom_polaroids_v7';

/**
 * Ensures photo URL resolves directly without any hardcoded AI fallbacks.
 */
export function resolvePolaroidImage(item?: PolaroidItem | null): string {
  if (!item || !item.image) return '';
  return typeof item.image === 'string' ? item.image : '';
}

// Pre-upload pending item structure
interface PendingUploadItem {
  id: string;
  image: string;
  title: string;
  tags: string;
  badge: string;
}

export const PolaroidPinboard: React.FC<PolaroidPinboardProps> = ({ onOpenContact }) => {
  const { isAdmin, openLoginModal } = useAuth();
  const { language, isVi } = useLanguage();
  const t = TRANSLATIONS[language].polaroid;
  const [selectedPhoto, setSelectedPhoto] = useState<PolaroidItem | null>(null);
  const [editingPhoto, setEditingPhoto] = useState<PolaroidItem | null>(null);
  const [pendingUpload, setPendingUpload] = useState<PendingUploadItem | null>(null);

  const [polaroidList, setPolaroidList] = useState<PolaroidItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved !== null) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch {
      // ignore JSON error
    }
    return [];
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadNotice, setUploadNotice] = useState<string | null>(null);

  // Tải danh sách ảnh từ server và đồng bộ 2 chiều (bảo đảm tất cả máy khác & IP mới đều thấy ảnh)
  useEffect(() => {
    let isMounted = true;

    const syncState = async () => {
      try {
        const serverState = await fetchPortfolioState();
        if (!isMounted) return;

        // Trường hợp 1: Máy chủ đã có ảnh => Máy chủ là chân lý tuyệt đối cho mọi máy khách
        if (serverState && Array.isArray(serverState.photos) && serverState.photos.length > 0) {
          setPolaroidList(serverState.photos);
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(serverState.photos));
          } catch {
            // ignore
          }
        }
        // Trường hợp 2: Máy chủ chưa có ảnh (hoặc vừa được khởi động), nhưng máy này đã có ảnh trong localStorage
        // (tức là trước đó Admin đã ghim ảnh trên máy này nhưng chưa lưu lên server):
        // => Tự động ĐẨY TOÀN BỘ ẢNH LÊN MÁY CHỦ ngay lập tức để tất cả máy khác mở link đều thấy!
        else {
          const localSaved = localStorage.getItem(LOCAL_STORAGE_KEY);
          if (localSaved) {
            try {
              const parsed = JSON.parse(localSaved);
              if (Array.isArray(parsed) && parsed.length > 0) {
                setPolaroidList(parsed);
                // Nếu là Admin hoặc có phiên đăng nhập, đồng bộ ngay lên server
                const token = getStoredAdminToken();
                if (token || isAdmin) {
                  console.log('[Polaroid] Pushing local photos to server for all devices...');
                  const pushRes = await saveServerPhotos(parsed);
                  if (pushRes.success && pushRes.photos) {
                    setPolaroidList(pushRes.photos);
                  }
                }
              }
            } catch {
              // ignore
            }
          }
        }
      } catch (err) {
        console.warn('[Polaroid] Error during mount sync:', err);
      }
    };

    syncState();

    // Định kỳ kiểm tra máy chủ mỗi 10 giây:
    // Giúp các thiết bị khác hoặc các tab đang mở tự động cập nhật ngay khi chủ nhân ghim ảnh mới
    const interval = setInterval(() => {
      fetchPortfolioState().then((serverState) => {
        if (!isMounted) return;
        if (serverState && Array.isArray(serverState.photos)) {
          setPolaroidList((prev) => {
            // So sánh nếu có sự thay đổi thì mới render lại
            const prevStr = JSON.stringify(prev);
            const serverStr = JSON.stringify(serverState.photos);
            if (prevStr !== serverStr && serverState.photos!.length > 0) {
              try {
                localStorage.setItem(LOCAL_STORAGE_KEY, serverStr);
              } catch {
                // ignore
              }
              return serverState.photos as PolaroidItem[];
            }
            return prev;
          });
        }
      }).catch(() => {});
    }, 10000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [isAdmin]);

  // Lưu thay đổi lên máy chủ (cho tất cả IP/thiết bị khác) và localStorage
  const updateList = async (newList: PolaroidItem[]) => {
    setPolaroidList(newList);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newList));
    } catch {
      // ignore storage quota error
    }

    setUploadNotice(
      isVi
        ? '⏳ Đang đồng bộ ảnh lên máy chủ cho TẤT CẢ người xem...'
        : '⏳ Syncing photos to server for ALL visitors...'
    );

    const res = await saveServerPhotos(newList);
    if (res.success) {
      if (res.photos) {
        setPolaroidList(res.photos);
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(res.photos));
        } catch {
          // ignore
        }
      }
      setUploadNotice(
        isVi
          ? '✅ Đã lưu lên máy chủ thành công! Tất cả máy khác & IP mới mở link đều sẽ thấy ảnh này.'
          : '✅ Saved to server successfully! All devices & new IPs will see these photos.'
      );
      setTimeout(() => setUploadNotice(null), 4500);
    } else {
      if (res.isViewer || !isAdmin) {
        setUploadNotice(
          isVi
            ? '⚠️ Chưa lưu được lên máy chủ: Bạn cần đăng nhập Admin để đồng bộ cho tất cả mọi người!'
            : '⚠️ Not saved to server: Please login as Admin to sync for everyone!'
        );
        openLoginModal();
      } else {
        setUploadNotice(
          isVi
            ? `⚠️ Chưa lưu được lên máy chủ: ${res.error || 'Vui lòng kiểm tra lại kết nối'}`
            : `⚠️ Could not save to server: ${res.error || 'Check connection'}`
        );
      }
      setTimeout(() => setUploadNotice(null), 6000);
    }
  };

  const handleClearAll = async () => {
    if (!isAdmin) {
      setUploadNotice(
        isVi
          ? '🛡️ Chỉ Admin mới có quyền xóa toàn bộ ảnh!'
          : '🛡️ Only Admin has permission to clear photos!'
      );
      setTimeout(() => setUploadNotice(null), 3000);
      openLoginModal();
      return;
    }
    await updateList([]);
    setUploadNotice(isVi ? 'Đã làm trống toàn bộ ảnh trên bảng!' : 'Cleared all photos from board!');
    setTimeout(() => setUploadNotice(null), 3000);
  };

  // Nén ảnh tự động về kích thước chuẩn và mở modal xem trước
  const processImageFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert(
        isVi
          ? 'Vui lòng chỉ chọn tệp hình ảnh (.jpg, .png, .webp, v.v.)!'
          : 'Please select an image file (.jpg, .png, .webp, etc.)!'
      );
      return;
    }

    setUploadNotice(
      isVi
        ? '⏳ Đang tối ưu hóa dung lượng ảnh để tải siêu nhanh...'
        : '⏳ Optimizing image for fast upload...'
    );

    try {
      // Tự động nén ảnh xuống chuẩn max 1200px chất lượng cao (~100KB), chống lỗi quá tải payload
      const compressedDataUrl = await compressImage(file, 1200, 1200, 0.85);
      const cleanFileName = file.name.replace(/\.[^/.]+$/, '');
      setPendingUpload({
        id: `custom-polaroid-${Date.now()}`,
        image: compressedDataUrl,
        title: cleanFileName || (isVi ? 'Kỷ niệm mới' : 'New Memory'),
        tags: '#myphoto #memory #original',
        badge: '★ ORIGINAL',
      });
      setUploadNotice(null);
    } catch (err) {
      console.warn('Fallback file reader on image upload:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64Url = event.target?.result as string;
        if (!base64Url) return;
        const cleanFileName = file.name.replace(/\.[^/.]+$/, '');
        setPendingUpload({
          id: `custom-polaroid-${Date.now()}`,
          image: base64Url,
          title: cleanFileName || (isVi ? 'Kỷ niệm mới' : 'New Memory'),
          tags: '#myphoto #memory #original',
          badge: '★ ORIGINAL',
        });
      };
      reader.readAsDataURL(file);
      setUploadNotice(null);
    }
  };

  // Xác nhận ghim ảnh lên máy chủ
  const handleConfirmPendingUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingUpload) return;

    const parsedTags = pendingUpload.tags
      .split(' ')
      .map((t) => t.trim())
      .filter(Boolean)
      .map((t) => (t.startsWith('#') ? t : `#${t}`));

    let finalImageUrl = pendingUpload.image;

    // Tải tệp ảnh vật lý lên thư mục tĩnh máy chủ (/uploads/)
    if (finalImageUrl.startsWith('data:image/')) {
      setUploadNotice(
        isVi
          ? '⏳ Đang lưu tệp ảnh lên máy chủ vĩnh viễn...'
          : '⏳ Saving image permanently to server...'
      );
      const uploadRes = await uploadServerPhoto(finalImageUrl, 'polaroid');
      if (uploadRes.success && uploadRes.url) {
        finalImageUrl = uploadRes.url;
      }
    }

    const newPolaroid: PolaroidItem = {
      id: pendingUpload.id,
      title: pendingUpload.title.trim() || (isVi ? 'Khoảnh khắc kỷ niệm 📷' : 'Memorable Moment 📷'),
      image: finalImageUrl,
      tags: parsedTags.length > 0 ? parsedTags : ['#myphoto', '#memory'],
      badge: pendingUpload.badge.trim() || '★ ORIGINAL',
      pinColor: 'bg-[#f6c833]',
      rotation: Math.random() > 0.5 ? 'rotate-1' : '-rotate-1',
      badgeColor: 'text-[#f6c833]',
    };

    const updated = [newPolaroid, ...polaroidList];
    setPendingUpload(null);
    await updateList(updated);
  };

  // Lưu chỉnh sửa tiêu đề/thông tin ảnh
  const handleSaveEditPhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPhoto) return;

    let finalImageUrl = editingPhoto.image;
    if (finalImageUrl.startsWith('data:image/')) {
      setUploadNotice(
        isVi ? '⏳ Đang tải ảnh mới lên máy chủ...' : '⏳ Uploading updated photo to server...'
      );
      const uploadRes = await uploadServerPhoto(finalImageUrl, 'polaroid_edit');
      if (uploadRes.success && uploadRes.url) {
        finalImageUrl = uploadRes.url;
      }
    }

    const updatedPhoto = { ...editingPhoto, image: finalImageUrl };
    const updated = polaroidList.map((item) =>
      item.id === updatedPhoto.id ? updatedPhoto : item
    );
    setEditingPhoto(null);
    if (selectedPhoto && selectedPhoto.id === updatedPhoto.id) {
      setSelectedPhoto(updatedPhoto);
    }
    await updateList(updated);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isAdmin) {
      setUploadNotice('🛡️ Bạn đang ở chế độ Người xem (Viewer). Vui lòng đăng nhập Admin để ghim ảnh!');
      setTimeout(() => setUploadNotice(null), 4000);
      openLoginModal();
      return;
    }
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => processImageFile(file));
      // Reset input so same file can be selected again
      e.target.value = '';
    }
  };

  // Support paste image (Ctrl+V / Cmd+V) - Admin only
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          if (!isAdmin) {
            setUploadNotice('🛡️ Bạn đang ở chế độ Người xem (Viewer). Vui lòng đăng nhập Admin để dán ảnh!');
            setTimeout(() => setUploadNotice(null), 4000);
            return;
          }
          const file = items[i].getAsFile();
          if (file) {
            processImageFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [isAdmin, polaroidList]);

  const handleRemovePhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) {
      setUploadNotice('🛡️ Chỉ Admin mới có quyền gỡ ảnh!');
      setTimeout(() => setUploadNotice(null), 3000);
      openLoginModal();
      return;
    }
    const updated = polaroidList.filter((item) => item.id !== id);
    if (selectedPhoto && selectedPhoto.id === id) {
      setSelectedPhoto(null);
    }
    updateList(updated);
    setUploadNotice('Đã gỡ ảnh khỏi bảng ghim.');
    setTimeout(() => setUploadNotice(null), 3000);
  };

  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (isAdmin) {
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (!isAdmin) {
      setUploadNotice('🛡️ Bạn đang ở chế độ Người xem (Viewer). Vui lòng đăng nhập Admin để ghim ảnh!');
      setTimeout(() => setUploadNotice(null), 4000);
      openLoginModal();
      return;
    }
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => processImageFile(file));
    }
  };

  return (
    <section className="space-y-6" id="guestbook">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-[3px] border-[#5a3696] pb-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#f6c833] text-2xl">photo_library</span>
          <h2 className="text-xl md:text-2xl font-['Space_Grotesk'] text-[#f6c833] arcade-glow-gold uppercase font-bold">
            {t.sectionTitle}
          </h2>
        </div>

        {/* Header Actions - Admin vs Viewer */}
        <div className="flex flex-wrap items-center gap-2">
          {isAdmin ? (
            <>
              <button
                type="button"
                onClick={() => {
                  fileInputRef.current?.click();
                }}
                className="font-['Space_Mono'] text-xs bg-[#26c281] hover:bg-[#20a36c] text-[#120a21] font-bold border-[2px] border-black px-3 py-1.5 shadow-[2px_2px_0px_#0a0514] cursor-pointer pixel-btn-action flex items-center gap-1.5"
                title={t.pinPhotoBtn}
              >
                <span className="material-symbols-outlined text-sm">upload_file</span>
                <span>{t.pinPhotoBtn}</span>
              </button>
              {polaroidList.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="font-['Space_Mono'] text-xs bg-[#2e263f] hover:bg-[#ef4444] text-[#eaddff] hover:text-white font-bold border-[2px] border-black px-2.5 py-1.5 shadow-[2px_2px_0px_#0a0514] cursor-pointer pixel-btn-action flex items-center gap-1"
                  title={t.clearAllBtn}
                >
                  <span className="material-symbols-outlined text-sm">delete_sweep</span>
                  <span>{t.clearAllBtn}</span>
                </button>
              )}
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="font-['Space_Mono'] text-xs text-[#d1c5ad] bg-[#120a21] border border-[#5a3696] px-2.5 py-1.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-[#45b7d1] text-xs">visibility</span>
                <span>{t.viewerMode}</span>
              </span>
              <button
                type="button"
                onClick={openLoginModal}
                className="font-['Space_Mono'] text-xs bg-[#f6c833] hover:bg-[#e0b020] text-[#120a21] font-bold border-[2px] border-black px-3 py-1.5 shadow-[2px_2px_0px_#0a0514] cursor-pointer flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">key</span>
                <span>{t.adminLoginBtn}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Notification Toast when uploaded */}
      {uploadNotice && (
        <div className="bg-[#26c281]/20 border-2 border-[#26c281] text-[#26c281] px-4 py-2 font-['Space_Mono'] text-xs font-bold flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-base">check_circle</span>
          <span>{uploadNotice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Polaroid Board (7 cols) */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`lg:col-span-7 bg-[#1f1730]/95 border-[4px] ${
            isDraggingOver ? 'border-[#26c281] ring-4 ring-[#26c281]/40' : 'border-[#5a3696]'
          } pixel-box-md p-5 relative overflow-hidden shadow-[6px_6px_0px_#0a0514] transition-all`}
        >
          <div className="flex items-center justify-between bg-[#120a21] border-b-2 border-[#5a3696] text-[#f6c833] px-3 py-2 -mx-5 -mt-5 mb-5">
            <span className="font-['Space_Mono'] text-xs font-bold uppercase flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#45b7d1]">push_pin</span>
              {t.boardHeader}
            </span>
            <div className="flex gap-1.5">
              <span className="w-3 h-3 bg-[#ef4444] inline-block border border-black" />
              <span className="w-3 h-3 bg-[#f6c833] inline-block border border-black" />
              <span className="w-3 h-3 bg-[#45b7d1] inline-block border border-black" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {polaroidList.length === 0 ? (
              isAdmin ? (
                <div
                  onClick={() => {
                    fileInputRef.current?.click();
                  }}
                  className="col-span-full bg-[#231b34]/90 border-[3px] border-dashed border-[#26c281] p-8 flex flex-col items-center justify-center text-center shadow-[4px_4px_0px_#0a0514] cursor-pointer hover:bg-[#2c2242] transition-colors group min-h-[240px]"
                >
                  <div className="w-16 h-16 bg-[#2e263f] border-2 border-[#26c281] rounded-full flex items-center justify-center mb-3 shadow-[2px_2px_0px_#0a0514] group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[#26c281] text-3xl">
                      add_photo_alternate
                    </span>
                  </div>
                  <div className="font-['Space_Grotesk'] text-base text-[#26c281] font-bold mb-1">
                    {t.emptyAdminTitle}
                  </div>
                  <p className="font-['Space_Mono'] text-xs text-[#f3eeff] max-w-md mb-3 leading-relaxed">
                    {t.emptyAdminDesc}
                  </p>
                  <div className="inline-flex items-center gap-1.5 text-xs font-['Space_Mono'] text-[#120a21] bg-[#26c281] px-3.5 py-1.5 font-bold border border-black shadow-[2px_2px_0px_#0a0514]">
                    <span className="material-symbols-outlined text-sm">upload_file</span>
                    <span>{t.emptyAdminBtn}</span>
                  </div>
                </div>
              ) : (
                <div
                  onClick={openLoginModal}
                  className="col-span-full bg-[#1c152a]/90 border-[3px] border-dashed border-[#5a3696] p-8 flex flex-col items-center justify-center text-center shadow-[4px_4px_0px_#0a0514] cursor-pointer hover:bg-[#251d38] transition-colors group min-h-[240px]"
                >
                  <div className="w-16 h-16 bg-[#120a21] border-2 border-[#5a3696] rounded-full flex items-center justify-center mb-3 shadow-[2px_2px_0px_#0a0514] group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-[#45b7d1] text-3xl">
                      shield
                    </span>
                  </div>
                  <div className="font-['Space_Grotesk'] text-base text-[#d1c5ad] font-bold mb-1">
                    {t.emptyViewerTitle}
                  </div>
                  <p className="font-['Space_Mono'] text-xs text-[#9e8cb0] max-w-md mb-3 leading-relaxed">
                    {t.emptyViewerDesc}
                  </p>
                  <div className="inline-flex items-center gap-1.5 text-xs font-['Space_Mono'] text-[#120a21] bg-[#f6c833] px-3.5 py-1.5 font-bold border border-black shadow-[2px_2px_0px_#0a0514]">
                    <span className="material-symbols-outlined text-sm">key</span>
                    <span>{t.emptyViewerBtn}</span>
                  </div>
                </div>
              )
            ) : (
              <>
                {polaroidList.map((item) => (
                  <div
                    key={item.id}
                    onClick={(e) => {
                      setSelectedPhoto(item);
                      spawnPixelBurst(e.clientX, e.clientY, 10);
                    }}
                    className={`bg-[#f3eeff] text-[#120a21] p-3 border-[3px] border-black shadow-[4px_4px_0px_#0a0514] relative transition-transform hover:scale-105 hover:rotate-0 duration-150 transform ${item.rotation} cursor-pointer group`}
                  >
                    {/* Physical Pin */}
                    <div
                      className={`absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full ${item.pinColor} border-2 border-black shadow-[1px_1px_0px_#0a0514] z-10`}
                    />

                    {/* Action buttons (available on cards) - Admin only */}
                    {isAdmin && (
                      <div className="absolute top-2 right-2 flex items-center gap-1 z-20">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingPhoto(item);
                          }}
                          title={isVi ? "Chỉnh sửa tiêu đề & thông tin" : "Edit photo title & tags"}
                          className="w-6 h-6 bg-[#f6c833] hover:bg-[#d4a414] text-[#120a21] text-xs font-bold rounded-none border border-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 cursor-pointer"
                        >
                          ✎
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleRemovePhoto(item.id, e)}
                          title={isVi ? "Gỡ ảnh này" : "Remove this photo"}
                          className="w-6 h-6 bg-[#ef4444] hover:bg-red-600 text-white text-xs font-bold rounded-none border border-black flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    )}

                    <div
                      className={`w-full h-48 overflow-hidden border border-black/20 ${
                        item.isCustomBg ? 'bg-[#22163b] flex items-center justify-center p-2' : 'bg-[#120a21]'
                      }`}
                    >
                      <img
                        src={resolvePolaroidImage(item)}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        className={`w-full h-48 ${
                          item.isCustomBg ? 'object-contain pixelated-render' : 'object-cover'
                        } group-hover:scale-105 transition-transform duration-200`}
                      />
                    </div>

                    <div className="pt-2.5 pb-1 font-['Space_Mono']">
                      <div className="text-xs font-bold text-[#1a0f2e] truncate flex items-center justify-between">
                        <span>{item.title}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-[#5a3696] font-bold mt-1">
                        <span>{item.tags.join(' ')}</span>
                        <span className={item.badgeColor}>{item.badge}</span>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Upload Button Card on Pinboard - Admin vs Viewer */}
                {isAdmin ? (
                  <div
                    onClick={() => {
                      fileInputRef.current?.click();
                    }}
                    className="bg-[#231b34] border-[3px] border-dashed border-[#26c281] p-4 flex flex-col items-center justify-center text-center shadow-[4px_4px_0px_#0a0514] cursor-pointer hover:bg-[#2c2242] transition-colors group"
                  >
                    <div className="w-12 h-12 bg-[#2e263f] border-2 border-[#26c281] rounded-full flex items-center justify-center mb-2 shadow-[2px_2px_0px_#0a0514] group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[#26c281] text-2xl">
                        add_photo_alternate
                      </span>
                    </div>
                    <div className="font-['Space_Grotesk'] text-sm text-[#26c281] font-bold mb-1">
                      {t.pinMore}
                    </div>
                    <p className="font-['Space_Mono'] text-[11px] text-[#f3eeff] mb-2 leading-relaxed">
                      {t.pinMoreDesc}
                    </p>
                    <div className="inline-flex items-center gap-1 text-[10px] font-['Space_Mono'] text-[#26c281] bg-[#120a21] px-2 py-1 border border-[#26c281] font-bold">
                      <span>{t.adminPinBadge}</span>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={openLoginModal}
                    className="bg-[#1c152a] border-[3px] border-dashed border-[#5a3696] p-4 flex flex-col items-center justify-center text-center shadow-[4px_4px_0px_#0a0514] cursor-pointer hover:bg-[#251d38] transition-colors group"
                  >
                    <div className="w-12 h-12 bg-[#120a21] border-2 border-[#5a3696] rounded-full flex items-center justify-center mb-2 shadow-[2px_2px_0px_#0a0514] group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[#45b7d1] text-2xl">
                        shield
                      </span>
                    </div>
                    <div className="font-['Space_Grotesk'] text-sm text-[#d1c5ad] font-bold mb-1">
                      {t.viewerTitle}
                    </div>
                    <p className="font-['Space_Mono'] text-[11px] text-[#9e8cb0] mb-2 leading-relaxed">
                      {t.viewerDesc}
                    </p>
                    <div className="inline-flex items-center gap-1 text-[10px] font-['Space_Mono'] text-[#f6c833] bg-[#120a21] px-2 py-1 border border-[#f6c833] font-bold">
                      <span className="material-symbols-outlined text-xs">key</span>
                      <span>{t.adminLoginBtn}</span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Guild Board & Direct Contacts (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#1f1730]/95 border-[3px] border-[#5a3696] p-5 pixel-box-sm">
            <h3 className="text-base font-bold text-[#f6c833] flex items-center gap-2">
              <span className="material-symbols-outlined text-[#45b7d1]">push_pin</span>
              {t.guildBoardTitle}
            </h3>
            <p className="font-['Space_Mono'] text-xs text-[#f3eeff] mt-2 leading-relaxed">
              {t.guildBoardDesc}
            </p>

            <div className="mt-4 pt-4 border-t-2 border-[#5a3696] space-y-2 font-['Space_Mono'] text-xs text-[#eaddff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#d93876] text-[18px]">
                  location_on
                </span>
                <span className="text-[#f3eeff]">{t.baseCamp}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#45b7d1] text-[18px]">
                  alternate_email
                </span>
                <span className="text-[#f3eeff]">vp.anh11101506@gmail.com</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f6c833] text-[18px]">
                  schedule
                </span>
                <span className="text-[#f3eeff]">{t.wakeHours}</span>
              </div>
            </div>

            {/* Direct Social Link Buttons */}
            <div className="mt-4 pt-3 border-t border-[#5a3696]/60 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onOpenContact}
                className="bg-[#231b34] hover:bg-[#2e263f] border border-[#d93876] text-[#d93876] text-[11px] font-bold px-2.5 py-1 flex items-center gap-1 pixel-btn-action cursor-pointer"
              >
                <span>📸 Instagram</span>
              </button>
              <button
                type="button"
                onClick={onOpenContact}
                className="bg-[#231b34] hover:bg-[#2e263f] border border-[#45b7d1] text-[#45b7d1] text-[11px] font-bold px-2.5 py-1 flex items-center gap-1 pixel-btn-action cursor-pointer"
              >
                <span>🌐 Facebook</span>
              </button>
              <button
                type="button"
                onClick={onOpenContact}
                className="bg-[#231b34] hover:bg-[#2e263f] border border-[#26c281] text-[#26c281] text-[11px] font-bold px-2.5 py-1 flex items-center gap-1 pixel-btn-action cursor-pointer"
              >
                <span>✈️ Telegram</span>
              </button>
            </div>
          </div>

          {/* Stickers & Stamps */}
          <div className="bg-[#1f1730]/95 border-[3px] border-[#5a3696] p-4 pixel-box-sm">
            <span className="font-['Space_Mono'] text-[11px] text-[#f6c833] block mb-2 font-bold tracking-wider uppercase flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#f6c833] text-[16px]">stars</span>
              {t.stickersTitle}
            </span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={(e) => spawnPixelBurst(e.clientX, e.clientY, 6)}
                className="border-2 border-dashed border-[#f6c833]/80 p-1.5 bg-[#231b34] hover:bg-[#2e263f] text-[#f6c833] font-['Space_Mono'] text-[10px] font-bold cursor-pointer transition-transform hover:scale-105"
              >
                ★ NAIL ART DESIGN
              </button>
              <button
                type="button"
                onClick={(e) => spawnPixelBurst(e.clientX, e.clientY, 6)}
                className="border-2 border-dashed border-[#45b7d1]/80 p-1.5 bg-[#231b34] hover:bg-[#2e263f] text-[#45b7d1] font-['Space_Mono'] text-[10px] font-bold cursor-pointer transition-transform hover:scale-105"
              >
                ★ HANDMADE CLAY DUCKS
              </button>
              <button
                type="button"
                onClick={(e) => spawnPixelBurst(e.clientX, e.clientY, 6)}
                className="border-2 border-dashed border-[#d93876]/80 p-1.5 bg-[#231b34] hover:bg-[#2e263f] text-[#d93876] font-['Space_Mono'] text-[10px] font-bold cursor-pointer transition-transform hover:scale-105"
              >
                ★ PHOTOBOOTH MOMENT
              </button>
              <button
                type="button"
                onClick={(e) => spawnPixelBurst(e.clientX, e.clientY, 6)}
                className="border-2 border-dashed border-[#26c281]/80 p-1.5 bg-[#231b34] hover:bg-[#2e263f] text-[#26c281] font-['Space_Mono'] text-[10px] font-bold cursor-pointer transition-transform hover:scale-105"
              >
                ★ BEST FRIENDS MEMORY
              </button>
              <button
                type="button"
                onClick={(e) => spawnPixelBurst(e.clientX, e.clientY, 6)}
                className="border-2 border-dashed border-[#f6c833]/80 p-1.5 bg-[#231b34] hover:bg-[#2e263f] text-[#f6c833] font-['Space_Mono'] text-[10px] font-bold cursor-pointer transition-transform hover:scale-105"
              >
                ★ CREATIVE VIBES
              </button>
              <button
                type="button"
                onClick={(e) => spawnPixelBurst(e.clientX, e.clientY, 6)}
                className="border-2 border-dashed border-[#d93876]/80 p-1.5 bg-[#231b34] hover:bg-[#2e263f] text-[#d93876] font-['Space_Mono'] text-[10px] font-bold cursor-pointer transition-transform hover:scale-105"
              >
                ★ DAILY HAPPINESS
              </button>
              <button
                type="button"
                onClick={(e) => spawnPixelBurst(e.clientX, e.clientY, 6)}
                className="border-2 border-dashed border-[#45b7d1]/80 p-1.5 bg-[#231b34] hover:bg-[#2e263f] text-[#45b7d1] font-['Space_Mono'] text-[10px] font-bold cursor-pointer transition-transform hover:scale-105"
              >
                ☀️ WARM SUNSHINE
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Lightbox / Zoom Modal for clicked photo */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="max-w-md w-full bg-[#f3eeff] text-[#120a21] p-4 border-[4px] border-black shadow-[10px_10px_0px_#0a0514] relative modal-enter-active"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-2 right-2 w-8 h-8 bg-[#ef4444] text-white font-bold flex items-center justify-center border-2 border-black shadow-[2px_2px_0px_#0a0514] cursor-pointer hover:bg-red-600"
            >
              ✕
            </button>
            <div className="w-full h-80 overflow-hidden border-2 border-black/20 bg-[#120a21] flex items-center justify-center">
              <img
                src={resolvePolaroidImage(selectedPhoto)}
                alt={selectedPhoto.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="mt-3 font-['Space_Mono']">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-[#1a0f2e]">{selectedPhoto.title}</h4>
                {isAdmin && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingPhoto(selectedPhoto);
                        setSelectedPhoto(null);
                      }}
                      className="text-xs bg-[#f6c833] text-[#120a21] px-2 py-0.5 border border-black font-bold flex items-center gap-1 cursor-pointer hover:bg-[#d4a414]"
                    >
                      <span>{isVi ? '✎ Sửa ảnh / Tiêu đề' : '✎ Edit Photo / Title'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleRemovePhoto(selectedPhoto.id, { stopPropagation: () => {} } as any);
                        setSelectedPhoto(null);
                      }}
                      className="text-xs bg-[#ef4444] text-white px-2 py-0.5 border border-black font-bold flex items-center gap-1 cursor-pointer hover:bg-red-600"
                    >
                      <span>{isVi ? '✕ Xóa ảnh' : '✕ Delete Photo'}</span>
                    </button>
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center text-xs mt-1">
                <span className="text-[#5a3696] font-bold">{selectedPhoto.tags.join(' ')}</span>
                <span className="font-bold text-[#d93876]">{selectedPhoto.badge}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pre-Upload Dialog: Chỉnh sửa tiêu đề trước khi ghim ảnh */}
      {pendingUpload && (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setPendingUpload(null)}
        >
          <div
            className="max-w-lg w-full bg-[#1f1730] text-[#f3eeff] border-[4px] border-[#26c281] shadow-[10px_10px_0px_#0a0514] relative modal-enter-active overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header bar */}
            <div className="bg-[#120a21] border-b-2 border-[#26c281] px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#26c281] font-['Space_Mono'] text-xs font-bold uppercase">
                <span className="material-symbols-outlined text-base">edit_note</span>
                <span>{isVi ? 'CHỈNH TIÊU ĐỀ ẢNH TRƯỚC KHI GHIM' : 'EDIT PHOTO TITLE BEFORE PINNING'}</span>
              </div>
              <button
                type="button"
                onClick={() => setPendingUpload(null)}
                className="w-7 h-7 bg-[#ef4444] text-white font-bold flex items-center justify-center border border-black cursor-pointer hover:bg-red-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleConfirmPendingUpload} className="p-5 space-y-4 font-['Space_Mono']">
              {/* Preview image & form input */}
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                {/* Image preview box styled like a mini polaroid */}
                <div className="w-36 h-44 bg-[#f3eeff] text-[#120a21] p-2 border-2 border-black shrink-0 shadow-[3px_3px_0px_#0a0514]">
                  <div className="w-full h-32 bg-[#120a21] overflow-hidden border border-black/20 flex items-center justify-center">
                    <img
                      src={pendingUpload.image}
                      alt="Preview"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="text-[10px] font-bold truncate mt-1 text-[#1a0f2e]">
                    {pendingUpload.title || (isVi ? 'Chưa có tên' : 'Untitled')}
                  </div>
                </div>

                <div className="flex-1 w-full space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-[#f6c833] uppercase mb-1">
                      {isVi ? '🏷️ Tiêu đề bức ảnh (Title):' : '🏷️ Photo Title:'}
                    </label>
                    <input
                      type="text"
                      autoFocus
                      required
                      value={pendingUpload.title}
                      onChange={(e) =>
                        setPendingUpload({ ...pendingUpload, title: e.target.value })
                      }
                      placeholder={isVi ? "Ví dụ: Hoàng hôn chiều tà, Sinh nhật 20 tuổi..." : "e.g. Sunset afternoon, Birthday party..."}
                      className="w-full bg-[#120a21] border-2 border-[#5a3696] focus:border-[#26c281] text-[#f3eeff] px-3 py-2 text-xs outline-none shadow-[2px_2px_0px_#0a0514]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#45b7d1] uppercase mb-1">
                      {isVi ? '🔖 Hashtag / Phân loại:' : '🔖 Hashtag / Tags:'}
                    </label>
                    <input
                      type="text"
                      value={pendingUpload.tags}
                      onChange={(e) =>
                        setPendingUpload({ ...pendingUpload, tags: e.target.value })
                      }
                      placeholder="#summer #memory #bff"
                      className="w-full bg-[#120a21] border-2 border-[#5a3696] focus:border-[#45b7d1] text-[#f3eeff] px-3 py-1.5 text-xs outline-none shadow-[2px_2px_0px_#0a0514]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#d93876] uppercase mb-1">
                      {isVi ? '⭐ Nhãn góc (Badge):' : '⭐ Corner Badge:'}
                    </label>
                    <input
                      type="text"
                      value={pendingUpload.badge}
                      onChange={(e) =>
                        setPendingUpload({ ...pendingUpload, badge: e.target.value })
                      }
                      placeholder="★ ORIGINAL, ★ MEMORY, ★ FAV"
                      className="w-full bg-[#120a21] border-2 border-[#5a3696] focus:border-[#d93876] text-[#f3eeff] px-3 py-1.5 text-xs outline-none shadow-[2px_2px_0px_#0a0514]"
                    />
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-end gap-3 pt-3 border-t border-[#5a3696]">
                <button
                  type="button"
                  onClick={() => setPendingUpload(null)}
                  className="bg-[#2e263f] hover:bg-[#3d3254] text-[#eaddff] text-xs font-bold px-4 py-2 border border-black cursor-pointer"
                >
                  {isVi ? 'HỦY BỎ' : 'CANCEL'}
                </button>
                <button
                  type="submit"
                  className="bg-[#26c281] hover:bg-[#20a36c] text-[#120a21] text-xs font-bold px-5 py-2 border-2 border-black shadow-[3px_3px_0px_#0a0514] cursor-pointer flex items-center gap-1.5 active:translate-x-0.5 active:translate-y-0.5 transition-transform"
                >
                  <span className="material-symbols-outlined text-sm">push_pin</span>
                  <span>{isVi ? 'ĐỒNG Ý GHIM LÊN BẢNG' : 'CONFIRM & PIN TO BOARD'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Photo Modal: Chỉnh sửa ảnh đã ghim */}
      {editingPhoto && (
        <div
          className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm"
          onClick={() => setEditingPhoto(null)}
        >
          <div
            className="max-w-md w-full bg-[#1f1730] text-[#f3eeff] border-[4px] border-[#f6c833] shadow-[10px_10px_0px_#0a0514] relative modal-enter-active overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#120a21] border-b-2 border-[#f6c833] px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#f6c833] font-['Space_Mono'] text-xs font-bold uppercase">
                <span className="material-symbols-outlined text-base">edit</span>
                <span>{isVi ? 'CHỈNH SỬA TIÊU ĐỀ ẢNH ĐÃ GHIM' : 'EDIT PINNED PHOTO'}</span>
              </div>
              <button
                type="button"
                onClick={() => setEditingPhoto(null)}
                className="w-7 h-7 bg-[#ef4444] text-white font-bold flex items-center justify-center border border-black cursor-pointer hover:bg-red-600"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEditPhoto} className="p-5 space-y-4 font-['Space_Mono']">
              {/* Image Preview and Changer */}
              <div>
                <label className="block text-[11px] font-bold text-[#f6c833] uppercase mb-1">
                  {isVi ? 'Hình ảnh (Nhấn để đổi ảnh mới hoặc tải từ máy):' : 'Photo Image (Click to change or upload from PC):'}
                </label>
                <div className="flex gap-3 items-center">
                  <div className="w-28 h-28 bg-[#120a21] border-2 border-black/50 overflow-hidden flex items-center justify-center shrink-0 relative group">
                    <img
                      key={editingPhoto.image}
                      src={resolvePolaroidImage(editingPhoto)}
                      alt={editingPhoto.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <label
                      htmlFor="editPhotoFileInput"
                      className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity text-white text-[10px] font-bold text-center p-1"
                    >
                      <span className="material-symbols-outlined text-lg">upload</span>
                      <span>{isVi ? 'ĐỔI ẢNH' : 'CHANGE PHOTO'}</span>
                    </label>
                  </div>

                  <div className="flex-1 space-y-2">
                    <input
                      id="editPhotoFileInput"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          try {
                            const compressed = await compressImage(file, 1200, 1200, 0.85);
                            setEditingPhoto({ ...editingPhoto, image: compressed });
                          } catch {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              const newBase64 = ev.target?.result as string;
                              if (newBase64) {
                                setEditingPhoto({ ...editingPhoto, image: newBase64 });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }
                        e.target.value = '';
                      }}
                    />
                    <label
                      htmlFor="editPhotoFileInput"
                      className="inline-flex items-center gap-1.5 bg-[#45b7d1] hover:bg-[#38a0b8] text-[#120a21] text-xs font-bold px-3 py-1.5 border border-black cursor-pointer shadow-[2px_2px_0px_#0a0514]"
                    >
                      <span className="material-symbols-outlined text-sm">upload_file</span>
                      <span>{isVi ? 'CHỌN ẢNH TỪ MÁY...' : 'BROWSE FILES...'}</span>
                    </label>

                    <div className="text-[10px] text-[#eaddff]/80">
                      {isVi ? 'Hoặc dán URL ảnh trực tiếp:' : 'Or paste direct image URL:'}
                    </div>
                    <input
                      type="url"
                      placeholder={isVi ? "https://... dán link ảnh" : "https://... paste image URL"}
                      value={editingPhoto.image.startsWith('data:') ? '' : editingPhoto.image}
                      onChange={(e) => {
                        if (e.target.value.trim()) {
                          setEditingPhoto({ ...editingPhoto, image: e.target.value.trim() });
                        }
                      }}
                      className="w-full bg-[#120a21] border border-[#5a3696] focus:border-[#45b7d1] text-[#f3eeff] px-2.5 py-1 text-xs outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#f6c833] uppercase mb-1">
                  {isVi ? 'Tiêu đề bức ảnh:' : 'Photo Title:'}
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={editingPhoto.title}
                  onChange={(e) =>
                    setEditingPhoto({ ...editingPhoto, title: e.target.value })
                  }
                  className="w-full bg-[#120a21] border-2 border-[#5a3696] focus:border-[#f6c833] text-[#f3eeff] px-3 py-2 text-xs outline-none shadow-[2px_2px_0px_#0a0514]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#45b7d1] uppercase mb-1">
                  {isVi ? 'Hashtag / Phân loại (cách nhau bởi khoảng trắng):' : 'Hashtags / Tags (space-separated):'}
                </label>
                <input
                  type="text"
                  value={editingPhoto.tags.join(' ')}
                  onChange={(e) =>
                    setEditingPhoto({
                      ...editingPhoto,
                      tags: e.target.value
                        .split(' ')
                        .filter(Boolean)
                        .map((t) => (t.startsWith('#') ? t : `#${t}`)),
                    })
                  }
                  className="w-full bg-[#120a21] border-2 border-[#5a3696] focus:border-[#45b7d1] text-[#f3eeff] px-3 py-1.5 text-xs outline-none shadow-[2px_2px_0px_#0a0514]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#d93876] uppercase mb-1">
                  {isVi ? 'Nhãn góc (Badge):' : 'Corner Badge:'}
                </label>
                <input
                  type="text"
                  value={editingPhoto.badge}
                  onChange={(e) =>
                    setEditingPhoto({ ...editingPhoto, badge: e.target.value })
                  }
                  className="w-full bg-[#120a21] border-2 border-[#5a3696] focus:border-[#d93876] text-[#f3eeff] px-3 py-1.5 text-xs outline-none shadow-[2px_2px_0px_#0a0514]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#5a3696]">
                <button
                  type="button"
                  onClick={() => setEditingPhoto(null)}
                  className="bg-[#2e263f] hover:bg-[#3d3254] text-[#eaddff] text-xs font-bold px-4 py-2 border border-black cursor-pointer"
                >
                  {isVi ? 'HỦY' : 'CANCEL'}
                </button>
                <button
                  type="submit"
                  className="bg-[#f6c833] hover:bg-[#d4a414] text-[#120a21] text-xs font-bold px-5 py-2 border-2 border-black shadow-[3px_3px_0px_#0a0514] cursor-pointer flex items-center gap-1.5"
                >
                  <span>{isVi ? 'LƯU THAY ĐỔI' : 'SAVE CHANGES'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
