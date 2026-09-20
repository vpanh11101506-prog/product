import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { TRANSLATIONS } from '../utils/translations';

interface FooterProps {
  onOpenContact: (e?: React.MouseEvent) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenContact }) => {
  const { language } = useLanguage();
  const t = TRANSLATIONS[language].footer;

  return (
    <footer className="bg-[#120a21]/95 backdrop-blur-md border-t-[3px] border-[#5a3696] mt-16 relative z-10">
      <div className="w-full py-8 px-4 sm:px-6 max-w-[1200px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
          <span className="text-lg font-bold text-[#f6c833] font-['Space_Grotesk']">MY WORLD</span>
          <span className="hidden sm:inline text-[#5a3696]">|</span>
          <span className="text-xs font-['Space_Mono'] text-[#d1c5ad]">
            {t.copyright}
          </span>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-4 md:gap-6">
          <a
            href="#hero"
            className="text-[#d1c5ad] font-['Space_Mono'] text-xs hover:text-[#f6c833] uppercase font-bold transition-colors"
          >
            {t.worldMap}
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#d1c5ad] font-['Space_Mono'] text-xs hover:text-[#f6c833] uppercase font-bold transition-colors"
          >
            {t.sourceCode}
          </a>
          <button
            type="button"
            onClick={onOpenContact}
            className="text-[#45b7d1] font-['Space_Mono'] text-xs hover:text-[#f6c833] uppercase font-bold cursor-pointer transition-colors"
          >
            {t.contact}
          </button>
          <a
            href="#guestbook"
            className="text-[#d1c5ad] font-['Space_Mono'] text-xs hover:text-[#f6c833] uppercase font-bold transition-colors"
          >
            {t.reportBug}
          </a>
        </nav>
      </div>
    </footer>
  );
};
