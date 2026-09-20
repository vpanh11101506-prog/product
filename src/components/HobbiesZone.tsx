import React, { useEffect, useRef, useState } from 'react';
import { audioSynth, CURRENT_TAPE_TRACK } from '../utils/audioSynth';
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
  const [duration, setDuration] = useState(210); // ~3:30
  const [viewMode, setViewMode] = useState<'cassette' | 'video'>('cassette');
  const [volume, setVolume] = useState(audioSynth.getVolume());
  const [isMuted, setIsMuted] = useState(audioSynth.isMuted());

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const isSeekingRef = useRef(false);

  // Subscribe to central tape player state
  useEffect(() => {
    return audioSynth.subscribe((playing, seconds, totalDuration) => {
      setIsPlaying(playing);
      if (!isSeekingRef.current) {
        setElapsed(seconds);
      }
      if (totalDuration > 0) {
        setDuration(totalDuration);
      }
    });
  }, []);

  // Initialize YouTube Player API
  useEffect(() => {
    let isCancelled = false;

    const setupPlayer = () => {
      if (isCancelled || !iframeRef.current) return;
      audioSynth.setIframe(iframeRef.current);

      try {
        if ((window as any).YT && (window as any).YT.Player) {
          const player = new (window as any).YT.Player('youtube-tape-player-iframe', {
            events: {
              onReady: (event: any) => {
                if (!isCancelled) {
                  audioSynth.registerYouTubePlayer(event.target, iframeRef.current);
                }
              },
              onStateChange: (event: any) => {
                if (!isCancelled) {
                  audioSynth.handleYouTubeStateChange(event.data);
                }
              },
            },
          });
          audioSynth.registerYouTubePlayer(player, iframeRef.current);
        }
      } catch {
        // Fallback gracefully to postMessage control
      }
    };

    if (!(window as any).YT || !(window as any).YT.Player) {
      if (!document.getElementById('yt-iframe-api')) {
        const tag = document.createElement('script');
        tag.id = 'yt-iframe-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        document.body.appendChild(tag);
      }
      const existingCb = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        if (existingCb) existingCb();
        setupPlayer();
      };
    } else {
      setupPlayer();
    }

    // Listen to postMessages from YouTube iframe
    const handleMessage = (e: MessageEvent) => {
      try {
        if (typeof e.data === 'string') {
          const data = JSON.parse(e.data);
          if (data.event === 'infoDelivery' && data.info) {
            if (typeof data.info.playerState === 'number') {
              audioSynth.handleYouTubeStateChange(data.info.playerState);
            }
          }
        }
      } catch {
        // Ignore non-json messages
      }
    };
    window.addEventListener('message', handleMessage);

    return () => {
      isCancelled = true;
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const handleTogglePlay = (e: React.MouseEvent) => {
    audioSynth.toggle();
    spawnPixelBurst(e.clientX, e.clientY, 8);
  };

  const handleRestart = (e: React.MouseEvent) => {
    audioSynth.restart();
    spawnPixelBurst(e.clientX, e.clientY, 8);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setElapsed(newTime);
    audioSynth.seekTo(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    audioSynth.setVolume(val);
    setIsMuted(val === 0);
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    audioSynth.toggleMute();
    setIsMuted(audioSynth.isMuted());
    spawnPixelBurst(e.clientX, e.clientY, 5);
  };

  const handleHobbyClick = (e: React.MouseEvent) => {
    spawnPixelBurst(e.clientX, e.clientY, 6);
  };

  const formatTime = (totalSec: number) => {
    const safeSec = Math.max(0, Math.floor(totalSec));
    const m = Math.floor(safeSec / 60);
    const s = safeSec % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const progressPercent = duration > 0 ? Math.min(100, (elapsed / duration) * 100) : 0;

  return (
    <section className="space-y-6" id="hobbies">
      {/* Section Header */}
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
        {/* Retro Tape Player Widget (5 cols) */}
        <div className="md:col-span-5 bg-[#1f1730]/95 border-[3px] border-[#5a3696] p-5 pixel-box-md flex flex-col justify-between">
          <div>
            {/* Header & View Switcher */}
            <div className="flex items-center justify-between mb-3 border-b-2 border-[#5a3696] pb-2">
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full border border-black ${
                    isPlaying ? 'bg-[#26c281] shadow-[0_0_8px_#26c281]' : 'bg-[#d93876]'
                  }`}
                />
                <span className="font-['Space_Mono'] text-xs text-[#f6c833] font-bold uppercase tracking-wider">
                  {t.tapePlayerTitle}
                </span>
              </div>

              {/* View Switcher: Cassette vs Video */}
              <div className="flex items-center bg-[#120a21] border border-[#5a3696] p-0.5">
                <button
                  type="button"
                  onClick={() => setViewMode('cassette')}
                  className={`px-2 py-0.5 text-[10px] font-['Space_Mono'] font-bold transition-colors cursor-pointer ${
                    viewMode === 'cassette'
                      ? 'bg-[#f6c833] text-[#120a21]'
                      : 'text-[#d1c5ad] hover:text-[#f3eeff]'
                  }`}
                  title={t.cassetteMode}
                >
                  {t.cassetteMode}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('video')}
                  className={`px-2 py-0.5 text-[10px] font-['Space_Mono'] font-bold transition-colors cursor-pointer ${
                    viewMode === 'video'
                      ? 'bg-[#45b7d1] text-[#120a21]'
                      : 'text-[#d1c5ad] hover:text-[#f3eeff]'
                  }`}
                  title={t.videoMode}
                >
                  {t.videoMode}
                </button>
              </div>
            </div>

            {/* Cassette Deck Shell */}
            <div className="bg-[#231b34] border-[3px] border-[#5a3696] p-3 sm:p-4 mb-3 relative overflow-hidden shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]">
              {/* Cassette Corner Screws */}
              <div className="absolute top-1.5 left-1.5 w-2 h-2 rounded-full bg-[#120a21] border border-[#5a3696] flex items-center justify-center text-[7px] text-[#5a3696] font-mono leading-none select-none">
                +
              </div>
              <div className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#120a21] border border-[#5a3696] flex items-center justify-center text-[7px] text-[#5a3696] font-mono leading-none select-none">
                +
              </div>
              <div className="absolute bottom-1.5 left-1.5 w-2 h-2 rounded-full bg-[#120a21] border border-[#5a3696] flex items-center justify-center text-[7px] text-[#5a3696] font-mono leading-none select-none">
                +
              </div>
              <div className="absolute bottom-1.5 right-1.5 w-2 h-2 rounded-full bg-[#120a21] border border-[#5a3696] flex items-center justify-center text-[7px] text-[#5a3696] font-mono leading-none select-none">
                +
              </div>

              {/* Title & Time Display Bar */}
              <div className="flex justify-between items-center bg-[#120a21] text-[#f3eeff] border border-[#5a3696] px-3 py-1.5 font-['Space_Mono'] text-xs mb-3 shadow-[inset_0_1px_4px_rgba(0,0,0,0.6)]">
                <div className="flex items-center gap-1.5 min-w-0 pr-2">
                  <span className="material-symbols-outlined text-xs text-[#45b7d1] shrink-0 animate-pulse">
                    music_note
                  </span>
                  <span className="truncate font-bold text-[#f6c833] text-[11px] sm:text-xs">
                    {t.sideA}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0 font-bold font-mono text-[11px] text-[#45b7d1]">
                  <span>{formatTime(elapsed)}</span>
                  <span className="text-[#5a3696]">/</span>
                  <span className="text-[#a78bfa]">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Video Player Frame */}
              <div
                className={
                  viewMode === 'video'
                    ? 'relative w-full aspect-video bg-black border-2 border-[#5a3696] mb-2 shadow-[0_0_10px_rgba(69,183,209,0.3)]'
                    : 'fixed -top-[9999px] -left-[9999px] w-[320px] h-[180px] pointer-events-none opacity-0 z-[-1]'
                }
              >
                <iframe
                  ref={iframeRef}
                  id="youtube-tape-player-iframe"
                  src={`https://www.youtube-nocookie.com/embed/${CURRENT_TAPE_TRACK.id}?enablejsapi=1&playsinline=1&rel=0&modestbranding=1&origin=${encodeURIComponent(
                    typeof window !== 'undefined' ? window.location.origin : ''
                  )}`}
                  title="Blue and You - Mad Honey"
                  className="w-full h-full object-cover"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              {/* Cassette Tape Spools (Visible when viewMode === 'cassette') */}
              <div
                className={`relative bg-[#2e263f] border-[2px] border-[#5a3696] p-3 rounded-sm ${
                  viewMode === 'cassette' ? 'block' : 'hidden'
                }`}
              >
                {/* Background YouTube iframe hidden safely so audio continues seamlessly */}
                <div className="absolute top-0 left-0 w-1 h-1 opacity-0 pointer-events-none overflow-hidden">
                  {/* Keep iframe mounted in the same place via state if viewMode changes */}
                </div>

                <div className="flex justify-around items-center py-2">
                  {/* Left Cassette Reel */}
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border-[3px] border-[#5a3696] bg-[#1a1226] flex items-center justify-center shadow-[inset_0_0_8px_rgba(0,0,0,0.8)] ${
                        isPlaying ? 'spinning-reel' : ''
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full border-2 border-[#5a3696] bg-[#231b34] flex items-center justify-center">
                        <div className="w-4 h-4 bg-[#f6c833] rounded-full border border-black relative">
                          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-black" />
                          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-black" />
                        </div>
                      </div>
                    </div>
                    <span className="text-[8px] font-['Space_Mono'] font-bold text-[#8a7a9e]">
                      FEED
                    </span>
                  </div>

                  {/* Center Acrylic Window: Tape Loop & Pixel VU Equalizer */}
                  <div className="flex flex-col items-center gap-1.5 w-32 sm:w-36 bg-[#160e22] border border-[#5a3696] p-2 rounded shadow-inner">
                    {/* Retro Equalizer Spectrum Bars */}
                    <div className="flex items-end justify-center gap-1 h-7 w-full px-1">
                      {[40, 75, 95, 60, 85, 50, 90, 65].map((height, i) => (
                        <div
                          key={i}
                          className="w-2 bg-[#120a21] border border-[#3e2764] h-full flex items-end p-0.5"
                        >
                          <div
                            className={`w-full transition-all duration-150 ${
                              isPlaying
                                ? i % 2 === 0
                                  ? 'bg-[#26c281]'
                                  : 'bg-[#f6c833]'
                                : 'bg-[#5a3696]'
                            }`}
                            style={{
                              height: isPlaying
                                ? `${Math.max(15, (height + (i * 12) % 40) % 100)}%`
                                : '15%',
                            }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Tape Status Text */}
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isPlaying ? 'bg-[#26c281] animate-ping' : 'bg-[#d93876]'
                        }`}
                      />
                      <span
                        className={`text-[10px] font-['Space_Mono'] uppercase font-bold tracking-wider ${
                          isPlaying ? 'text-[#26c281]' : 'text-[#d93876]'
                        }`}
                      >
                        {isPlaying ? t.playingStatus : t.pausedStatus}
                      </span>
                    </div>
                  </div>

                  {/* Right Cassette Reel */}
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full border-[3px] border-[#5a3696] bg-[#1a1226] flex items-center justify-center shadow-[inset_0_0_8px_rgba(0,0,0,0.8)] ${
                        isPlaying ? 'spinning-reel' : ''
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full border-2 border-[#5a3696] bg-[#231b34] flex items-center justify-center">
                        <div className="w-4 h-4 bg-[#f6c833] rounded-full border border-black relative">
                          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 bg-black" />
                          <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-black" />
                        </div>
                      </div>
                    </div>
                    <span className="text-[8px] font-['Space_Mono'] font-bold text-[#8a7a9e]">
                      TAKE-UP
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Slider (Interactive scrub) */}
              <div className="mt-3">
                <div className="flex items-center justify-between text-[9px] font-['Space_Mono'] text-[#a78bfa] mb-1">
                  <span>TRACK PROGRESS</span>
                  <span>{Math.round(progressPercent)}%</span>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="range"
                    min={0}
                    max={duration || 210}
                    value={elapsed}
                    onChange={handleSeek}
                    className="w-full h-2 bg-[#120a21] border border-[#5a3696] rounded-none appearance-none cursor-pointer accent-[#f6c833]"
                  />
                </div>
              </div>
            </div>

            {/* Note & Direct YouTube Link */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-1 text-center sm:text-left">
              <p className="font-['Space_Mono'] text-xs text-[#d1c5ad]">
                {t.lofiNote}
              </p>
              <a
                href={CURRENT_TAPE_TRACK.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-['Space_Mono'] text-[11px] font-bold text-[#ef4444] hover:text-[#f6c833] hover:underline transition-colors shrink-0"
                title={t.openYoutube}
              >
                <span className="material-symbols-outlined text-sm">smart_display</span>
                <span>{t.openYoutube}</span>
              </a>
            </div>
          </div>

          {/* Control Bar: Play / Pause / Replay / Volume */}
          <div className="space-y-3 mt-4 pt-3 border-t border-[#5a3696]">
            {/* Primary Action Buttons */}
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleTogglePlay}
                className="bg-[#f6c833] hover:bg-[#ffda55] text-[#120a21] font-bold border-[2px] border-black font-['Space_Mono'] text-xs px-5 py-2.5 pixel-btn-action flex items-center gap-2 uppercase cursor-pointer transition-transform"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
                <span className="tracking-wider">{isPlaying ? t.pause : t.play}</span>
              </button>

              <button
                type="button"
                onClick={handleRestart}
                className="bg-[#231b34] hover:bg-[#34274d] text-[#f3eeff] border-[2px] border-[#5a3696] font-['Space_Mono'] text-xs px-3.5 py-2.5 pixel-btn-action flex items-center gap-1 cursor-pointer"
                title={t.replayTooltip}
              >
                <span className="material-symbols-outlined text-[18px]">replay</span>
                <span className="hidden sm:inline text-[11px] font-bold">RESTART</span>
              </button>
            </div>

            {/* Volume & Mute Row */}
            <div className="flex items-center justify-center gap-2 max-w-xs mx-auto pt-1">
              <button
                type="button"
                onClick={handleToggleMute}
                className="text-[#d1c5ad] hover:text-[#f6c833] p-1 cursor-pointer transition-colors"
                title={isMuted ? 'Bật tiếng' : 'Tắt tiếng'}
              >
                <span className="material-symbols-outlined text-lg">
                  {isMuted || volume === 0 ? 'volume_off' : 'volume_up'}
                </span>
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-24 sm:w-32 h-1.5 bg-[#120a21] border border-[#5a3696] rounded-none appearance-none cursor-pointer accent-[#26c281]"
                title={`Âm lượng: ${volume}%`}
              />
              <span className="font-['Space_Mono'] text-[10px] text-[#45b7d1] font-bold w-7 text-right">
                {isMuted ? '0%' : `${volume}%`}
              </span>
            </div>
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
