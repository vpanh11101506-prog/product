import React, { useEffect } from 'react';
import { SOCIAL_LINKS } from '../data/portfolioData';
import { spawnPixelBurst } from '../utils/fx';
import { useLanguage } from '../context/LanguageContext';
import { TRANSLATIONS } from '../utils/translations';

interface SocialModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SocialModal: React.FC<SocialModalProps> = ({ isOpen, onClose }) => {
  const { language, isVi } = useLanguage();
  const t = TRANSLATIONS[language].social;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleLinkClick = (e: React.MouseEvent) => {
    spawnPixelBurst(e.clientX, e.clientY, 8);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
      onClick={handleOverlayClick}
    >
      <div
        role="dialog"
        aria-labelledby="modalTitle"
        aria-modal="true"
        className="w-full max-w-lg bg-[#1f1730]/98 border-[4px] border-[#f6c833] shadow-[10px_10px_0px_#0a0514] pixel-box-lg relative overflow-hidden modal-enter-active"
      >
        {/* Retro Window Top Header Bar */}
        <div className="bg-[#39304a] border-b-[3px] border-[#f6c833] px-4 py-2.5 flex items-center justify-between select-none">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#ef4444] border border-black inline-block animate-pulse" />
            <span className="w-3 h-3 bg-[#f6c833] border border-black inline-block" />
            <span className="w-3 h-3 bg-[#26c281] border border-black inline-block" />
            <span
              className="font-['Space_Mono'] text-xs text-[#f6c833] font-extrabold uppercase tracking-wider ml-1"
              id="modalTitle"
            >
              COMMUNICATION_LINK.EXE
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 bg-[#ef4444] hover:bg-red-600 text-white font-bold flex items-center justify-center border-[2px] border-black shadow-[2px_2px_0px_#0a0514] active:translate-x-0.5 active:translate-y-0.5 transition-transform text-sm cursor-pointer"
            title="Đóng (ESC)"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Title Banner */}
          <div className="text-center space-y-2 border-b-2 border-dashed border-[#5a3696]/80 pb-4">
            <div className="inline-flex items-center gap-2 bg-[#231b34] border-2 border-[#5a3696] px-3 py-1 text-[#f6c833] font-['Space_Mono'] text-xs font-bold shadow-[2px_2px_0px_#0a0514]">
              <span>{t.badge}</span>
              <span>•</span>
              <span className="text-[#26c281]">{t.status}</span>
            </div>
            <h3 className="text-xl md:text-2xl font-['Space_Grotesk'] text-[#f6c833] arcade-title-shadow uppercase font-extrabold">
              {t.title}
            </h3>
            <p className="text-xs text-[#f3eeff] font-['Space_Mono'] max-w-sm mx-auto">
              {t.desc}
            </p>
          </div>

          {/* 3 Rich Social Links */}
          <div className="space-y-3">
            {SOCIAL_LINKS.map((link) => {
              const btnLabel = isVi ? link.btnText : (link.type === 'telegram' ? t.chatNow : t.visit);
              return (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleLinkClick}
                  className="group bg-[#231b34] hover:bg-[#2e263f] border-[3px] border-[#5a3696] p-3.5 pixel-btn-action flex items-center justify-between transition-all duration-150 block text-decoration-none"
                >
                  <div className="flex items-center gap-3.5">
                    {/* Icon Logo */}
                    {link.type === 'instagram' && (
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] border-[2px] border-black flex items-center justify-center shadow-[3px_3px_0px_#0a0514] group-hover:scale-110 group-hover:rotate-3 transition-transform shrink-0">
                        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.44-1.44z" />
                        </svg>
                      </div>
                    )}
                    {link.type === 'facebook' && (
                      <div className="w-12 h-12 rounded-xl bg-[#1877f2] border-[2px] border-black flex items-center justify-center shadow-[3px_3px_0px_#0a0514] group-hover:scale-110 group-hover:rotate-3 transition-transform shrink-0">
                        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                      </div>
                    )}
                    {link.type === 'telegram' && (
                      <div className="w-12 h-12 rounded-xl bg-[#229ed9] border-[2px] border-black flex items-center justify-center shadow-[3px_3px_0px_#0a0514] group-hover:scale-110 group-hover:rotate-3 transition-transform shrink-0">
                        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.34-.694.34l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.46c.537-.194 1.006.131.851.866z" />
                        </svg>
                      </div>
                    )}

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-['Space_Grotesk'] text-sm text-[#f6c833] font-bold">
                          {link.name}
                        </h4>
                        <span
                          className={`text-[9px] font-['Space_Mono'] ${link.badgeBg} px-1.5 py-0.2 font-bold uppercase`}
                        >
                          {link.subtitle}
                        </span>
                      </div>
                      <p className="font-['Space_Mono'] text-xs text-[#f3eeff]">{link.handle}</p>
                    </div>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 ${link.btnBg} text-white font-['Space_Mono'] text-xs font-bold px-3 py-1.5 border-2 border-black shadow-[2px_2px_0px_#0a0514] group-hover:scale-105 transition-all`}
                  >
                    <span>{btnLabel}</span>
                    <span className="material-symbols-outlined text-[14px]">north_east</span>
                  </span>
                </a>
              );
            })}
          </div>

          {/* Modal Footer */}
          <div className="pt-3 border-t-2 border-[#5a3696] flex items-center justify-between text-xs font-['Space_Mono']">
            <span className="text-[#d1c5ad] flex items-center gap-1 font-bold">
              <span className="material-symbols-outlined text-[#f6c833] text-[15px]">info</span>
              {t.newTabInfo}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="bg-[#2e263f] hover:bg-[#39304a] text-[#f6c833] px-3 py-1.5 border border-[#5a3696] font-bold uppercase pixel-btn-action text-[10px]"
            >
              {t.closeBtn}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
