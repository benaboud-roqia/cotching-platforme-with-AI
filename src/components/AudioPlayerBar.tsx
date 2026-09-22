import React from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  VolumeX,
  Gauge,
  User,
  UserCheck,
} from 'lucide-react';
import { formatSeconds } from '../utils/audioEngine';
import { TranscriptEntry } from '../types';

interface AudioPlayerBarProps {
  isPlaying: boolean;
  onTogglePlay: () => void;
  currentTime: number;
  totalDuration: number;
  onSeek: (seconds: number) => void;
  playbackRate: number;
  onPlaybackRateChange: (rate: number) => void;
  repName: string;
  prospectName: string;
  transcript: TranscriptEntry[];
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  isPlaying,
  onTogglePlay,
  currentTime,
  totalDuration,
  onSeek,
  playbackRate,
  onPlaybackRateChange,
  repName,
  prospectName,
  transcript,
}) => {
  // Find who is speaking at current timestamp
  const currentSpeakerTurn = transcript.find((t, index) => {
    const nextT = transcript[index + 1];
    const endTime = nextT ? nextT.timestampSeconds : totalDuration;
    return currentTime >= t.timestampSeconds && currentTime < endTime;
  });

  const isSpeakerA = currentSpeakerTurn?.speaker === 'Speaker A';

  return (
    <div id="audio-player-bar" className="sticky bottom-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-white px-4 py-3 shadow-2xl">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left: Active speaker indicator */}
        <div className="flex items-center gap-3 w-full md:w-1/4">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all ${
              currentSpeakerTurn
                ? isSpeakerA
                  ? 'bg-indigo-600/30 border-indigo-400 text-indigo-300'
                  : 'bg-emerald-600/30 border-emerald-400 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {isSpeakerA ? <User className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
          </div>

          <div className="min-w-0">
            <div className="text-xs font-bold truncate text-slate-100 flex items-center gap-1.5">
              {currentSpeakerTurn ? (
                <>
                  <span className={`w-1.5 h-1.5 rounded-full ${isSpeakerA ? 'bg-indigo-400' : 'bg-emerald-400'} animate-pulse`} />
                  <span>{currentSpeakerTurn.speaker} ({currentSpeakerTurn.speakerName})</span>
                </>
              ) : (
                <span className="text-slate-400">Audio Synchronized</span>
              )}
            </div>
            <div className="text-[11px] text-slate-400 truncate">
              {currentSpeakerTurn ? currentSpeakerTurn.speakerRole : `${repName} vs ${prospectName}`}
            </div>
          </div>
        </div>

        {/* Center: Controls & Scrubber */}
        <div className="flex-1 w-full max-w-xl flex flex-col items-center gap-1.5">
          {/* Buttons */}
          <div className="flex items-center gap-4">
            <button
              id="player-btn-back10"
              onClick={() => onSeek(Math.max(0, currentTime - 10))}
              title="Rewind 10 seconds"
              className="p-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              id="player-btn-playpause"
              onClick={onTogglePlay}
              className="w-10 h-10 rounded-full bg-white hover:bg-slate-200 text-slate-900 flex items-center justify-center shadow-lg transition-transform hover:scale-105"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            <button
              id="player-btn-forward10"
              onClick={() => onSeek(Math.min(totalDuration, currentTime + 10))}
              title="Forward 10 seconds"
              className="p-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>
          </div>

          {/* Scrubber slider & time stamps */}
          <div className="w-full flex items-center gap-2.5 text-xs text-slate-400 font-mono">
            <span className="w-10 text-right text-[11px] text-slate-300 font-semibold">
              {formatSeconds(currentTime)}
            </span>

            <div className="relative flex-1 flex items-center group">
              <input
                id="player-scrubber-slider"
                type="range"
                min={0}
                max={totalDuration || 100}
                step={0.5}
                value={currentTime}
                onChange={(e) => onSeek(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:h-2 transition-all"
              />
            </div>

            <span className="w-10 text-[11px] text-slate-400">
              {formatSeconds(totalDuration)}
            </span>
          </div>
        </div>

        {/* Right: Playback speed */}
        <div className="flex items-center justify-end gap-2 w-full md:w-1/4">
          <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
            <span className="text-[10px] text-slate-400 px-2 font-mono flex items-center gap-1">
              <Gauge className="w-3 h-3 text-slate-400" /> Speed:
            </span>
            {[1.0, 1.25, 1.5].map((rate) => (
              <button
                key={rate}
                id={`speed-btn-${rate}`}
                onClick={() => onPlaybackRateChange(rate)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono transition-colors ${
                  playbackRate === rate ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
