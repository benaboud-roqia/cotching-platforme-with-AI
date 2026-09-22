import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  ReferenceDot,
} from 'recharts';
import { SentimentPoint } from '../types';
import { formatSeconds } from '../utils/audioEngine';
import { Activity, Sparkles, TrendingUp, User, ShieldAlert, Award } from 'lucide-react';

interface SentimentGraphProps {
  data: SentimentPoint[];
  currentTime: number;
  totalDuration: number;
  onSeek: (seconds: number) => void;
  repName: string;
  prospectName: string;
}

export const SentimentGraph: React.FC<SentimentGraphProps> = ({
  data,
  currentTime,
  totalDuration,
  onSeek,
  repName,
  prospectName,
}) => {
  const [activeMetric, setActiveMetric] = useState<'all' | 'prospect' | 'rep' | 'sentiment'>('all');
  const [selectedMilestone, setSelectedMilestone] = useState<SentimentPoint | null>(null);

  // Transform data for recharts
  const chartData = data.map((pt) => ({
    ...pt,
    timeFormatted: pt.timestampLabel,
    timeSec: pt.timestampSeconds,
  }));

  // Find milestones that have notes
  const milestones = data.filter((d) => d.milestoneNote);

  // Custom Tooltip component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const point: SentimentPoint = payload[0].payload;
      return (
        <div id="sentiment-tooltip" className="bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 p-3 rounded-xl shadow-xl max-w-xs text-xs space-y-2 pointer-events-none">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
            <span className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              {point.timestampLabel}
            </span>
            <span className="text-[11px] text-slate-400 font-mono">Click to jump</span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1 text-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                {prospectName} Engagement:
              </span>
              <span className="font-bold text-white font-mono">{point.prospectEngagement}%</span>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1 text-indigo-300">
                <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block" />
                {repName} Energy:
              </span>
              <span className="font-bold text-white font-mono">{point.repEnergy}%</span>
            </div>

            <div className="flex justify-between items-center text-slate-300">
              <span className="flex items-center gap-1 text-amber-300">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                Net Sentiment:
              </span>
              <span className={`font-bold font-mono ${point.overallSentiment >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {point.overallSentiment > 0 ? `+${point.overallSentiment}` : point.overallSentiment}
              </span>
            </div>
          </div>

          {point.milestoneNote && (
            <div className="bg-slate-800/80 p-2 rounded-lg border border-slate-700 mt-1">
              <div className="text-[10px] text-amber-400 uppercase font-semibold tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Key Call Event
              </div>
              <p className="text-slate-200 text-[11px] mt-0.5">{point.milestoneNote}</p>
              {point.quoteSnippet && (
                <p className="text-slate-400 text-[10px] italic mt-1 border-l-2 border-amber-400/60 pl-1.5">
                  "{point.quoteSnippet}"
                </p>
              )}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div id="sentiment-graph-card" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 space-y-4">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                Call Engagement & Sentiment Graph
                <span className="text-xs font-normal bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-mono">
                  Live Timeline
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Tracking prospect attention, salesperson energy, and emotional resonance across the conversation
              </p>
            </div>
          </div>
        </div>

        {/* View toggles */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600 self-start sm:self-auto">
          <button
            id="graph-btn-all"
            onClick={() => setActiveMetric('all')}
            className={`px-3 py-1 rounded-lg transition-all ${
              activeMetric === 'all' ? 'bg-white text-slate-900 font-semibold shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            All Curves
          </button>
          <button
            id="graph-btn-prospect"
            onClick={() => setActiveMetric('prospect')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
              activeMetric === 'prospect' ? 'bg-white text-emerald-700 font-semibold shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Prospect ({prospectName})
          </button>
          <button
            id="graph-btn-rep"
            onClick={() => setActiveMetric('rep')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center gap-1 ${
              activeMetric === 'rep' ? 'bg-white text-indigo-700 font-semibold shadow-xs' : 'hover:text-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            Rep ({repName})
          </button>
        </div>
      </div>

      {/* Main Chart Canvas */}
      <div className="h-64 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            onClick={(e: any) => {
              if (e && e.activePayload && e.activePayload[0]) {
                const sec = e.activePayload[0].payload.timeSec;
                onSeek(sec);
              }
            }}
            margin={{ top: 12, right: 12, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="prospectGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="repGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

            <XAxis
              dataKey="timeFormatted"
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#e2e8f0' }}
            />

            <YAxis
              domain={[0, 100]}
              stroke="#94a3b8"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `${v}%`}
            />

            <Tooltip content={<CustomTooltip />} />

            {/* Playhead Reference Line */}
            {currentTime > 0 && currentTime <= totalDuration && (
              <ReferenceLine
                x={formatSeconds(currentTime)}
                stroke="#0f172a"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: 'Playhead',
                  position: 'top',
                  fill: '#0f172a',
                  fontSize: 10,
                  fontWeight: 600,
                }}
              />
            )}

            {/* Benchmark line for high engagement (75%) */}
            <ReferenceLine
              y={75}
              stroke="#cbd5e1"
              strokeDasharray="3 3"
              label={{
                value: 'High Engagement Threshold (75%)',
                position: 'insideTopLeft',
                fill: '#94a3b8',
                fontSize: 10,
              }}
            />

            {/* Milestone Reference Dots */}
            {milestones.map((m, idx) => (
              <ReferenceDot
                key={`milestone-dot-${idx}`}
                x={m.timestampLabel}
                y={m.prospectEngagement}
                r={5}
                fill="#f59e0b"
                stroke="#ffffff"
                strokeWidth={2}
                className="cursor-pointer hover:scale-125 transition-transform"
                onClick={() => {
                  setSelectedMilestone(m);
                  onSeek(m.timestampSeconds);
                }}
              />
            ))}

            {/* Prospect Engagement Area */}
            {(activeMetric === 'all' || activeMetric === 'prospect') && (
              <Area
                type="monotone"
                dataKey="prospectEngagement"
                name={`${prospectName} Engagement`}
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#prospectGradient)"
                activeDot={{ r: 6, fill: '#10b981', stroke: '#fff', strokeWidth: 2 }}
              />
            )}

            {/* Rep Energy Line */}
            {(activeMetric === 'all' || activeMetric === 'rep') && (
              <Area
                type="monotone"
                dataKey="repEnergy"
                name={`${repName} Energy`}
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#repGradient)"
                activeDot={{ r: 6, fill: '#6366f1', stroke: '#fff', strokeWidth: 2 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive Milestone Inflection Bar */}
      <div className="bg-slate-50 rounded-xl p-3 border border-slate-200/60">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Key Inflection Points & Milestones ({milestones.length})
          </span>
          <span className="text-[11px] text-slate-400">Click any marker to seek call audio</span>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {milestones.map((m, i) => {
            const isNearCurrent = Math.abs(currentTime - m.timestampSeconds) < 15;
            return (
              <button
                key={`milestone-badge-${i}`}
                id={`milestone-badge-${i}`}
                onClick={() => {
                  setSelectedMilestone(m);
                  onSeek(m.timestampSeconds);
                }}
                className={`shrink-0 flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-left transition-all ${
                  isNearCurrent
                    ? 'bg-amber-50 border-amber-300 ring-2 ring-amber-200 text-slate-900'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                  {m.timestampLabel}
                </span>
                <span className="text-xs font-medium truncate max-w-[190px]">
                  {m.milestoneNote}
                </span>
                <span className="text-[10px] font-bold text-emerald-600 font-mono">
                  {m.prospectEngagement}%
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
