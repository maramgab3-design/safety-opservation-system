import React, { useState } from 'react';
import { ToolboxTalk } from '../types';
import { HardHat, Sparkles, Calendar, Clock, User, ShieldCheck, Printer, Check, Loader2, AlertTriangle } from 'lucide-react';

interface ToolboxTalksSectionProps {
  talks: ToolboxTalk[];
  selectedFacility: string;
  onGenerateTalk: (facility: string, shift: string) => Promise<void>;
  isGenerating: boolean;
}

export const ToolboxTalksSection: React.FC<ToolboxTalksSectionProps> = ({
  talks,
  selectedFacility,
  onGenerateTalk,
  isGenerating,
}) => {
  const [shift, setShift] = useState<'Morning Tour (Day)' | 'Night Tour (Night)'>('Morning Tour (Day)');
  const [selectedTalk, setSelectedTalk] = useState<ToolboxTalk | null>(talks[0] || null);
  const [acknowledged, setAcknowledged] = useState<Record<string, boolean>>({});

  const facilityTalks = selectedFacility === 'all'
    ? talks
    : talks.filter(t => t.facility === selectedFacility || t.facility === 'All Operating Assets');

  const activeDisplayTalk = selectedTalk || facilityTalks[0] || talks[0];

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header & Generator Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center">
              <HardHat className="w-4 h-4" />
            </span>
            <h2 className="text-base font-bold text-slate-900 tracking-tight">
              Pre-Tour Toolbox Safety Meetings (TBT)
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Automated crew safety briefings synthesized directly from recent site near-misses and active hazard reports
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            id="tbt-shift-select"
            value={shift}
            onChange={(e) => setShift(e.target.value as any)}
            className="text-xs px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 font-semibold text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="Morning Tour (Day)">Morning Tour (Day Shift)</option>
            <option value="Night Tour (Night)">Night Tour (Night Shift)</option>
          </select>

          <button
            id="generate-tbt-btn"
            onClick={() => onGenerateTalk(selectedFacility === 'all' ? 'Offshore Platform Horizon Alpha' : selectedFacility, shift)}
            disabled={isGenerating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Crafting Crew Briefing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Generate TBT from Active Hazards</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Meeting list */}
        <div className="space-y-2.5">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Recent Site Safety Briefings ({facilityTalks.length})
          </div>

          {facilityTalks.map((talk) => (
            <div
              key={talk.id}
              onClick={() => setSelectedTalk(talk)}
              className={`p-3.5 rounded-xl border text-xs transition-all cursor-pointer ${
                activeDisplayTalk?.id === talk.id
                  ? 'border-orange-500 bg-orange-50/40 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                <span className="font-mono">{talk.date}</span>
                <span className="font-semibold text-slate-700">{talk.targetShift}</span>
              </div>
              <h4 className="font-bold text-slate-900 mb-1 line-clamp-1">{talk.title}</h4>
              <p className="text-slate-600 text-[11px] line-clamp-2">{talk.hazardFocus}</p>
              <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                <span className="text-orange-700 font-medium">{talk.lifeSavingRuleRef}</span>
                <span className="text-slate-400 truncate max-w-[120px]">{talk.facility}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Active Toolbox Card Presentation */}
        {activeDisplayTalk ? (
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-slate-200">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="text-xs font-mono font-bold bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
                    {activeDisplayTalk.lifeSavingRuleRef}
                  </span>
                  <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                    {activeDisplayTalk.targetShift}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    Date: {activeDisplayTalk.date}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  {activeDisplayTalk.title}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Location: <strong>{activeDisplayTalk.facility}</strong>
                </p>
              </div>

              <button
                onClick={handlePrint}
                className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Export TBT Sheet
              </button>
            </div>

            {/* Operational Focus */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="font-bold text-slate-700 block mb-1 uppercase tracking-wider text-[11px]">
                Core Operational Hazard Focus:
              </span>
              <p className="text-slate-800 leading-relaxed font-medium">
                {activeDisplayTalk.hazardFocus}
              </p>
            </div>

            {/* 2-Column: Key Hazards & Mandatory Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Hazards Identified */}
              <div className="border border-rose-200 rounded-xl p-4 bg-rose-50/30">
                <h4 className="font-bold text-rose-950 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  Key Specific Hazards for This Tour:
                </h4>
                <ul className="space-y-2 text-rose-900">
                  {activeDisplayTalk.keyHazardsIdentified.map((h, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0"></span>
                      <span className="leading-relaxed">{h}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Preventative Barrier Controls */}
              <div className="border border-emerald-200 rounded-xl p-4 bg-emerald-50/30">
                <h4 className="font-bold text-emerald-950 mb-2 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Mandatory Crew Barrier Controls:
                </h4>
                <ul className="space-y-2 text-slate-800">
                  {activeDisplayTalk.preventativeMeasures.map((m, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></span>
                      <span className="leading-relaxed">{m}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Crew Sign-off & SWA Commitment */}
            <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-0.5">
                <div className="text-[11px] text-slate-400">Meeting Leader:</div>
                <div className="font-bold text-slate-800">{activeDisplayTalk.leadSupervisor}</div>
                <div className="text-[10px] text-slate-500">100% Stop Work Authority (SWA) endorsed for all hands</div>
              </div>

              <button
                onClick={() => setAcknowledged({ ...acknowledged, [activeDisplayTalk.id]: true })}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  acknowledged[activeDisplayTalk.id]
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                }`}
              >
                <Check className="w-4 h-4" />
                {acknowledged[activeDisplayTalk.id] ? 'Tour Crew Signed Off (12/12 Hands)' : 'Verify Crew Tour Attendance'}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
