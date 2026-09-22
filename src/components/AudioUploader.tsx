import React, { useState, useRef } from 'react';
import { Upload, Mic, MicOff, FileAudio, Sparkles, AlertCircle, PlayCircle, Check, Loader2 } from 'lucide-react';
import { SAMPLE_CALLS } from '../data/sampleCalls';
import { SalesCallAnalysis } from '../types';

interface AudioUploaderProps {
  onAnalysisComplete: (analysis: SalesCallAnalysis) => void;
  onSelectSample: (sample: SalesCallAnalysis) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (val: boolean) => void;
  activeCallId?: string;
}

export const AudioUploader: React.FC<AudioUploaderProps> = ({
  onAnalysisComplete,
  onSelectSample,
  isAnalyzing,
  setIsAnalyzing,
  activeCallId,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'record' | 'samples'>('samples');
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [analysisStatus, setAnalysisStatus] = useState<string>('');

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<number | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Handle file selection
  const handleFileChange = (file: File) => {
    if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|m4a|ogg|webm|aac|flac)$/i)) {
      setErrorMessage('Please select a valid audio file (.mp3, .wav, .m4a, .ogg, .webm).');
      return;
    }
    setErrorMessage(null);
    setSelectedFile(file);
  };

  // Convert File/Blob to Base64
  const fileToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const res = reader.result as string;
        // Strip data:audio/*;base64, prefix
        const base64 = res.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Analyze uploaded or recorded audio
  const handleAnalyzeAudio = async (audioBlob: Blob, fileName: string) => {
    setIsAnalyzing(true);
    setErrorMessage(null);
    setAnalysisStatus('Uploading audio stream to server...');

    try {
      const audioBase64 = await fileToBase64(audioBlob);
      setAnalysisStatus('Gemini processing: diarizing speakers & computing engagement...');

      const response = await fetch('/api/analyze-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64,
          mimeType: audioBlob.type || 'audio/mp3',
          fileName,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to analyze sales call.');
      }

      setAnalysisStatus('Finalizing Coaching Card & Sentiment Graph...');
      // Set audioUrl from blob for local playback
      const localAudioUrl = URL.createObjectURL(audioBlob);
      const analysis: SalesCallAnalysis = {
        ...data.analysis,
        audioUrl: localAudioUrl,
      };

      onAnalysisComplete(analysis);
    } catch (err: any) {
      console.warn('API analyze error, providing fallback analysis if needed:', err);
      // If error occurred (e.g. Gemini key missing or network quota), show friendly explanation
      setErrorMessage(
        err.message ||
          'Analysis failed. You can also explore any of the pre-loaded authentic sales calls below.'
      );
    } finally {
      setIsAnalyzing(false);
      setAnalysisStatus('');
    }
  };

  // Start Live Microphone Recording
  const startRecording = async () => {
    try {
      setErrorMessage(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        handleAnalyzeAudio(audioBlob, `live_sales_call_${new Date().toISOString().slice(0, 10)}.webm`);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      setErrorMessage('Microphone access denied or not available. Please allow microphone permissions.');
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  return (
    <div id="audio-uploader-container" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-4">
      {/* Top tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <FileAudio className="w-5 h-5 text-indigo-600" />
            Upload Sales Call Audio
          </h2>
          <p className="text-xs text-slate-500">
            Upload MP3/WAV, record live pitch, or explore pre-loaded enterprise benchmark calls
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold text-slate-600">
          <button
            id="tab-samples-btn"
            onClick={() => setActiveTab('samples')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'samples' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Sample Calls (3)
          </button>
          <button
            id="tab-upload-btn"
            onClick={() => setActiveTab('upload')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'upload' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload Audio File
          </button>
          <button
            id="tab-record-btn"
            onClick={() => setActiveTab('record')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'record' ? 'bg-white text-indigo-700 shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            <Mic className="w-3.5 h-3.5 text-rose-500" />
            Record Microphone
          </button>
        </div>
      </div>

      {/* Error notification */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* TAB 1: PRE-LOADED REAL-WORLD SAMPLES */}
      {activeTab === 'samples' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span className="font-semibold text-slate-700">Select a Benchmark Call to Analyze:</span>
            <span>Click any card for instant coaching audit</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {SAMPLE_CALLS.map((sample) => {
              const isSelected = activeCallId === sample.id;
              return (
                <button
                  key={sample.id}
                  id={`sample-card-${sample.id}`}
                  onClick={() => onSelectSample(sample)}
                  className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-2 relative ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20 shadow-xs'
                      : 'bg-slate-50/60 border-slate-200 hover:border-indigo-200 hover:bg-white'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-indigo-700 bg-indigo-100/80 px-2 py-0.5 rounded-md">
                        {sample.dealSize}
                      </span>
                      <span className="font-mono text-slate-500 text-[10px]">
                        {sample.audioDurationFormatted}
                      </span>
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs line-clamp-1">
                      {sample.title}
                    </h4>

                    <div className="text-[11px] text-slate-500">
                      <span>{sample.repName} (Rep)</span> vs{' '}
                      <span className="font-medium text-slate-700">{sample.prospectName} ({sample.prospectCompany})</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                    <span className="text-slate-500">
                      Score: <strong className="text-emerald-600 font-mono">{sample.coachingCard.summaryScore}/100</strong>
                    </span>
                    <span className="text-indigo-600 font-semibold flex items-center gap-0.5 text-[11px]">
                      {isSelected ? 'Active Call ✓' : 'Load Dashboard →'}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: UPLOAD AUDIO FILE */}
      {activeTab === 'upload' && (
        <div className="space-y-3">
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileChange(e.target.files[0]);
              }
            }}
            accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm,.aac,.flac"
            className="hidden"
          />

          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleFileChange(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 ${
              dragOver
                ? 'border-indigo-500 bg-indigo-50/50'
                : 'border-slate-200 hover:border-indigo-400 bg-slate-50/50 hover:bg-slate-50'
            }`}
          >
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mb-1">
              <Upload className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-800 text-sm">
              Drag & drop sales call audio, or <span className="text-indigo-600 underline">browse files</span>
            </p>
            <p className="text-xs text-slate-400">
              Supports MP3, WAV, M4A, OGG, WEBM (Up to 50MB)
            </p>
          </div>

          {selectedFile && (
            <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <FileAudio className="w-5 h-5 text-indigo-600 shrink-0" />
                <div>
                  <div className="font-bold text-slate-900">{selectedFile.name}</div>
                  <div className="text-slate-500 text-[10px]">
                    {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB · Ready for AI intelligence
                  </div>
                </div>
              </div>

              <button
                id="btn-analyze-upload"
                disabled={isAnalyzing}
                onClick={(e) => {
                  e.stopPropagation();
                  handleAnalyzeAudio(selectedFile, selectedFile.name);
                }}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold px-4 py-2 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    Analyze Call with Gemini
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: RECORD VIA MICROPHONE */}
      {activeTab === 'record' && (
        <div className="p-6 bg-slate-50/70 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center space-y-4">
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-sm">
              Live Sales Call & Pitch Practice Recording
            </h3>
            <p className="text-xs text-slate-500 max-w-md">
              Speak with a client or practice roleplaying your objection handling. When you stop, Gemini will diarize and evaluate your performance.
            </p>
          </div>

          {/* Record button & Pulse */}
          <div className="relative">
            {isRecording && (
              <div className="absolute inset-0 rounded-full bg-rose-400 animate-ping opacity-30" />
            )}
            <button
              id="btn-toggle-record"
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-all shadow-md relative z-10 ${
                isRecording ? 'bg-rose-600 hover:bg-rose-700' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isRecording ? <MicOff className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
            </button>
          </div>

          {/* Live timer */}
          {isRecording ? (
            <div className="space-y-1">
              <div className="font-mono text-xl font-bold text-rose-600 flex items-center gap-2 justify-center">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
                {Math.floor(recordingSeconds / 60)}:{String(recordingSeconds % 60).padStart(2, '0')}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Recording in progress... Click the red button to finish and analyze.
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400">
              Click the microphone button to start recording
            </p>
          )}
        </div>
      )}

      {/* Loading Overlay / Progress Indicator */}
      {isAnalyzing && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center gap-3 text-xs text-indigo-900 animate-pulse">
          <Loader2 className="w-5 h-5 text-indigo-600 animate-spin shrink-0" />
          <div>
            <div className="font-bold">Analyzing Sales Call with Gemini Intelligence</div>
            <div className="text-indigo-700 text-[11px]">{analysisStatus}</div>
          </div>
        </div>
      )}
    </div>
  );
};
