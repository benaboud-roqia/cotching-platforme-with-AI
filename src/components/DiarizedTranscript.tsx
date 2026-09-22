import React, { useState, useMemo } from 'react';
import { TranscriptEntry } from '../types';
import { Search, User, UserCheck, Play, Volume2, Copy, Check, Filter, Sparkles, Clock } from 'lucide-react';

interface DiarizedTranscriptProps {
  transcript: TranscriptEntry[];
  currentTime: number;
  onSeek: (seconds: number) => void;
  repName: string;
  prospectName: string;
}

export const DiarizedTranscript: React.FC<DiarizedTranscriptProps> = ({
  transcript,
  currentTime,
  onSeek,
  repName,
  prospectName,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpeaker, setSelectedSpeaker] = useState<'all' | 'Speaker A' | 'Speaker B'>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Extract unique tags
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    transcript.forEach((t) => {
      if (t.tag) tags.add(t.tag);
    });
    return Array.from(tags);
  }, [transcript]);

  // Filter transcript
  const filteredTranscript = useMemo(() => {
    return transcript.filter((item) => {
      // Speaker match
      if (selectedSpeaker !== 'all' && item.speaker !== selectedSpeaker) {
        return false;
      }
      // Tag match
      if (tagFilter !== 'all' && item.tag !== tagFilter) {
        return false;
      }
      // Search match
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesText = item.text.toLowerCase().includes(q);
        const matchesTag = item.tag?.toLowerCase().includes(q);
        const matchesSpeaker = item.speakerName.toLowerCase().includes(q);
        return matchesText || matchesTag || matchesSpeaker;
      }
      return true;
    });
  }, [transcript, selectedSpeaker, tagFilter, searchQuery]);

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const getSentimentBadge = (sentiment: TranscriptEntry['sentiment']) => {
    switch (sentiment) {
      case 'positive':
        return <span className="text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-full">Positive</span>;
      case 'negative':
        return <span className="text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200/80 px-2 py-0.5 rounded-full">Critical / Frustrated</span>;
      case 'hesitant':
        return <span className="text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200/80 px-2 py-0.5 rounded-full">Hesitant / Skeptical</span>;
      case 'neutral':
      default:
        return <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">Neutral</span>;
    }
  };

  return (
    <div id="diarized-transcript-card" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-[650px] overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-100 space-y-3 bg-slate-50/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              Diarized Call Transcript
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 font-mono">
                {filteredTranscript.length} / {transcript.length} turns
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Speaker A (Salesperson) vs Speaker B (Prospect) with conversational sentiment markers
            </p>
          </div>

          {/* Speaker Legend */}
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 font-medium">
              <span className="w-2 h-2 rounded-full bg-indigo-600" />
              Speaker A: {repName} (Rep)
            </span>
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              Speaker B: {prospectName} (Prospect)
            </span>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              id="transcript-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search transcript by keyword (e.g. pricing, budget, competitor)..."
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Speaker Filter Pills */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-medium text-slate-600">
            <button
              id="filter-speaker-all"
              onClick={() => setSelectedSpeaker('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedSpeaker === 'all' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              All Speakers
            </button>
            <button
              id="filter-speaker-a"
              onClick={() => setSelectedSpeaker('Speaker A')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedSpeaker === 'Speaker A' ? 'bg-white text-indigo-700 font-semibold shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Speaker A (Rep)
            </button>
            <button
              id="filter-speaker-b"
              onClick={() => setSelectedSpeaker('Speaker B')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                selectedSpeaker === 'Speaker B' ? 'bg-white text-emerald-700 font-semibold shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Speaker B (Prospect)
            </button>
          </div>

          {/* Tag Filter Dropdown if tags exist */}
          {availableTags.length > 0 && (
            <select
              id="transcript-tag-filter"
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              aria-label="Filter transcript by tactical tag"
              className="text-xs bg-white border border-slate-200 text-slate-700 rounded-xl px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Tactical Tags</option>
              {availableTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Transcript Scroll Area */}
      <div id="transcript-scroll-area" className="flex-1 overflow-y-auto p-4 space-y-3.5 divide-y divide-slate-100/60">
        {filteredTranscript.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-xs py-16 space-y-2">
            <Filter className="w-8 h-8 text-slate-300" />
            <p className="font-medium text-slate-600">No transcript matches found</p>
            <p className="text-[11px] text-slate-400">Try clearing your search query or speaker filters.</p>
          </div>
        ) : (
          filteredTranscript.map((entry, index) => {
            const isSpeakerA = entry.speaker === 'Speaker A';
            const nextEntry = transcript[index + 1];
            const nextTime = nextEntry ? nextEntry.timestampSeconds : entry.timestampSeconds + 15;
            const isActive = currentTime >= entry.timestampSeconds && currentTime < nextTime;

            return (
              <div
                key={entry.id}
                id={`transcript-turn-${entry.id}`}
                className={`pt-3.5 first:pt-0 transition-all rounded-xl p-2.5 ${
                  isActive
                    ? isSpeakerA
                      ? 'bg-indigo-50/70 border border-indigo-200/90 shadow-xs'
                      : 'bg-emerald-50/70 border border-emerald-200/90 shadow-xs'
                    : 'hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Speaker Avatar & Badge */}
                    <div
                      className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-semibold ${
                        isSpeakerA
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isSpeakerA ? <User className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                      <span>{entry.speaker} ({entry.speakerName})</span>
                      <span className="text-[10px] font-normal opacity-75">· {entry.speakerRole}</span>
                    </div>

                    {/* Clickable Timestamp */}
                    <button
                      id={`timestamp-btn-${entry.id}`}
                      onClick={() => onSeek(entry.timestampSeconds)}
                      title="Seek call audio to this moment"
                      className="flex items-center gap-1 text-[11px] font-mono font-medium text-slate-500 hover:text-indigo-600 bg-white hover:bg-indigo-50 border border-slate-200 px-2 py-0.5 rounded-md transition-colors"
                    >
                      <Clock className="w-3 h-3 text-slate-400" />
                      {entry.timestampLabel}
                      <Play className="w-2.5 h-2.5 ml-0.5 fill-current opacity-70" />
                    </button>

                    {/* Sentiment Pill */}
                    {getSentimentBadge(entry.sentiment)}

                    {/* Tactical Tag */}
                    {entry.tag && (
                      <span className="text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                        {entry.tag}
                      </span>
                    )}
                  </div>

                  {/* Copy Button */}
                  <button
                    onClick={() => handleCopy(entry.id, entry.text)}
                    title="Copy speech snippet"
                    className="text-slate-400 hover:text-slate-600 p-1 rounded hover:bg-slate-100 transition-colors"
                  >
                    {copiedId === entry.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Speech Text */}
                <p className="text-slate-800 text-[13px] leading-relaxed pl-1">
                  {entry.text}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
