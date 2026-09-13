import React from 'react';
import { SeverityLevel, LikelihoodLevel, RiskLevel } from '../types';
import { calculateRiskLevel } from '../utils/riskLogic';
import { AlertTriangle, Filter } from 'lucide-react';

interface RiskMatrix5x5Props {
  matrixCounts: Record<string, number>;
  selectedCell: { severity: SeverityLevel; likelihood: LikelihoodLevel } | null;
  onSelectCell: (cell: { severity: SeverityLevel; likelihood: LikelihoodLevel } | null) => void;
}

const SEVERITY_LABELS: Record<SeverityLevel, { name: string; desc: string }> = {
  5: { name: '5 - Catastrophic', desc: 'Fatality / Major Blowout / >$10M damage' },
  4: { name: '4 - Major', desc: 'Lost Time Injury (LTI) / Severe release' },
  3: { name: '3 - Moderate', desc: 'Restricted Work / Contained spill' },
  2: { name: '2 - Minor', desc: 'Medical Treatment / Minor damage' },
  1: { name: '1 - Negligible', desc: 'First Aid / Superficial impact' },
};

const LIKELIHOOD_LABELS: Record<LikelihoodLevel, { code: string; name: string; desc: string }> = {
  A: { code: 'A', name: 'Rare', desc: 'Heard of in industry' },
  B: { code: 'B', name: 'Unlikely', desc: 'Occurred in company' },
  C: { code: 'C', name: 'Possible', desc: 'Occurred in facility' },
  D: { code: 'D', name: 'Likely', desc: 'Occurs annual on asset' },
  E: { code: 'E', name: 'Frequent', desc: 'Multiple times per year' },
};

const LIKELIHOODS: LikelihoodLevel[] = ['A', 'B', 'C', 'D', 'E'];
const SEVERITIES: SeverityLevel[] = [5, 4, 3, 2, 1]; // Top to bottom

export const RiskMatrix5x5: React.FC<RiskMatrix5x5Props> = ({
  matrixCounts,
  selectedCell,
  onSelectCell,
}) => {
  const getCellColor = (sev: SeverityLevel, lik: LikelihoodLevel) => {
    const risk = calculateRiskLevel(sev, lik);
    switch (risk) {
      case 'critical':
        return 'bg-red-600 hover:bg-red-700 text-white border-red-700';
      case 'high':
        return 'bg-amber-500 hover:bg-amber-600 text-slate-900 border-amber-600';
      case 'medium':
        return 'bg-yellow-300 hover:bg-yellow-400 text-slate-900 border-yellow-400';
      case 'low':
      default:
        return 'bg-emerald-400 hover:bg-emerald-500 text-slate-900 border-emerald-500';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              5x5 Risk Assessment Matrix (RAM)
            </h3>
            <span className="text-[10px] bg-slate-100 text-slate-700 font-mono px-1.5 py-0.5 rounded border border-slate-200 font-semibold">
              API RP 75 Standard
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time concentration of reported workplace hazards by Severity vs. Likelihood
          </p>
        </div>

        {selectedCell && (
          <button
            onClick={() => onSelectCell(null)}
            className="self-start sm:self-auto flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors font-medium cursor-pointer"
          >
            <Filter className="w-3 h-3" />
            Clear Filter ({selectedCell.severity} &amp; {selectedCell.likelihood})
          </button>
        )}
      </div>

      {/* Matrix Grid */}
      <div className="overflow-x-auto">
        <div className="min-w-[520px]">
          {/* Top Likelihood Column Headers */}
          <div className="grid grid-cols-[140px_repeat(5,1fr)] gap-1.5 mb-1.5 text-center">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-center font-mono">
              Severity ↓ / Likelihood →
            </div>
            {LIKELIHOODS.map((lik) => (
              <div key={lik} className="bg-slate-50 border border-slate-200/80 rounded-md py-1.5 px-1">
                <div className="text-xs font-bold text-slate-800">{lik}</div>
                <div className="text-[10px] text-slate-500 truncate">{LIKELIHOOD_LABELS[lik].name}</div>
              </div>
            ))}
          </div>

          {/* Rows: 5 to 1 */}
          <div className="space-y-1.5">
            {SEVERITIES.map((sev) => (
              <div key={sev} className="grid grid-cols-[140px_repeat(5,1fr)] gap-1.5">
                {/* Row Header */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-md px-2 py-1 flex flex-col justify-center">
                  <div className="text-xs font-bold text-slate-800">{SEVERITY_LABELS[sev].name}</div>
                  <div className="text-[9px] text-slate-500 leading-tight truncate" title={SEVERITY_LABELS[sev].desc}>
                    {SEVERITY_LABELS[sev].desc}
                  </div>
                </div>

                {/* 5 Likelihood cells in this severity row */}
                {LIKELIHOODS.map((lik) => {
                  const key = `${sev}-${lik}`;
                  const count = matrixCounts[key] || 0;
                  const isSelected = selectedCell?.severity === sev && selectedCell?.likelihood === lik;
                  const colorClass = getCellColor(sev, lik);

                  return (
                    <button
                      key={key}
                      id={`matrix-cell-${sev}-${lik}`}
                      onClick={() => onSelectCell(isSelected ? null : { severity: sev, likelihood: lik })}
                      className={`h-12 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer relative ${colorClass} ${
                        isSelected 
                          ? 'ring-3 ring-slate-900 ring-offset-2 scale-102 z-10 shadow-md font-bold' 
                          : 'opacity-90 hover:opacity-100 hover:scale-101'
                      }`}
                    >
                      <span className="text-sm font-black font-mono leading-none">{count}</span>
                      <span className="text-[9px] uppercase tracking-tighter opacity-80 mt-0.5">
                        {count === 1 ? 'report' : 'reports'}
                      </span>
                      {count > 0 && (
                        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-white/90"></span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-600 gap-2">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-slate-700">Risk Tiers:</span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block"></span>
            <span>Low (Manage by routine SOP)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-yellow-300 border border-yellow-400 inline-block"></span>
            <span>Medium (Supervisory review)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block"></span>
            <span>High (Formal CAPA plan)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-red-600 inline-block"></span>
            <span>Critical (Stop Work / Immediate containment)</span>
          </span>
        </div>
        <span className="text-slate-400 text-[11px] italic">
          Click any cell to filter the incident log below
        </span>
      </div>
    </div>
  );
};
