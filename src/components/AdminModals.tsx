import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { playRetroBeep } from '../utils/audioSynth';
import { useLanguage } from '../context/LanguageContext';
import { TRANSLATIONS } from '../utils/translations';

export const AdminModals: React.FC = () => {
  const { language } = useLanguage();
  const t = TRANSLATIONS[language].admin;

  const {
    isLoginModalOpen,
    closeLoginModal,
    login,
    isPasswordModalOpen,
    closePasswordModal,
    changePassword,
  } = useAuth();

  // Login state
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Change password state
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [changeError, setChangeError] = useState<string | null>(null);
  const [changeSuccess, setChangeSuccess] = useState<string | null>(null);
  const [isChangingPass, setIsChangingPass] = useState(false);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPass.trim()) return;

    setIsLoggingIn(true);
    setLoginError(null);
    const res = await login(loginPass.trim());
    setIsLoggingIn(false);

    if (res.success) {
      playRetroBeep('coin');
      setLoginPass('');
    } else {
      playRetroBeep('pop');
      setLoginError(res.error || t.wrongPass);
    }
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setChangeError(null);
    setChangeSuccess(null);

    if (newPass.length < 4) {
      setChangeError(t.minChars);
      playRetroBeep('pop');
      return;
    }

    if (newPass !== confirmNewPass) {
      setChangeError(t.mismatch);
      playRetroBeep('pop');
      return;
    }

    setIsChangingPass(true);
    const res = await changePassword(currentPass, newPass);
    setIsChangingPass(false);

    if (res.success) {
      playRetroBeep('coin');
      setChangeSuccess(t.successChange);
      setCurrentPass('');
      setNewPass('');
      setConfirmNewPass('');
      setTimeout(() => {
        setChangeSuccess(null);
        closePasswordModal();
      }, 2500);
    } else {
      playRetroBeep('pop');
      setChangeError(res.error || t.cannotChange);
    }
  };

  return (
    <>
      {/* Admin Login Modal */}
      {isLoginModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in"
          onClick={closeLoginModal}
        >
          <div
            className="bg-[#1f1730] border-[4px] border-[#f6c833] pixel-box-sm p-6 w-full max-w-md shadow-[8px_8px_0px_#0a0514] font-['Space_Mono'] relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-[#5a3696] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f6c833] text-xl">admin_panel_settings</span>
                <h3 className="text-base font-extrabold text-[#f6c833] font-['Space_Grotesk'] tracking-wider">
                  {t.loginTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={closeLoginModal}
                className="text-[#eaddff] hover:text-[#ef4444] font-bold text-base px-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Explanation */}
            <div className="text-xs text-[#eaddff]/90 space-y-2 mb-4 bg-[#120a21] border border-[#5a3696] p-3">
              <p className="flex items-center gap-1.5 text-[#45b7d1] font-bold">
                <span className="material-symbols-outlined text-sm">shield</span>
                <span>{t.privacyTitle}</span>
              </p>
              <p>
                {t.privacyDesc}
              </p>
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="mb-4 bg-[#ef4444]/20 border-2 border-[#ef4444] text-[#ff8080] text-xs p-2.5 flex items-center gap-2 font-bold">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{loginError}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#d1c5ad] uppercase mb-1">
                  {t.passLabel}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    autoFocus
                    placeholder={t.passPlaceholder}
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    className="w-full bg-[#120a21] border-2 border-[#5a3696] focus:border-[#f6c833] text-sm text-[#f3eeff] px-3 py-2 pr-10 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#d1c5ad] hover:text-[#f6c833] text-sm cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-lg">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeLoginModal}
                  className="px-4 py-2 bg-[#2e263f] text-xs text-[#d1c5ad] border border-black cursor-pointer hover:bg-[#3d3254]"
                >
                  {t.closeBtn}
                </button>
                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="px-5 py-2 bg-[#f6c833] hover:bg-[#e0b020] text-xs text-[#120a21] font-bold border-2 border-black shadow-[3px_3px_0px_#0a0514] cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">key</span>
                  <span>{isLoggingIn ? t.verifying : t.confirmBtn}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Change Password Modal */}
      {isPasswordModalOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in"
          onClick={closePasswordModal}
        >
          <div
            className="bg-[#1f1730] border-[4px] border-[#45b7d1] pixel-box-sm p-6 w-full max-w-md shadow-[8px_8px_0px_#0a0514] font-['Space_Mono'] relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b-2 border-[#5a3696] pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#45b7d1] text-xl">lock_reset</span>
                <h3 className="text-base font-extrabold text-[#45b7d1] font-['Space_Grotesk'] tracking-wider">
                  {t.changePassTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={closePasswordModal}
                className="text-[#eaddff] hover:text-[#ef4444] font-bold text-base px-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {changeError && (
              <div className="mb-4 bg-[#ef4444]/20 border-2 border-[#ef4444] text-[#ff8080] text-xs p-2.5 flex items-center gap-2 font-bold">
                <span className="material-symbols-outlined text-base">error</span>
                <span>{changeError}</span>
              </div>
            )}

            {changeSuccess && (
              <div className="mb-4 bg-[#26c281]/20 border-2 border-[#26c281] text-[#26c281] text-xs p-2.5 flex items-center gap-2 font-bold animate-pulse">
                <span className="material-symbols-outlined text-base">check_circle</span>
                <span>{changeSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-[#d1c5ad] uppercase mb-1">
                  {t.currentPassLabel}
                </label>
                <input
                  type="password"
                  placeholder={t.currentPassPlaceholder}
                  value={currentPass}
                  onChange={(e) => setCurrentPass(e.target.value)}
                  className="w-full bg-[#120a21] border-2 border-[#5a3696] focus:border-[#45b7d1] text-xs text-[#f3eeff] px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#d1c5ad] uppercase mb-1">
                  {t.newPassLabel}
                </label>
                <input
                  type="password"
                  required
                  placeholder={t.newPassPlaceholder}
                  value={newPass}
                  onChange={(e) => setNewPass(e.target.value)}
                  className="w-full bg-[#120a21] border-2 border-[#5a3696] focus:border-[#45b7d1] text-xs text-[#f3eeff] px-3 py-2 outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#d1c5ad] uppercase mb-1">
                  {t.confirmNewPassLabel}
                </label>
                <input
                  type="password"
                  required
                  placeholder={t.confirmNewPassPlaceholder}
                  value={confirmNewPass}
                  onChange={(e) => setConfirmNewPass(e.target.value)}
                  className="w-full bg-[#120a21] border-2 border-[#5a3696] focus:border-[#45b7d1] text-xs text-[#f3eeff] px-3 py-2 outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={closePasswordModal}
                  className="px-4 py-2 bg-[#2e263f] text-xs text-[#d1c5ad] border border-black cursor-pointer hover:bg-[#3d3254]"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  disabled={isChangingPass}
                  className="px-5 py-2 bg-[#45b7d1] hover:bg-[#38a0b8] text-xs text-[#120a21] font-bold border-2 border-black shadow-[3px_3px_0px_#0a0514] cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-sm">save</span>
                  <span>{isChangingPass ? t.saving : t.updateBtn}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
