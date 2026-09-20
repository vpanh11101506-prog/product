import React, { useEffect, useState } from 'react';
import { audioSynth } from '../utils/audioSynth';
import { spawnPixelBurst } from '../utils/fx';
import { useLanguage } from '../context/LanguageContext';
import { getBilingualHobbyItems, TRANSLATIONS } from '../utils/translations';
import { HobbyItem } from '../types';

interface HobbiesZoneProps {
  friendshipHearts?: number;
  onSendLove?: (e?: React.MouseEvent) => void;
}

export const HobbiesZone: React.FC<HobbiesZoneProps> = () => {
  const { language, isVi } = useLanguage();
  const t = TRANSLATIONS[language].hobbies;
  const hobbyItems = getBilingualHobbyItems(isVi);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    return audioSynth.subscribe((playing, seconds) => {
      setIsPlaying(playing);
      setElapsed(seconds);
    });
  }, []);

  const handleTogglePlay = (e: React.MouseEvent) => {
    audioSynth.toggle();
    spawnPixelBurst(e.clientX, e.clientY, 8);
  };

  const handleRestart = (e: React.MouseEvent) => {
    audioSynth.restart();
    spawnPixelBurst(e.clientX, e.clientY, 8);
  };

  const handleHobbyClick = (e: React.MouseEvent) => {
    spawnPixelBurst(e.clientX, e.clientY, 6);
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = (elapsed % 60) / 60 * 100;

  return (
    <section className="space-y-6" id="hobbies">
      {/* Header */}
      <div className="flex items-center justify-between border-b-[3px] border-[#5a3696] pb-2">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#f6c833] text-2xl">
            stadia_controller
          </span>
          <h2 className="text-xl md:text-2xl font-['Space_Grotesk'] text-[#f6c833] arcade-glow-gold uppercase font-bold">
            {t.sectionTitle}
          </h2>
        </div>
        <span className="font-['Space_Mono'] text-xs text-[#f3eeff] font-bold">
          {t.subtitle}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Tape Player Widget (5 cols) */}
        <div className="md:col-span-5 bg-[#1f1730]/95 border-[3px] border-[#5a3696] p-5 pixel-box-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 border-b-2 border-[#5a3696] pb-2">
              <span className="font-['Space_Mono'] text-xs text-[#f6c833] font-bold uppercase">
                {t.tapePlayerTitle}
              </span>
              <span
                className={`w-3 h-3 rounded-full ${
                  isPlaying ? 'bg-[#26c281] animate-ping' : 'bg-[#d93876]'
                }`}
              />
            </div>

            <div className="bg-[#231b34] border-[3px] border-[#5a3696] p-4 mb-4">
              <div className="flex justify-between items-center bg-[#120a21] text-[#f3eeff] border border-[#5a3696] px-3 py-1 font-['Space_Mono'] text-xs mb-3">
                <span className="truncate font-bold text-[#f6c833] text-xs">
                  {t.sideA}
                </span>
                <span className="text-[#45b7d1] font-bold shrink-0 ml-2">
                  {formatTime(elapsed)}
                </span>
              </div>

              <div className="flex justify-around items-center py-4 bg-[#2e263f] border-[2px] border-[#5a3696]">
                {/* Left Reel */}
                <div
                  className={`w-12 h-12 rounded-full border-[3px] border-[#5a3696] bg-[#231b34] flex items-center justify-center ${
                    isPlaying ? 'spinning-reel' : ''
                  }`}
                >
                  <div className="w-5 h-5 bg-[#f6c833] rounded-full border border-black" />
                </div>

                {/* Progress Bar & Status */}
                <div className="flex flex-col items-center gap-1 w-24">
                  <div className="h-2 w-full bg-[#120a21] border border-[#5a3696] p-0.5">
                    <div
                      className="h-full bg-[#26c281] transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                  <span
                    className={`text-[9px] font-['Space_Mono'] uppercase font-bold ${
                      isPlaying ? 'text-[#26c281] animate-pulse' : 'text-[#d93876]'
                    }`}
                  >
                    {isPlaying ? t.playingStatus : t.pausedStatus}
                  </span>
                </div>

                {/* Right Reel */}
                <div
                  className={`w-12 h-12 rounded-full border-[3px] border-[#5a3696] bg-[#231b34] flex items-center justify-center ${
                    isPlaying ? 'spinning-reel' : ''
                  }`}
                >
                  <div className="w-5 h-5 bg-[#f6c833] rounded-full border border-black" />
                </div>
              </div>
            </div>

            <p className="font-['Space_Mono'] text-xs text-[#d1c5ad] text-center">
              {t.lofiNote}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 mt-4">
            <button
              type="button"
              onClick={handleTogglePlay}
              className="bg-[#f6c833] text-[#120a21] font-bold border-[2px] border-black font-['Space_Mono'] text-xs px-4 py-2 pixel-btn-action flex items-center gap-2 uppercase cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                {isPlaying ? 'pause' : 'play_arrow'}
              </span>
              <span>{isPlaying ? t.pause : t.play}</span>
            </button>

            <button
              type="button"
              onClick={handleRestart}
              className="bg-[#231b34] text-[#f3eeff] border-[2px] border-[#5a3696] font-['Space_Mono'] text-xs px-3 py-2 pixel-btn-action flex items-center cursor-pointer"
              title={t.replayTooltip}
            >
              <span className="material-symbols-outlined text-[18px]">replay</span>
            </button>
          </div>
        </div>

        {/* Hobbies Chips (7 cols) */}
        <div className="md:col-span-7 space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {hobbyItems.map((hobby: HobbyItem) => (
              <div
                key={hobby.id}
                onClick={handleHobbyClick}
                className={`bg-[#1f1730]/95 border-[2px] border-[#5a3696] p-3 pixel-box-sm flex items-center gap-2 cursor-pointer ${hobby.hoverColor} transition-colors`}
              >
                <span className="material-symbols-outlined text-lg text-[#f6c833]">
                  {hobby.icon}
                </span>
                <span className="font-['Space_Mono'] text-xs text-[#f3eeff] font-bold">
                  {hobby.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
