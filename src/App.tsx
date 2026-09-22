import React, { useState, useEffect, useRef } from 'react';
import { SAMPLE_CALLS } from './data/sampleCalls';
import { SalesCallAnalysis } from './types';
import { Header } from './components/Header';
import { AudioUploader } from './components/AudioUploader';
import { SentimentGraph } from './components/SentimentGraph';
import { DiarizedTranscript } from './components/DiarizedTranscript';
import { CoachingCard } from './components/CoachingCard';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { globalAudioEngine } from './utils/audioEngine';
import {
  Sparkles,
  PhoneCall,
  Activity,
  Layers,
  ChevronDown,
  ChevronUp,
  Award,
  TrendingUp,
  FileText,
  User,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

export default function App() {
  const [callsList, setCallsList] = useState<SalesCallAnalysis[]>(SAMPLE_CALLS);
  const [currentCall, setCurrentCall] = useState<SalesCallAnalysis>(SAMPLE_CALLS[0]);
  const [showUploader, setShowUploader] = useState<boolean>(false);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Audio Playback State
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);

  // Sync with global audio engine
  useEffect(() => {
    globalAudioEngine.setDuration(currentCall.audioDurationSeconds);
    if (currentCall.audioUrl) {
      globalAudioEngine.initRealAudio(currentCall.audioUrl);
    }

    globalAudioEngine.onTimeUpdate((time) => {
      setCurrentTime(time);
    });

    globalAudioEngine.onStateChange((playing) => {
      setIsPlaying(playing);
    });

    return () => {
      globalAudioEngine.pause();
    };
  }, [currentCall]);

  const handleTogglePlay = () => {
    if (isPlaying) {
      globalAudioEngine.pause();
    } else {
      globalAudioEngine.play();
    }
  };

  const handleSeek = (seconds: number) => {
    globalAudioEngine.seek(seconds);
    setCurrentTime(seconds);
  };

  const handlePlaybackRateChange = (rate: number) => {
    setPlaybackRate(rate);
    globalAudioEngine.setPlaybackRate(rate);
  };

  const handleSelectSample = (sample: SalesCallAnalysis) => {
    globalAudioEngine.pause();
    setCurrentCall(sample);
    setShowUploader(false);
  };

  const handleAnalysisComplete = (newAnalysis: SalesCallAnalysis) => {
    setCallsList((prev) => [newAnalysis, ...prev]);
    setCurrentCall(newAnalysis);
    setShowUploader(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        currentCall={currentCall}
        onOpenUpload={() => setShowUploader((prev) => !prev)}
        allCallsCount={callsList.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-5 space-y-6">
        {/* Call Selector & Audio Upload Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            {/* Quick Switcher dropdown pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-2xl">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-slate-400" /> Calls:
              </span>
              {callsList.map((call) => {
                const isActive = call.id === currentCall.id;
                return (
                  <button
                    key={call.id}
                    id={`quick-call-btn-${call.id}`}
                    onClick={() => {
                      if (call.id !== currentCall.id) {
                        handleSelectSample(call);
                      }
                    }}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100/60'
                    }`}
                  >
                    <span className="truncate max-w-[150px]">{call.title}</span>
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                        isActive ? 'bg-slate-800 text-emerald-400' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {call.coachingCard.summaryScore} pts
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Toggle uploader panel */}
            <button
              id="btn-toggle-uploader-drawer"
              onClick={() => setShowUploader((prev) => !prev)}
              className="text-xs font-semibold text-indigo-700 hover:text-indigo-800 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200/80 transition-colors"
            >
              {showUploader ? (
                <>
                  <span>Hide Upload Panel</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Upload / Record Call</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          {/* Collapsible Uploader Drawer */}
          {showUploader && (
            <div className="transition-all duration-300">
              <AudioUploader
                onAnalysisComplete={handleAnalysisComplete}
                onSelectSample={handleSelectSample}
                isAnalyzing={isAnalyzing}
                setIsAnalyzing={setIsAnalyzing}
                activeCallId={currentCall.id}
              />
            </div>
          )}
        </div>

        {/* Call Overview Highlights Banner */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Sales Representative
              </div>
              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5 mt-0.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block" />
                {currentCall.repName}
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block" />

            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Prospect / Account
              </div>
              <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5 mt-0.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                {currentCall.prospectName} ·{' '}
                <span className="text-slate-500 font-normal">{currentCall.prospectCompany}</span>
              </div>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block" />

            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Deal Stage
              </div>
              <div className="font-bold text-indigo-700 text-sm mt-0.5">
                {currentCall.coachingCard.dealStage}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <div className="bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <span className="text-slate-500">Talk Ratio: </span>
              <span className="font-bold text-slate-900 font-mono">
                {currentCall.metrics.talkRatioRep}% Rep / {currentCall.metrics.talkRatioProspect}% Prospect
              </span>
            </div>

            <div className="bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-emerald-800">
              <span className="text-emerald-700">Buying Signals: </span>
              <span className="font-bold font-mono">{currentCall.metrics.buyingSignalsCount} detected</span>
            </div>
          </div>
        </div>

        {/* 1. Core Feature: AI Coaching Card (3 Things Done Well & 3 Missed Opportunities) */}
        <section id="section-coaching-card" aria-label="AI Generated Coaching Card">
          <CoachingCard
            coachingData={currentCall.coachingCard}
            metrics={currentCall.metrics}
            repName={currentCall.repName}
            prospectName={currentCall.prospectName}
            onSeek={handleSeek}
          />
        </section>

        {/* 2. Core Feature: Sentiment & Engagement Graph over duration */}
        <section id="section-sentiment-graph" aria-label="Sentiment and Engagement Graph">
          <SentimentGraph
            data={currentCall.sentimentTimeline}
            currentTime={currentTime}
            totalDuration={currentCall.audioDurationSeconds}
            onSeek={handleSeek}
            repName={currentCall.repName}
            prospectName={currentCall.prospectName}
          />
        </section>

        {/* 3. Core Feature: Diarized Transcript (Speaker A vs Speaker B) */}
        <section id="section-diarized-transcript" aria-label="Diarized Call Transcript">
          <DiarizedTranscript
            transcript={currentCall.transcript}
            currentTime={currentTime}
            onSeek={handleSeek}
            repName={currentCall.repName}
            prospectName={currentCall.prospectName}
          />
        </section>
      </main>

      {/* Floating / Docked Synchronized Audio Player Bar */}
      <AudioPlayerBar
        isPlaying={isPlaying}
        onTogglePlay={handleTogglePlay}
        currentTime={currentTime}
        totalDuration={currentCall.audioDurationSeconds}
        onSeek={handleSeek}
        playbackRate={playbackRate}
        onPlaybackRateChange={handlePlaybackRateChange}
        repName={currentCall.repName}
        prospectName={currentCall.prospectName}
        transcript={currentCall.transcript}
      />
    </div>
  );
}
