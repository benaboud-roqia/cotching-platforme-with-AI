/**
 * Web Audio and speech simulation engine for synchronized sales call playback.
 */

class AudioPlaybackEngine {
  private audioCtx: AudioContext | null = null;
  private isPlaying: boolean = false;
  private currentTime: number = 0;
  private duration: number = 240;
  private timer: number | null = null;
  private playbackRate: number = 1.0;
  private onTimeUpdateCallback: ((time: number) => void) | null = null;
  private onStateChangeCallback: ((isPlaying: boolean) => void) | null = null;

  private realAudioEl: HTMLAudioElement | null = null;

  public initRealAudio(url: string) {
    if (this.realAudioEl) {
      this.realAudioEl.pause();
      this.realAudioEl = null;
    }
    this.realAudioEl = new Audio(url);
    this.realAudioEl.playbackRate = this.playbackRate;
    this.realAudioEl.ontimeupdate = () => {
      if (this.realAudioEl) {
        this.currentTime = this.realAudioEl.currentTime;
        this.onTimeUpdateCallback?.(this.currentTime);
      }
    };
    this.realAudioEl.onended = () => {
      this.isPlaying = false;
      this.onStateChangeCallback?.(false);
    };
  }

  public setDuration(dur: number) {
    this.duration = Math.max(1, dur);
  }

  public setPlaybackRate(rate: number) {
    this.playbackRate = rate;
    if (this.realAudioEl) {
      this.realAudioEl.playbackRate = rate;
    }
  }

  public onTimeUpdate(cb: (time: number) => void) {
    this.onTimeUpdateCallback = cb;
  }

  public onStateChange(cb: (isPlaying: boolean) => void) {
    this.onStateChangeCallback = cb;
  }

  public play() {
    this.isPlaying = true;
    this.onStateChangeCallback?.(true);

    if (this.realAudioEl) {
      this.realAudioEl.play().catch(() => {
        // Fallback to internal simulated timer
        this.startSimulatedTimer();
      });
    } else {
      this.startSimulatedTimer();
    }
  }

  public pause() {
    this.isPlaying = false;
    this.onStateChangeCallback?.(false);

    if (this.realAudioEl) {
      this.realAudioEl.pause();
    }
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public seek(seconds: number) {
    this.currentTime = Math.max(0, Math.min(seconds, this.duration));
    if (this.realAudioEl) {
      this.realAudioEl.currentTime = this.currentTime;
    }
    this.onTimeUpdateCallback?.(this.currentTime);
  }

  public getCurrentTime(): number {
    return this.currentTime;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  private startSimulatedTimer() {
    if (this.timer) clearInterval(this.timer);
    const intervalMs = 100;
    this.timer = window.setInterval(() => {
      if (!this.isPlaying) return;
      this.currentTime += (intervalMs / 1000) * this.playbackRate;
      if (this.currentTime >= this.duration) {
        this.currentTime = this.duration;
        this.pause();
      }
      this.onTimeUpdateCallback?.(this.currentTime);
    }, intervalMs);
  }

  public destroy() {
    this.pause();
    if (this.realAudioEl) {
      this.realAudioEl.src = '';
      this.realAudioEl = null;
    }
  }
}

export const globalAudioEngine = new AudioPlaybackEngine();

export function formatSeconds(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
