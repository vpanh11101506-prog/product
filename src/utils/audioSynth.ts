export interface TrackInfo {
  id: string;
  title: string;
  artist: string;
  youtubeUrl: string;
  embedUrl: string;
}

export const CURRENT_TAPE_TRACK: TrackInfo = {
  id: 'lXosxmFYjbw',
  title: 'Blue and You - Mad Honey',
  artist: 'Mad Honey',
  youtubeUrl: 'https://www.youtube.com/watch?v=lXosxmFYjbw',
  embedUrl: 'https://www.youtube-nocookie.com/embed/lXosxmFYjbw?enablejsapi=1&playsinline=1&rel=0&modestbranding=1',
};

type Listener = (isPlaying: boolean, elapsedSeconds: number, duration: number) => void;

class RetroTapePlayer {
  private audioCtx: AudioContext | null = null;
  private isPlaying = false;
  private elapsedSeconds = 0;
  private duration = 210; // Default estimate ~3:30, updated live by YouTube player
  private volume = 80;
  private muted = false;
  private listeners: Set<Listener> = new Set();
  private ytPlayer: any = null;
  private progressTimer: number | null = null;
  private iframeEl: HTMLIFrameElement | null = null;

  public subscribe(fn: Listener): () => void {
    this.listeners.add(fn);
    fn(this.isPlaying, Math.floor(this.elapsedSeconds), Math.floor(this.duration));
    return () => this.listeners.delete(fn);
  }

  private notify() {
    this.listeners.forEach((fn) =>
      fn(this.isPlaying, Math.floor(this.elapsedSeconds), Math.floor(this.duration))
    );
  }

  /**
   * Đăng ký tham chiếu tới YouTube Player hoặc Iframe
   */
  public registerYouTubePlayer(player: any, iframe?: HTMLIFrameElement | null) {
    this.ytPlayer = player;
    if (iframe) this.iframeEl = iframe;

    if (this.ytPlayer && typeof this.ytPlayer.getDuration === 'function') {
      const dur = this.ytPlayer.getDuration();
      if (dur && dur > 0) {
        this.duration = dur;
      }
    }
  }

  public setIframe(iframe: HTMLIFrameElement | null) {
    this.iframeEl = iframe;
  }

  public handleYouTubeStateChange(state: number) {
    // 1: PLAYING, 2: PAUSED, 0: ENDED, 3: BUFFERING
    if (state === 1) {
      this.isPlaying = true;
      this.startProgressTimer();
    } else if (state === 2) {
      this.isPlaying = false;
      this.stopProgressTimer();
    } else if (state === 0) {
      // Khi bài hát kết thúc -> lặp lại (loop cassette)
      this.isPlaying = false;
      this.stopProgressTimer();
      this.restart();
      return;
    }
    this.updateCurrentTimeFromYT();
    this.notify();
  }

  private startProgressTimer() {
    if (this.progressTimer) window.clearInterval(this.progressTimer);
    this.progressTimer = window.setInterval(() => {
      this.updateCurrentTimeFromYT();
    }, 500);
  }

  private stopProgressTimer() {
    if (this.progressTimer) {
      window.clearInterval(this.progressTimer);
      this.progressTimer = null;
    }
  }

  private updateCurrentTimeFromYT() {
    if (this.ytPlayer) {
      try {
        if (typeof this.ytPlayer.getCurrentTime === 'function') {
          const cur = this.ytPlayer.getCurrentTime();
          if (typeof cur === 'number' && !isNaN(cur)) {
            this.elapsedSeconds = cur;
          }
        }
        if (typeof this.ytPlayer.getDuration === 'function') {
          const dur = this.ytPlayer.getDuration();
          if (typeof dur === 'number' && dur > 0) {
            this.duration = dur;
          }
        }
      } catch {
        // Safe catch
      }
    } else {
      if (this.isPlaying) {
        this.elapsedSeconds += 0.5;
      }
    }
    this.notify();
  }

