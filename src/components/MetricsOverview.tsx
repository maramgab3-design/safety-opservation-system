import React from 'react';
import { 
  AlertOctagon, 
  CheckCircle2, 
  HandMetal, 
  TrendingUp, 
  AlertTriangle,
  Eye,
  Activity
} from 'lucide-react';
import { SafetyMetrics } from '../types';

interface MetricsOverviewProps {
  metrics: SafetyMetrics;
  onFilterClick?: (filterType: string) => void;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({ metrics, onFilterClick }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {/* Total Observations */}
      <div 
        id="metric-total-observations"
        onClick={() => onFilterClick && onFilterClick('all')}
        className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs hover:border-slate-300 transition-all cursor-pointer group"
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Reports</span>
          <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-slate-900 group-hover:text-white transition-colors">
            <Eye className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight">{metrics.totalObservations}</div>
        <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
          <span className="text-emerald-600 font-medium font-mono">+{metrics.nearMisses + metrics.unsafeConditions}</span> this cycle
        </div>
      </div>

      {/* Near Misses (High Value Leading Indicator) */}
      <div 
        id="metric-near-misses"
        onClick={() => onFilterClick && onFilterClick('near_miss')}
        className="bg-white border border-amber-200/80 rounded-xl p-3.5 shadow-2xs hover:border-amber-400 transition-all cursor-pointer group bg-gradient-to-br from-white to-amber-50/30"
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">Near Misses</span>
          <div className="w-6 h-6 rounded-md bg-amber-100 flex items-center justify-center text-amber-700 group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <AlertTriangle className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-bold text-amber-950 tracking-tight">{metrics.nearMisses}</div>
        <div className="text-[11px] text-amber-700/90 mt-1 font-medium">
          Zero-injury precursor calls
        </div>
      </div>

      {/* Stop Work Authority Interventions */}
      <div 
        id="metric-swa-interventions"
        onClick={() => onFilterClick && onFilterClick('stop_work_authority')}
        className="bg-white border border-rose-200 rounded-xl p-3.5 shadow-2xs hover:border-rose-400 transition-all cursor-pointer group bg-gradient-to-br from-white to-rose-50/40"
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-rose-800 uppercase tracking-wider">SWA Stopped</span>
          <div className="w-6 h-6 rounded-md bg-rose-100 flex items-center justify-center text-rose-700 group-hover:bg-rose-600 group-hover:text-white transition-colors">
            <HandMetal className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-bold text-rose-950 tracking-tight">{metrics.stopWorkCount}</div>
        <div className="text-[11px] text-rose-700 mt-1 font-medium flex items-center gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
          Immediate life-savers
        </div>
      </div>

      {/* Critical Active Hazards */}
      <div 
        id="metric-critical-hazards"
        className="bg-white border border-red-200 rounded-xl p-3.5 shadow-2xs"
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-red-800 uppercase tracking-wider">Critical Active</span>
          <div className="w-6 h-6 rounded-md bg-red-100 flex items-center justify-center text-red-700">
            <AlertOctagon className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-bold text-red-950 tracking-tight">{metrics.criticalHazardsActive}</div>
        <div className="text-[11px] text-red-700/80 mt-1 font-medium">
          Tier 1/2 Risk pending CAPA
        </div>
      </div>

      {/* Corrective Actions Closure Rate */}
      <div 
        id="metric-closure-rate"
        className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs"
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">CAPA Closure</span>
          <div className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight">{metrics.observationClosureRate}%</div>
        <div className="text-[11px] text-slate-500 mt-1 font-mono">
          {metrics.closedCorrectiveActions} closed / {metrics.openCorrectiveActions} open
        </div>
      </div>

      {/* Safety Ratio (Heinrich Triangle) */}
      <div 
        id="metric-safety-ratio"
        className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs bg-gradient-to-br from-white to-blue-50/20"
      >
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-semibold text-blue-900 uppercase tracking-wider">Leading Index</span>
          <div className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center text-blue-700">
            <Activity className="w-3.5 h-3.5" />
          </div>
        </div>
        <div className="text-2xl font-bold text-blue-950 tracking-tight">{metrics.leadingToLaggingRatio} : 1</div>
        <div className="text-[11px] text-blue-700/90 mt-1 font-medium flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-blue-600" />
          Proactive culture score
        </div>
      </div>
    </div>
  );
};
