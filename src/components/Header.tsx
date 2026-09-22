import React from 'react';
import {
  Sparkles,
  PhoneCall,
  Activity,
  Layers,
  Award,
  Calendar,
  Building2,
  DollarSign,
  Download,
} from 'lucide-react';
import { SalesCallAnalysis } from '../types';

interface HeaderProps {
  currentCall: SalesCallAnalysis;
  onOpenUpload: () => void;
  allCallsCount: number;
}

export const Header: React.FC<HeaderProps> = ({ currentCall, onOpenUpload, allCallsCount }) => {
  const handleExportSummary = () => {
    const summaryText = `SALESPULSE INTELLIGENCE REPORT
-----------------------------------------
Call: ${currentCall.title}
File: ${currentCall.fileName}
Salesperson: ${currentCall.repName}
Prospect: ${currentCall.prospectName} (${currentCall.prospectCompany})
Deal Size: ${currentCall.dealSize || 'N/A'}
Analyzed: ${currentCall.analyzedAt}
Duration: ${currentCall.audioDurationFormatted}

OVERALL QUALITY SCORE: ${currentCall.coachingCard.summaryScore}/100 (${currentCall.coachingCard.callOutcome})
Talk-to-Listen Ratio: Rep ${currentCall.metrics.talkRatioRep}% vs Prospect ${currentCall.metrics.talkRatioProspect}%
Rep Speech Rate: ${currentCall.metrics.wordsPerMinuteRep} WPM
Questions Asked: ${currentCall.metrics.questionsAskedRep}
Longest Monologue: ${currentCall.metrics.longestMonologueSeconds}s

3 THINGS THE SALESPERSON DID WELL:
${currentCall.coachingCard.thingsDoneWell
  .map(
    (s, i) =>
      `${i + 1}. [${s.category}] ${s.title} (${s.timestampLabel})\n   Quote: "${s.quote}"\n   Impact: ${s.impactAnalysis}`
  )
  .join('\n\n')}

3 MISSED OPPORTUNITIES & COACHING:
${currentCall.coachingCard.missedOpportunities
  .map(
    (o, i) =>
      `${i + 1}. [${o.category}] ${o.title} (${o.timestampLabel})\n   Diagnosis: ${o.issueDescription}\n   Recommended Phrasing: "${o.recommendedAlternative}"`
  )
  .join('\n\n')}

SUGGESTED FOLLOW-UP EMAIL:
Subject: ${currentCall.coachingCard.suggestedFollowUpEmailSubject}
${currentCall.coachingCard.suggestedFollowUpEmailBody}
`;

    const blob = new Blob([summaryText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_coaching_${currentCall.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <header className="bg-white border-b border-slate-200/80 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Call metadata */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 text-white flex items-center justify-center shadow-xs shrink-0">
            <Activity className="w-5 h-5 text-emerald-300" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-slate-900 text-lg tracking-tight flex items-center gap-1.5">
                SalesPulse <span className="text-indigo-600 font-medium">Intelligence</span>
              </h1>
              <span className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Coaching Platform
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
              <span className="font-medium text-slate-700 truncate max-w-[280px]">
                {currentCall.title}
              </span>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-400" />
                {currentCall.prospectCompany}
              </span>
              <span>·</span>
              <span className="font-mono text-slate-600">{currentCall.audioDurationFormatted}</span>
            </div>
          </div>
        </div>

        {/* Right Action buttons */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <button
            id="header-btn-export"
            onClick={handleExportSummary}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors border border-slate-200/60"
            title="Export complete coaching report as text"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            Export Coaching Card
          </button>

          <button
            id="header-btn-upload-call"
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-2 rounded-xl transition-all shadow-xs"
          >
            <PhoneCall className="w-3.5 h-3.5 text-indigo-200" />
            Analyze New Call
          </button>
        </div>
      </div>
    </header>
  );
};
