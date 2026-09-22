import React, { useState } from 'react';
import { CoachingCardData, CallMetrics } from '../types';
import {
  Award,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Sparkles,
  MessageSquare,
  Copy,
  Check,
  TrendingUp,
  Mail,
  Zap,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface CoachingCardProps {
  coachingData: CoachingCardData;
  metrics: CallMetrics;
  repName: string;
  prospectName: string;
  onSeek: (seconds: number) => void;
}

export const CoachingCard: React.FC<CoachingCardProps> = ({
  coachingData,
  metrics,
  repName,
  prospectName,
  onSeek,
}) => {
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [activeTab, setActiveTab] = useState<'card' | 'metrics' | 'email'>('card');

  const handleCopyEmail = () => {
    const text = `Subject: ${coachingData.suggestedFollowUpEmailSubject}\n\n${coachingData.suggestedFollowUpEmailBody}`;
    navigator.clipboard.writeText(text);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 70) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  return (
    <div id="ai-coaching-card" className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-0">
      {/* Top Banner & Score */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-semibold tracking-wider text-indigo-300 uppercase">
              AI Sales Intelligence
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-800 text-indigo-200 border border-indigo-700">
              Gong-Grade Audit
            </span>
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            Executive Coaching Card
          </h2>
          <p className="text-xs text-slate-300">
            Automated performance diagnostic for {repName} on call with {prospectName}
          </p>
        </div>

        {/* Call Health Score Badge */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-xl border border-white/15 self-start sm:self-auto">
          <div className="text-right">
            <div className="text-[10px] uppercase font-semibold text-slate-300">Call Quality Score</div>
            <div className="text-xs font-semibold text-emerald-300">{coachingData.callOutcome}</div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center font-mono text-2xl font-black text-emerald-300 shadow-inner">
            {coachingData.summaryScore}
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="px-5 border-b border-slate-200 flex items-center gap-6 text-xs font-semibold bg-slate-50/70">
        <button
          id="coaching-tab-card"
          onClick={() => setActiveTab('card')}
          className={`py-3 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'card'
              ? 'border-indigo-600 text-indigo-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4 text-emerald-500" />
          3 Strengths & 3 Opportunities
        </button>
        <button
          id="coaching-tab-metrics"
          onClick={() => setActiveTab('metrics')}
          className={`py-3 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'metrics'
              ? 'border-indigo-600 text-indigo-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-indigo-500" />
          Conversation Ratios & Benchmark Metrics
        </button>
        <button
          id="coaching-tab-email"
          onClick={() => setActiveTab('email')}
          className={`py-3 border-b-2 flex items-center gap-2 transition-all ${
            activeTab === 'email'
              ? 'border-indigo-600 text-indigo-700 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Mail className="w-4 h-4 text-amber-500" />
          AI Follow-up Email Draft
        </button>
      </div>

      {/* Tab 1: The Core 3 Things Done Well + 3 Missed Opportunities */}
      {activeTab === 'card' && (
        <div className="p-5 space-y-6">
          {/* SECTION A: 3 THINGS THE SALESPERSON DID WELL */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                3 Things the Salesperson Did Well
                <span className="text-xs font-normal text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-mono">
                  Verified Strengths
                </span>
              </h3>
              <span className="text-[11px] text-slate-400">Tactical highlights from call</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {coachingData.thingsDoneWell.map((item, index) => (
                <div
                  key={item.id || index}
                  id={`strength-card-${index + 1}`}
                  className="bg-emerald-50/40 rounded-xl border border-emerald-200/80 p-3.5 flex flex-col justify-between hover:shadow-xs transition-shadow"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md truncate">
                        {item.category}
                      </span>
                      {item.timestampLabel && (
                        <button
                          onClick={() => onSeek(item.timestampSeconds)}
                          className="text-[10px] font-mono text-slate-500 hover:text-emerald-700 flex items-center gap-0.5 bg-white px-1.5 py-0.5 rounded border border-emerald-200"
                        >
                          <Clock className="w-2.5 h-2.5" />
                          {item.timestampLabel}
                        </button>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs leading-snug">
                      {item.title}
                    </h4>

                    {/* Exact quote */}
                    <div className="bg-white/80 p-2.5 rounded-lg border border-emerald-100 text-xs text-slate-700 italic border-l-3 border-l-emerald-500">
                      "{item.quote}"
                    </div>

                    {/* Impact analysis */}
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      <strong className="text-slate-800 font-semibold">Impact: </strong>
                      {item.impactAnalysis}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION B: 3 MISSED OPPORTUNITIES */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                3 Missed Opportunities
                <span className="text-xs font-normal text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full font-mono">
                  Growth Areas & Coaching
                </span>
              </h3>
              <span className="text-[11px] text-slate-400">Actionable tactical corrections</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {coachingData.missedOpportunities.map((item, index) => (
                <div
                  key={item.id || index}
                  id={`opportunity-card-${index + 1}`}
                  className="bg-amber-50/40 rounded-xl border border-amber-200/80 p-3.5 flex flex-col justify-between hover:shadow-xs transition-shadow"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-1">
                      <span className="w-5 h-5 rounded-full bg-amber-600 text-white font-mono text-[11px] font-bold flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-md truncate">
                        {item.category}
                      </span>
                      {item.timestampLabel && (
                        <button
                          onClick={() => onSeek(item.timestampSeconds)}
                          className="text-[10px] font-mono text-slate-500 hover:text-amber-800 flex items-center gap-0.5 bg-white px-1.5 py-0.5 rounded border border-amber-200"
                        >
                          <Clock className="w-2.5 h-2.5" />
                          {item.timestampLabel}
                        </button>
                      )}
                    </div>

                    <h4 className="font-bold text-slate-900 text-xs leading-snug">
                      {item.title}
                    </h4>

                    {/* What happened */}
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      <strong className="text-slate-800 font-semibold">Diagnosis: </strong>
                      {item.issueDescription}
                    </p>

                    {/* Recommended alternative phrasing */}
                    <div className="bg-white p-2.5 rounded-lg border border-amber-200 text-xs text-slate-800 border-l-3 border-l-amber-500">
                      <div className="text-[10px] font-bold text-amber-700 uppercase tracking-wide flex items-center gap-1 mb-1">
                        <Zap className="w-3 h-3" /> Say This Instead Next Time:
                      </div>
                      <p className="italic text-slate-700 text-[11px]">
                        "{item.recommendedAlternative}"
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Quantitative Ratios & Benchmarks */}
      {activeTab === 'metrics' && (
        <div className="p-5 space-y-5">
          {/* Talk vs Listen Ratio Card */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-900 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-indigo-600" />
                Talk-to-Listen Ratio
              </span>
              <span className="text-slate-500 text-[11px]">
                Industry Gold Standard: <strong className="text-slate-800 font-semibold">43% Rep / 57% Customer</strong>
              </span>
            </div>

            {/* Split Progress Bar */}
            <div className="space-y-1.5">
              <div className="h-4 w-full bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
                <div
                  style={{ width: `${metrics.talkRatioRep}%` }}
                  className="bg-indigo-600 h-full flex items-center justify-center text-[10px] font-bold text-white transition-all duration-500"
                >
                  {metrics.talkRatioRep}% Rep
                </div>
                <div
                  style={{ width: `${metrics.talkRatioProspect}%` }}
                  className="bg-emerald-500 h-full flex items-center justify-center text-[10px] font-bold text-white transition-all duration-500"
                >
                  {metrics.talkRatioProspect}% Prospect
                </div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>{repName} ({metrics.talkRatioRep}%)</span>
                <span>{prospectName} ({metrics.talkRatioProspect}%)</span>
              </div>
            </div>

            {/* Diagnostic advice on ratio */}
            <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
              {metrics.talkRatioRep <= 46 ? (
                <span className="text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <strong>Optimal Engagement:</strong> You allowed the prospect to do the majority of talking, driving deep pain discovery and high emotional buy-in.
                </span>
              ) : (
                <span className="text-amber-700 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <strong>High Rep Airtime:</strong> Your talk ratio exceeded 50%. Focus on framing open-ended questions to invite longer answers from the client.
                </span>
              )}
            </p>
          </div>

          {/* 4 Core Conversation Benchmarks Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Rep Speech Rate
              </span>
              <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                {metrics.wordsPerMinuteRep} <span className="text-xs font-normal text-slate-500">WPM</span>
              </div>
              <span className="text-[10px] text-slate-500">Target: 130 - 150 WPM</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Discovery Questions
              </span>
              <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                {metrics.questionsAskedRep} <span className="text-xs font-normal text-slate-500">asked</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-medium">Top Tier (10+ target)</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Longest Monologue
              </span>
              <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                {metrics.longestMonologueSeconds} <span className="text-xs font-normal text-slate-500">sec</span>
              </div>
              <span className="text-[10px] text-slate-500">Limit: &lt; 90 seconds</span>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Filler Words Count
              </span>
              <div className="text-lg font-bold text-slate-900 font-mono mt-0.5">
                {metrics.fillerWordsCount} <span className="text-xs font-normal text-slate-500">total</span>
              </div>
              <span className="text-[10px] text-emerald-600 font-medium">Clean delivery</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Suggested Follow-up Email */}
      {activeTab === 'email' && (
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                AI Generated Follow-up Email
              </h4>
              <p className="text-[11px] text-slate-500">
                Grounded directly in the commitments, pain points, and calendar milestones agreed during the call
              </p>
            </div>
            <button
              onClick={handleCopyEmail}
              className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-colors shadow-xs"
            >
              {copiedEmail ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedEmail ? 'Copied to Clipboard!' : 'Copy Email'}
            </button>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 text-xs space-y-2">
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Subject:</span>
              <p className="font-semibold text-slate-900 mt-0.5">
                {coachingData.suggestedFollowUpEmailSubject}
              </p>
            </div>
            <hr className="border-slate-200" />
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-400">Body:</span>
              <pre className="font-sans whitespace-pre-wrap text-slate-700 mt-1 leading-relaxed text-xs">
                {coachingData.suggestedFollowUpEmailBody}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
