import React, { useState } from 'react';
import { SafetyObservation, ObservationType, RiskLevel, ObservationStatus, IOGPRule } from '../types';
import { IOGP_RULES_LIST, OIL_GAS_FACILITIES } from '../data/seedObservations';
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  HandMetal, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  ArrowRight,
  Eye,
  Building2,
  Tag,
  AlertOctagon
} from 'lucide-react';

interface ObservationListProps {
  observations: SafetyObservation[];
  onSelectObservation: (obs: SafetyObservation) => void;
  selectedTypeFilter: string;
  setSelectedTypeFilter: (type: string) => void;
  selectedFacility: string;
  setSelectedFacility: (fac: string) => void;
}

export const ObservationList: React.FC<ObservationListProps> = ({
  observations,
  onSelectObservation,
  selectedTypeFilter,
  setSelectedTypeFilter,
  selectedFacility,
  setSelectedFacility,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [iogpFilter, setIogpFilter] = useState<string>('all');

  // Filter observations
  const filtered = observations.filter((obs) => {
    // Facility
    if (selectedFacility !== 'all' && obs.facility !== selectedFacility) return false;
    // Type
    if (selectedTypeFilter !== 'all' && obs.type !== selectedTypeFilter) return false;
    // Status
    if (statusFilter !== 'all' && obs.status !== statusFilter) return false;
    // Risk
    if (riskFilter !== 'all' && obs.riskLevel !== riskFilter) return false;
    // IOGP
    if (iogpFilter !== 'all' && obs.iogpRule !== iogpFilter) return false;
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = obs.title.toLowerCase().includes(q);
      const matchDesc = obs.description.toLowerCase().includes(q);
      const matchNum = obs.trackingNumber.toLowerCase().includes(q);
      const matchArea = obs.specificArea.toLowerCase().includes(q);
      const matchReporter = obs.reportedBy.name.toLowerCase().includes(q);
      const matchRule = obs.iogpRule.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchNum && !matchArea && !matchReporter && !matchRule) {
        return false;
      }
    }
    return true;
  });

  const getTypeBadge = (type: ObservationType, swa: boolean) => {
    if (type === 'stop_work_authority' || swa) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
          <HandMetal className="w-3 h-3 text-rose-600" />
          Stop Work (SWA)
        </span>
      );
    }
    switch (type) {
      case 'near_miss':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" />
            Near Miss
          </span>
        );
      case 'unsafe_condition':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
            <AlertOctagon className="w-3 h-3 text-red-600" />
            Unsafe Condition
          </span>
        );
      case 'unsafe_act':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
            <AlertTriangle className="w-3 h-3 text-orange-600" />
            Unsafe Act
          </span>
        );
      case 'positive_observation':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
            <ShieldCheck className="w-3 h-3 text-emerald-600" />
            Positive BBS
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            {type}
          </span>
        );
    }
  };

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'critical':
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-red-600 text-white">Critical Risk</span>;
      case 'high':
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-amber-500 text-slate-950">High Risk</span>;
      case 'medium':
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-yellow-300 text-slate-900">Medium Risk</span>;
      case 'low':
      default:
        return <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded bg-emerald-100 text-emerald-800 border border-emerald-200">Low Risk</span>;
    }
  };

  const getStatusBadge = (status: ObservationStatus) => {
    switch (status) {
      case 'open':
        return <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200"><Clock className="w-3 h-3" /> Open</span>;
      case 'investigating':
        return <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200"><Search className="w-3 h-3" /> Investigating</span>;
      case 'action_assigned':
        return <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200"><Tag className="w-3 h-3" /> Action Assigned</span>;
      case 'closed':
        return <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"><CheckCircle2 className="w-3 h-3" /> Closed</span>;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
      {/* Title and Filters Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Workplace Hazard &amp; Near Miss Register</span>
            <span className="text-xs font-mono font-normal bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {filtered.length} of {observations.length}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time tracking of employee declarations, stop-work records, and corrective action workflows
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            id="search-observations-input"
            type="text"
            placeholder="Search tracking #, area, hazard..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Filter Row */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        {/* Type pills */}
        {[
          { id: 'all', label: 'All Types' },
          { id: 'near_miss', label: 'Near Misses' },
          { id: 'stop_work_authority', label: 'Stop Work (SWA)' },
          { id: 'unsafe_condition', label: 'Unsafe Conditions' },
          { id: 'unsafe_act', label: 'Unsafe Acts' },
          { id: 'positive_observation', label: 'Positive BBS' },
        ].map((item) => (
          <button
            key={item.id}
            id={`filter-type-${item.id}`}
            onClick={() => setSelectedTypeFilter(item.id)}
            className={`text-xs px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
              selectedTypeFilter === item.id
                ? 'bg-orange-600 text-white shadow-xs font-semibold'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {item.label}
          </button>
        ))}

        <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block"></div>

        {/* Dropdowns */}
        <select
          id="filter-status-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-xs px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="investigating">Investigating</option>
          <option value="action_assigned">Action Assigned</option>
          <option value="closed">Closed</option>
        </select>

        <select
          id="filter-risk-select"
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          className="text-xs px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none cursor-pointer"
        >
          <option value="all">All Risk Tiers</option>
          <option value="critical">Critical Risk</option>
          <option value="high">High Risk</option>
          <option value="medium">Medium Risk</option>
          <option value="low">Low Risk</option>
        </select>

        <select
          id="filter-iogp-select"
          value={iogpFilter}
          onChange={(e) => setIogpFilter(e.target.value)}
          className="text-xs px-2 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none cursor-pointer max-w-[180px] truncate"
        >
          <option value="all">All IOGP Rules</option>
          {IOGP_RULES_LIST.map((rule) => (
            <option key={rule} value={rule}>
              {rule}
            </option>
          ))}
        </select>
      </div>

      {/* Observation Cards list */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center border-2 border-dashed border-slate-200 rounded-xl">
          <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-sm font-medium text-slate-600">No safety observations found</p>
          <p className="text-xs text-slate-400 mt-1">Try resetting the search query or filters</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((obs) => {
            const completedActions = obs.correctiveActions.filter((a) => a.status === 'completed').length;
            const totalActions = obs.correctiveActions.length;

            return (
              <div
                key={obs.id}
                id={`observation-card-${obs.id}`}
                onClick={() => onSelectObservation(obs)}
                className="group border border-slate-200 hover:border-orange-300 bg-white hover:bg-slate-50/70 rounded-xl p-4 transition-all shadow-2xs hover:shadow-sm cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      {obs.trackingNumber}
                    </span>
                    {getTypeBadge(obs.type, obs.stopWorkExercised)}
                    {getRiskBadge(obs.riskLevel)}
                    <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {obs.iogpRule}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    {getStatusBadge(obs.status)}
                    <span className="text-slate-400 text-[11px] font-mono">
                      {new Date(obs.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {/* Title and description */}
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-orange-600 transition-colors mb-1">
                  {obs.title}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-3">
                  {obs.description}
                </p>

                {/* Footer metadata & actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {obs.facility} &bull; <span className="text-slate-500 font-normal">{obs.specificArea}</span>
                    </span>
                    <span className="text-slate-400">&bull;</span>
                    <span>
                      Reporter: <strong className="text-slate-700">{obs.reportedBy.name}</strong> ({obs.reportedBy.department})
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {totalActions > 0 && (
                      <span className="flex items-center gap-1 text-[11px] font-medium text-slate-600">
                        <CheckCircle2 className={`w-3.5 h-3.5 ${completedActions === totalActions ? 'text-emerald-600' : 'text-amber-500'}`} />
                        CAPA: {completedActions}/{totalActions} closed
                      </span>
                    )}

                    <span className="text-orange-600 font-semibold text-xs flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Review &amp; Mitigate <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
