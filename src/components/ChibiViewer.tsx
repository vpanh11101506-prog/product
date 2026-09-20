import React, { useEffect, useState } from 'react';
import { CHIBI_THUMBS } from '../data/portfolioData';
import { ChibiDirection } from '../types';
import { spawnPixelBurst } from '../utils/fx';
import { useLanguage } from '../context/LanguageContext';
import { getBilingualChibiData, TRANSLATIONS } from '../utils/translations';

const DIR_KEYS: ChibiDirection[] = ['front', 'left', 'back', 'right'];

export const ChibiViewer: React.FC = () => {
  const [direction, setDirection] = useState<ChibiDirection>('front');
  const [isAutoTurning, setIsAutoTurning] = useState(false);
  const { language, isVi } = useLanguage();
  const t = TRANSLATIONS[language].chibi;

  useEffect(() => {
    if (!isAutoTurning) return;
    const interval = setInterval(() => {
      setDirection((prev) => {
        const nextIdx = (DIR_KEYS.indexOf(prev) + 1) % DIR_KEYS.length;
        return DIR_KEYS[nextIdx];
      });
    }, 2200);

    return () => clearInterval(interval);
  }, [isAutoTurning]);

  const currentInfo = getBilingualChibiData(direction, isVi);

  const handleSelectDirection = (dir: ChibiDirection, e?: React.MouseEvent) => {
    setDirection(dir);
    if (e) {
      spawnPixelBurst(e.clientX, e.clientY, 6);
    }
  };

  const handleCycleDirection = (e: React.MouseEvent) => {
    const nextIdx = (DIR_KEYS.indexOf(direction) + 1) % DIR_KEYS.length;
    handleSelectDirection(DIR_KEYS[nextIdx], e);
  };

  const handleToggleAutoTurn = (e: React.MouseEvent) => {
    setIsAutoTurning((prev) => !prev);
    spawnPixelBurst(e.clientX, e.clientY, 6);
  };

  return (
    <div className="mt-4 w-full bg-[#231b34] border-[3px] border-[#5a3696] p-3 pixel-box-sm relative overflow-hidden flex flex-col items-center">
      {/* Header Bar */}
      <div className="w-full flex items-center justify-between pb-1.5 mb-2 border-b border-[#5a3696]/70 text-[10px] font-['Space_Mono']">
        <span className="text-[#f6c833] font-bold flex items-center gap-1.5">
          <span className="w-2 h-2 bg-[#26c281] rounded-full animate-ping" />
          {t.spriteHeader}
        </span>
        <span className="text-[#45b7d1] font-bold tracking-wider uppercase">
          {currentInfo.label}
        </span>
      </div>

      {/* Main Chibi Stage + D-Pad Controls */}
      <div className="w-full grid grid-cols-12 gap-3 items-center bg-[#120a21]/80 border border-[#5a3696]/60 p-2.5">
        {/* Left Stage */}
        <div className="col-span-7 flex flex-col items-center justify-center relative min-h-[140px]">
          <div className="mb-1 bg-[#2e263f] border-2 border-[#f6c833] px-2 py-0.5 text-[10px] font-['Space_Mono'] text-[#f6c833] rounded shadow-[2px_2px_0px_#0a0514] font-bold text-center select-none">
            {currentInfo.quote}
          </div>

          <div
            className="relative cursor-pointer group flex flex-col items-center select-none mt-1"
            onClick={handleCycleDirection}
            title={t.touchHint}
          >
            <div className="w-[96px] h-[112px] relative overflow-hidden flex items-center justify-center">
              <img
                src={currentInfo.img}
                alt={`Phương Anh Chibi ${direction}`}
                className="pixelated-render w-full h-full object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)]"
              />
            </div>
            <div className="w-16 h-2 bg-black/60 rounded-full mx-auto -mt-1 blur-[0.5px]" />
          </div>
          <span className="text-[9px] font-['Space_Mono'] text-[#d1c5ad] mt-1">
            {t.touchHint}
          </span>
        </div>

        {/* Right Controls: D-Pad & Toggles */}
        <div className="col-span-5 flex flex-col items-center justify-center gap-2 border-l border-[#5a3696]/60 pl-2">
          {/* D-Pad Buttons */}
          <div className="grid grid-cols-3 gap-1 w-24">
            <div />
            <button
              type="button"
              onClick={(e) => handleSelectDirection('back', e)}
              className={`dpad-btn bg-[#2e263f] text-[#f3eeff] h-7 flex items-center justify-center text-xs font-bold ${
                direction === 'back' ? 'active-dpad' : ''
              }`}
              title={t.directions.back}
            >
              ▲
            </button>
            <div />
            <button
              type="button"
              onClick={(e) => handleSelectDirection('left', e)}
              className={`dpad-btn bg-[#2e263f] text-[#f3eeff] h-7 flex items-center justify-center text-xs font-bold ${
                direction === 'left' ? 'active-dpad' : ''
              }`}
              title={t.directions.left}
            >
              ◄
            </button>
            <button
              type="button"
              onClick={(e) => handleSelectDirection('front', e)}
              className={`dpad-btn bg-[#2e263f] text-[#f6c833] h-7 flex items-center justify-center text-[10px] font-bold ${
                direction === 'front' ? 'active-dpad' : ''
              }`}
              title={t.directions.front}
            >
              ●
            </button>
            <button
              type="button"
              onClick={(e) => handleSelectDirection('right', e)}
              className={`dpad-btn bg-[#2e263f] text-[#f3eeff] h-7 flex items-center justify-center text-xs font-bold ${
                direction === 'right' ? 'active-dpad' : ''
              }`}
              title={t.directions.right}
            >
              ►
            </button>
            <div />
            <button
              type="button"
              onClick={(e) => handleSelectDirection('front', e)}
              className="dpad-btn bg-[#2e263f] text-[#f3eeff] h-7 flex items-center justify-center text-xs font-bold"
              title={t.directions.front}
            >
              ▼
            </button>
            <div />
          </div>

          {/* Toggle Switches */}
          <div className="w-full flex flex-col gap-1.5 mt-1">
            <button
              type="button"
              onClick={handleToggleAutoTurn}
              className="w-full bg-[#2e263f] border border-[#5a3696] py-1 px-1.5 text-[9px] font-['Space_Mono'] text-[#45b7d1] font-bold flex items-center justify-center gap-1 pixel-btn-action cursor-pointer"
            >
              <span className="material-symbols-outlined text-[13px]">autorenew</span>
              <span>{isAutoTurning ? t.autoTurnOn : t.autoTurnOff}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Angle Thumbnails */}
      <div className="w-full mt-2 pt-2 border-t border-[#5a3696]/40">
        <div className="grid grid-cols-4 gap-1.5">
          {DIR_KEYS.map((key) => {
            const thumb = CHIBI_THUMBS[key];
            const isActive = direction === key;
            const dirLabel = t.directions[key];
            return (
              <button
                key={key}
                type="button"
                onClick={(e) => handleSelectDirection(key, e)}
                className={`bg-[#2e263f] p-1 flex flex-col items-center justify-center cursor-pointer transition-all ${
                  isActive
                    ? 'border-2 border-[#f6c833] scale-105'
                    : 'border border-[#5a3696] opacity-80 hover:opacity-100'
                }`}
              >
                <img
                  src={thumb.img}
                  alt={dirLabel}
                  className="pixelated-render w-9 h-9 object-contain"
                />
                <span
                  className={`text-[8px] font-['Space_Mono'] font-bold uppercase mt-0.5 ${
                    isActive ? 'text-[#f6c833]' : 'text-[#f3eeff]'
                  }`}
                >
                  {dirLabel}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
