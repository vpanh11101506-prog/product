import React, { useState, useRef, useEffect } from 'react';
import { AVATAR_URL } from '../data/portfolioData';
import { spawnPixelBurst } from '../utils/fx';
import { ChibiViewer } from './ChibiViewer';
import { fetchPortfolioState, saveServerAvatar, resetServerAvatar } from '../utils/portfolioApi';
import { compressImage } from '../utils/imageCompressor';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { TRANSLATIONS } from '../utils/translations';

interface HeroSectionProps {
  onOpenContact: (e?: React.MouseEvent) => void;
  onSendLove?: (e?: React.MouseEvent) => void;
}

const AVATAR_STORAGE_KEY = 'pa_custom_avatar_v2';

export const HeroSection: React.FC<HeroSectionProps> = ({ onOpenContact }) => {
  const { isAdmin, openLoginModal } = useAuth();
  const { language, isVi } = useLanguage();
  const t = TRANSLATIONS[language].hero;
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const [avatarSrc, setAvatarSrc] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(AVATAR_STORAGE_KEY);
      if (saved && saved.trim()) return saved;
    } catch {
      // ignore storage error
    }
    return AVATAR_URL;
  });
  const [avatarNotice, setAvatarNotice] = useState<string | null>(null);
  const [isSavingServer, setIsSavingServer] = useState(false);
  const [showUrlDialog, setShowUrlDialog] = useState(false);
  const [customUrlInput, setCustomUrlInput] = useState('');

  // Tải ảnh mới nhất từ máy chủ để bất kỳ ai mở link cũng thấy ảnh mới của bạn
  useEffect(() => {
    let isMounted = true;
    fetchPortfolioState().then((state) => {
      if (isMounted && state.avatarUrl) {
        setAvatarSrc(state.avatarUrl);
        try {
          localStorage.setItem(AVATAR_STORAGE_KEY, state.avatarUrl);
        } catch {
          // ignore
        }
      }
    });

    const interval = setInterval(() => {
      fetchPortfolioState().then((state) => {
        if (isMounted && state.avatarUrl && state.avatarUrl !== avatarSrc) {
          setAvatarSrc(state.avatarUrl);
          try {
            localStorage.setItem(AVATAR_STORAGE_KEY, state.avatarUrl);
          } catch {
            // ignore
          }
        }
      }).catch(() => {});
    }, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const [isAvatarDragOver, setIsAvatarDragOver] = useState(false);

  const processAvatarFile = async (file: File) => {
    if (!isAdmin) {
      setAvatarNotice('🛡️ Bạn đang ở chế độ Người xem (Viewer). Chỉ Admin (Phương Anh) mới có quyền đổi ảnh!');
      openLoginModal();
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn tệp hình ảnh (.jpg, .png, .webp, ...)!');
      return;
    }

    setIsSavingServer(true);
    setAvatarNotice('Đang tối ưu và lưu ảnh lên máy chủ... ⏳');

    try {
      const compressedBase64 = await compressImage(file, 800, 800, 0.88);
      setAvatarSrc(compressedBase64);
      try {
        localStorage.setItem(AVATAR_STORAGE_KEY, compressedBase64);
      } catch {
        // ignore quota
      }

      const res = await saveServerAvatar(compressedBase64);
      setIsSavingServer(false);
      if (res.success && res.avatarUrl) {
        setAvatarSrc(res.avatarUrl);
        try {
          localStorage.setItem(AVATAR_STORAGE_KEY, res.avatarUrl);
        } catch {
          // ignore
        }
        setAvatarNotice('✨ ĐÃ CẬP NHẬT ẢNH THÀNH CÔNG! Bất kỳ ai mở link này đều sẽ thấy ảnh mới của bạn!');
      } else {
        setAvatarNotice('✨ Đã cập nhật ảnh đại diện!');
      }
      setTimeout(() => setAvatarNotice(null), 5000);
    } catch (err) {
      console.error('Avatar upload error:', err);
      setIsSavingServer(false);
      setAvatarNotice('⚠️ Lỗi khi xử lý ảnh đại diện');
      setTimeout(() => setAvatarNotice(null), 4000);
    }
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processAvatarFile(file);
    }
    e.target.value = '';
  };

  const handleSaveUrlAvatar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      setAvatarNotice('🛡️ Bạn đang ở chế độ Người xem (Viewer). Vui lòng đăng nhập Admin!');
      openLoginModal();
      return;
    }
    const cleanUrl = customUrlInput.trim();
    if (!cleanUrl) return;

    setIsSavingServer(true);
    setAvatarNotice('Đang lưu link ảnh lên máy chủ... ⏳');
    setAvatarSrc(cleanUrl);
    setShowUrlDialog(false);
    setCustomUrlInput('');

    try {
      localStorage.setItem(AVATAR_STORAGE_KEY, cleanUrl);
    } catch {
      // ignore
    }

    const res = await saveServerAvatar(cleanUrl);
    setIsSavingServer(false);
    if (res.success) {
      setAvatarNotice('✨ ĐÃ LƯU ẢNH LÊN MÁY CHỦ! Người khác bấm link sẽ thấy ngay ảnh mới này!');
    } else {
      setAvatarNotice('✨ Đã cập nhật ảnh đại diện mới!');
    }
    setTimeout(() => setAvatarNotice(null), 5000);
  };

  const handleResetAvatar = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAdmin) {
      setAvatarNotice('🛡️ Bạn đang ở chế độ Người xem (Viewer). Vui lòng đăng nhập Admin!');
      openLoginModal();
      return;
    }
    setIsSavingServer(true);
    setAvatarSrc(AVATAR_URL);
    try {
      localStorage.removeItem(AVATAR_STORAGE_KEY);
    } catch {
      // ignore
    }
    await resetServerAvatar();
    setIsSavingServer(false);
    setAvatarNotice('Đã khôi phục ảnh đại diện ban đầu!');
    setTimeout(() => setAvatarNotice(null), 3000);
  };

  const handleStageClick = (e: React.MouseEvent) => {
    spawnPixelBurst(e.clientX, e.clientY, 8);
  };

  const handleAvatarClick = (e: React.MouseEvent) => {
    spawnPixelBurst(e.clientX, e.clientY, 10);
  };

  return (
    <section className="relative" id="hero">
      {/* Hidden Avatar File Input */}
      <input
        ref={avatarInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAvatarFileChange}
      />

      {/* Stage Badge & Personal Use Badge */}
      <div className="mb-4 flex flex-wrap items-center gap-2.5">
        <div
          className="inline-flex items-center gap-2 bg-[#1f1730]/90 border-[3px] border-[#5a3696] px-4 py-2 pixel-box-sm cursor-pointer"
          onClick={handleStageClick}
        >
          <span className="w-3 h-3 bg-[#26c281] border border-black inline-block animate-ping" />
          <span className="font-['Space_Mono'] text-xs text-[#26c281] uppercase tracking-wider font-bold">
            {t.stageBadge}
          </span>
        </div>

        <div className="inline-flex items-center gap-1.5 bg-[#120a21]/90 border-[2px] border-[#f6c833] px-3 py-1.5 pixel-box-sm shadow-[2px_2px_0px_#0a0514]">
          <span className="material-symbols-outlined text-[15px] text-[#f6c833]">lock_person</span>
          <span className="font-['Space_Mono'] text-[11px] text-[#f6c833] font-bold tracking-wider uppercase">
            {isVi ? 'PERSONAL USE • PHI THƯƠNG MẠI' : 'PERSONAL USE • NON-COMMERCIAL'}
          </span>
        </div>
      </div>

      {avatarNotice && (
        <div className="mb-4 bg-[#26c281] text-[#120a21] border-2 border-black px-4 py-2 text-xs font-['Space_Mono'] font-bold flex items-center justify-between shadow-[3px_3px_0px_#0a0514] animate-bounce">
          <span>✨ {avatarNotice}</span>
          <button type="button" onClick={() => setAvatarNotice(null)} className="font-bold ml-2">✕</button>
        </div>
      )}

      {/* Main Profile Box */}
      <div className="bg-[#1f1730]/95 backdrop-blur-sm border-[4px] border-[#6c3fb5] pixel-box-lg p-6 md:p-8 relative overflow-hidden shadow-[6px_6px_0px_#0a0514]">
        {/* Header Ribbon */}
        <div className="flex flex-wrap items-center justify-between border-b-[3px] border-[#5a3696] pb-4 mb-6 gap-4 bg-[#231b34] -mx-6 -mt-6 md:-mx-8 md:-mt-8 p-4 md:px-8">
          <div className="flex items-center gap-3">
            <span className="font-['Space_Mono'] text-xs bg-[#120a21] text-[#f6c833] border border-[#5a3696] px-2.5 py-1 select-none font-bold">
              CHAR_STATUS.EXE
            </span>
            <span className="font-['Space_Mono'] text-xs text-[#f3eeff]">
              Class: Creative Code Paladin // Alignment: Chaotic Creative
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-[#ef4444] border-2 border-black inline-block" />
            <span className="w-4 h-4 bg-[#f6c833] border-2 border-black inline-block" />
            <span className="w-4 h-4 bg-[#45b7d1] border-2 border-black inline-block" />
          </div>
        </div>

        {/* Main Grid: Avatar & Chibi vs Stats & Bio */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Avatar Column */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div
              className={`relative group ${isAdmin ? 'cursor-pointer' : 'cursor-default'}`}
              onClick={() => {
                if (!isAdmin) {
                  setAvatarNotice(t.viewerProtected);
                  openLoginModal();
                  return;
                }
                avatarInputRef.current?.click();
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (isAdmin) {
                  setIsAvatarDragOver(true);
                }
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setIsAvatarDragOver(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsAvatarDragOver(false);
                if (!isAdmin) {
                  setAvatarNotice(t.viewerProtected);
                  openLoginModal();
                  return;
                }
                const dropped = e.dataTransfer.files?.[0];
                if (dropped) processAvatarFile(dropped);
              }}
            >
              <div className="absolute -top-4 -right-3 z-10 bg-[#f6c833] border-[3px] border-black px-3 py-1 font-['Space_Mono'] text-xs text-[#120a21] font-bold shadow-[3px_3px_0px_#0a0514]">
                LV. 19 ★
              </div>
              <div
                className={`w-56 h-56 md:w-64 md:h-64 bg-[#2e263f] border-[4px] ${
                  isAvatarDragOver ? 'border-[#26c281] ring-4 ring-[#26c281]/50' : 'border-[#f6c833]'
                } shadow-[6px_6px_0px_#0a0514] p-3 relative overflow-hidden flex items-center justify-center transition-all`}
              >
                <img
                  key={avatarSrc}
                  src={avatarSrc}
                  alt="Phương Anh Avatar"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover border-[3px] border-[#5a3696] bg-[#120a21] select-none group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Hover Overlay Button to change avatar - Admin only */}
                {isAdmin && (
                  <div className="absolute inset-x-3 bottom-8 bg-[#120a21]/90 hover:bg-[#f6c833] text-[#f6c833] hover:text-[#120a21] border border-[#f6c833] py-1 font-['Space_Mono'] text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1 cursor-pointer">
                    <span className="material-symbols-outlined text-sm">photo_camera</span>
                    <span>{t.uploadPhotoBtn}</span>
                  </div>
                )}

                <div className="absolute bottom-2 left-2 right-2 bg-[#120a21]/95 text-[#f6c833] text-center py-0.5 font-['Space_Mono'] text-[10px] select-none border border-[#5a3696] font-bold">
                  STATUS: {isVi ? 'ĐANG ONLINE & KHÁM PHÁ THẾ GIỚI SỐ' : 'ONLINE & EXPLORING DIGITAL REALMS'}
                </div>
              </div>
            </div>

            {/* Avatar controls: Admin vs Viewer */}
            {isAdmin ? (
              <>
                <div className="mt-2 flex flex-wrap justify-center items-center gap-2">
                  <button
                    type="button"
                    disabled={isSavingServer}
                    onClick={() => avatarInputRef.current?.click()}
                    className="bg-[#26c281] hover:bg-[#20a36c] text-[#120a21] text-[11px] font-['Space_Mono'] font-bold px-3 py-1.5 border border-black shadow-[2px_2px_0px_#0a0514] flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    title={t.uploadPhotoBtn}
                  >
                    <span className="material-symbols-outlined text-xs">upload</span>
                    <span>{isSavingServer ? t.saving : `📷 ${t.uploadPhotoBtn}`}</span>
                  </button>
                  <button
                    type="button"
                    disabled={isSavingServer}
                    onClick={() => setShowUrlDialog(true)}
                    className="bg-[#f6c833] hover:bg-[#e0b020] text-[#120a21] text-[11px] font-['Space_Mono'] font-bold px-2.5 py-1.5 border border-black shadow-[2px_2px_0px_#0a0514] flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-xs">link</span>
                    <span>{t.pasteUrlBtn}</span>
                  </button>
                  {avatarSrc !== AVATAR_URL && (
                    <button
                      type="button"
                      disabled={isSavingServer}
                      onClick={handleResetAvatar}
                      title={t.resetAvatarTooltip}
                      className="bg-[#2e263f] hover:bg-[#ef4444] hover:text-white text-[#d1c5ad] text-[11px] font-['Space_Mono'] font-bold px-2 py-1.5 border border-black shadow-[2px_2px_0px_#0a0514] cursor-pointer disabled:opacity-50"
                    >
                      {t.resetAvatarBtn}
                    </button>
                  )}
                </div>

                <div className="mt-1.5 text-[10px] font-['Space_Mono'] text-[#26c281] text-center max-w-xs flex items-center justify-center gap-1">
                  <span>👑</span>
                  <span>{t.adminNotice}</span>
                </div>
              </>
            ) : (
              <div className="mt-2.5 flex flex-col items-center gap-1.5 text-center">
                <div className="flex items-center gap-1.5 text-[11px] font-['Space_Mono'] text-[#d1c5ad] bg-[#120a21] border border-[#5a3696] px-3 py-1">
                  <span className="material-symbols-outlined text-[#45b7d1] text-xs">shield</span>
                  <span>{t.viewerProtected}</span>
                </div>
                <button
                  type="button"
                  onClick={openLoginModal}
                  className="text-[11px] font-['Space_Mono'] text-[#f6c833] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xs">key</span>
                  <span>{t.viewerLoginHint}</span>
                </button>
              </div>
            )}

            {/* URL Dialog Modal */}
            {showUrlDialog && (
              <div
                className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
                onClick={() => setShowUrlDialog(false)}
              >
                <div
                  className="bg-[#1f1730] border-[3px] border-[#f6c833] pixel-box-sm p-5 w-full max-w-md shadow-[6px_6px_0px_#0a0514]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center justify-between border-b-2 border-[#5a3696] pb-2 mb-3">
                    <h3 className="text-sm font-bold text-[#f6c833] font-['Space_Grotesk'] flex items-center gap-2">
                      <span className="material-symbols-outlined text-base">link</span>
                      <span>{t.pasteModalTitle}</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowUrlDialog(false)}
                      className="text-[#eaddff] hover:text-[#ef4444] font-bold text-sm"
                    >
                      ✕
                    </button>
                  </div>
                  <form onSubmit={handleSaveUrlAvatar} className="space-y-3 font-['Space_Mono']">
                    <p className="text-xs text-[#eaddff]">
                      {t.pasteModalDesc}
                    </p>
                    <input
                      type="url"
                      required
                      placeholder="https://example.com/my-photo.jpg"
                      value={customUrlInput}
                      onChange={(e) => setCustomUrlInput(e.target.value)}
                      className="w-full bg-[#120a21] border-2 border-[#5a3696] focus:border-[#f6c833] text-xs text-[#f3eeff] px-3 py-2 outline-none"
                    />
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowUrlDialog(false)}
                        className="px-3 py-1 bg-[#2e263f] text-xs text-[#d1c5ad] border border-black cursor-pointer"
                      >
                        {t.cancel}
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1 bg-[#f6c833] hover:bg-[#d4a414] text-xs text-[#120a21] font-bold border border-black shadow-[2px_2px_0px_#000] cursor-pointer"
                      >
                        {t.saveToServer}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Achievement Badges Strip */}
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="bg-[#2e263f] border-[2px] border-[#5a3696] px-2.5 py-1 font-['Space_Mono'] text-[11px] flex items-center gap-1 shadow-[2px_2px_0px_#0a0514] text-[#f3eeff] font-bold">
                {t.badges.nerd}
              </span>
              <span className="bg-[#2e263f] border-[2px] border-[#5a3696] px-2.5 py-1 font-['Space_Mono'] text-[11px] flex items-center gap-1 shadow-[2px_2px_0px_#0a0514] text-[#f3eeff] font-bold">
                {t.badges.nightOwl}
              </span>
            </div>

            {/* Chibi Controller */}
            <ChibiViewer />
          </div>

          {/* Stats & Bio Column */}
          <div className="lg:col-span-7 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-[#f6c833] font-['Space_Mono'] text-xs font-bold">
                <span className="material-symbols-outlined text-[18px]">token</span>
                {t.playerName}
              </div>
              <h1 className="text-2xl md:text-3xl font-['Space_Grotesk'] text-[#f6c833] arcade-title-shadow mt-1 font-extrabold">
                {t.welcomeTitle}
              </h1>
              <p className="font-['Space_Mono'] text-sm text-[#f3eeff] mt-2 leading-relaxed">
                {t.bio}
              </p>
            </div>

            {/* RPG Stat Bars */}
            <div className="space-y-3 bg-[#231b34] border-[3px] border-[#5a3696] p-4 pixel-box-sm">
              <div>
                <div className="flex justify-between items-center mb-1 font-['Space_Mono'] text-xs text-[#f3eeff] font-bold">
                  <span className="flex items-center gap-1.5 text-[#26c281]">
                    <span className="material-symbols-outlined text-[16px]">favorite</span>
                    {t.hpLabel}
                  </span>
                  <span className="text-[#26c281]">50 / 100</span>
                </div>
                <div className="h-4 w-full bg-[#120a21] border-[2px] border-[#5a3696] p-0.5">
                  <div
                    className="h-full bg-[#26c281] shadow-[0_0_8px_rgba(38,194,129,0.6)] transition-all duration-500"
                    style={{ width: '50%' }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1 font-['Space_Mono'] text-xs text-[#f3eeff] font-bold">
                  <span className="flex items-center gap-1.5 text-[#d93876]">
                    <span className="material-symbols-outlined text-[16px]">coffee</span>
                    {t.mpLabel}
                  </span>
                  <span className="text-[#d93876]">33 / 100</span>
                </div>
                <div className="h-4 w-full bg-[#120a21] border-[2px] border-[#5a3696] p-0.5">
                  <div
                    className="h-full bg-[#d93876] shadow-[0_0_8px_rgba(217,56,118,0.6)] transition-all duration-500"
                    style={{ width: '33%' }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1 font-['Space_Mono'] text-xs text-[#f3eeff] font-bold">
                  <span className="flex items-center gap-1.5 text-[#f6c833]">
                    <span className="material-symbols-outlined text-[16px]">military_tech</span>
                    {t.expLabel}
                  </span>
                  <span className="text-[#f6c833]">2,500 / 10,000 XP</span>
                </div>
                <div className="h-4 w-full bg-[#120a21] border-[2px] border-[#5a3696] p-0.5">
                  <div
                    className="h-full bg-[#f6c833] shadow-[0_0_8px_rgba(246,200,51,0.6)] transition-all duration-500"
                    style={{ width: '25%' }}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons: Liên Hệ Trực Tiếp */}
            <div className="flex flex-wrap gap-4 pt-2">
              <button
                type="button"
                id="heroContactBtn"
                onClick={onOpenContact}
                className="bg-[#f6c833] hover:bg-[#e0b020] text-[#120a21] border-[3px] border-black px-7 py-3.5 pixel-btn-action flex items-center gap-2.5 font-bold tracking-wider uppercase cursor-pointer shadow-[0_0_16px_rgba(246,200,51,0.4)] hover:scale-105 transition-all font-['Space_Mono'] text-sm"
              >
                <span className="material-symbols-outlined text-[22px]">
                  forward_to_inbox
                </span>
                <span>{t.directContactBtn}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