  public play() {
    this.isPlaying = true;
    if (this.ytPlayer) {
      try {
        this.ytPlayer.playVideo();
      } catch {
        // Fallback postMessage
        this.sendIframeCommand('playVideo');
      }
    } else {
      this.sendIframeCommand('playVideo');
    }
    this.startProgressTimer();
    this.notify();
  }

  public pause() {
    this.isPlaying = false;
    if (this.ytPlayer) {
      try {
        this.ytPlayer.pauseVideo();
      } catch {
        this.sendIframeCommand('pauseVideo');
      }
    } else {
      this.sendIframeCommand('pauseVideo');
    }
    this.stopProgressTimer();
    this.notify();
  }

  public toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  public restart() {
    this.elapsedSeconds = 0;
    if (this.ytPlayer) {
      try {
        this.ytPlayer.seekTo(0, true);
        this.ytPlayer.playVideo();
      } catch {
        this.sendIframeCommand('seekTo', [0, true]);
        this.sendIframeCommand('playVideo');
      }
    } else {
      this.sendIframeCommand('seekTo', [0, true]);
      this.sendIframeCommand('playVideo');
    }
    this.isPlaying = true;
    this.startProgressTimer();
    this.notify();
  }

  public seekTo(seconds: number) {
    this.elapsedSeconds = seconds;
    if (this.ytPlayer) {
      try {
        this.ytPlayer.seekTo(seconds, true);
      } catch {
        this.sendIframeCommand('seekTo', [seconds, true]);
      }
    } else {
      this.sendIframeCommand('seekTo', [seconds, true]);
    }
    this.notify();
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(100, vol));
    if (this.ytPlayer) {
      try {
        this.ytPlayer.setVolume(this.volume);
        if (this.volume > 0 && this.muted) {
          this.muted = false;
          this.ytPlayer.unMute();
        }
      } catch {
        this.sendIframeCommand('setVolume', [this.volume]);
      }
    }
    this.notify();
  }

  public getVolume() {
    return this.volume;
  }

  public toggleMute() {
    this.muted = !this.muted;
    if (this.ytPlayer) {
      try {
        if (this.muted) {
          this.ytPlayer.mute();
        } else {
          this.ytPlayer.unMute();
        }
      } catch {
        this.sendIframeCommand(this.muted ? 'mute' : 'unMute');
      }
    }
    this.notify();
  }

  public isMuted() {
    return this.muted;
  }

  private sendIframeCommand(func: string, args: any[] = []) {
    if (this.iframeEl && this.iframeEl.contentWindow) {
      try {
        this.iframeEl.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func,
            args,
          }),
          '*'
        );
      } catch {
        // ignore
      }
    }
  }

  public getStatus() {
    return {
      isPlaying: this.isPlaying,
      elapsedSeconds: Math.floor(this.elapsedSeconds),
      duration: Math.floor(this.duration),
      volume: this.volume,
      isMuted: this.muted,
      track: CURRENT_TAPE_TRACK,
    };
  }

  /**
   * Âm thanh bíp ngắn cổ điển (retro 8-bit UI button beep)
   */
  private initAudioCtx() {
    if (!this.audioCtx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  public playButtonBeep(type: 'beep' | 'coin' | 'select' | 'pop' = 'beep') {
    try {
      this.initAudioCtx();
      if (!this.audioCtx) return;

      const now = this.audioCtx.currentTime;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      if (type === 'coin') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(987.77, now);
        osc.frequency.setValueAtTime(1318.51, now + 0.08);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.09, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
        return;
      }

      if (type === 'select') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(660, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
        return;
      }

      if (type === 'pop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(850, now + 0.05);

        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);
        osc.start(now);
        osc.stop(now + 0.07);
        return;
      }

      osc.type = 'square';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(540, now + 0.045);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(0.07, now + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch {
      // AudioContext may be blocked before interaction
    }
  }
}

export const audioSynth = new RetroTapePlayer();
export const tapePlayer = audioSynth;

export function playRetroBeep(type?: 'beep' | 'coin' | 'select' | 'pop') {
  audioSynth.playButtonBeep(type);
}
