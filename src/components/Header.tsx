import React from 'react';
import { 
  ShieldAlert, 
  PlusCircle, 
  Flame, 
  HardHat, 
  Building2, 
  Radio, 
  Sparkles, 
  AlertTriangle,
  Award
} from 'lucide-react';
import { OIL_GAS_FACILITIES } from '../data/seedObservations';

interface HeaderProps {
  selectedFacility: string;
  onSelectFacility: (fac: string) => void;
  onOpenDeclareModal: () => void;
  activeTab: 'dashboard' | 'observations' | 'protocols' | 'toolbox';
  setActiveTab: (tab: 'dashboard' | 'observations' | 'protocols' | 'toolbox') => void;
  openSwaAlertCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  selectedFacility,
  onSelectFacility,
  onOpenDeclareModal,
  activeTab,
  setActiveTab,
  openSwaAlertCount,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-md sticky top-0 z-30 shadow-xs">
      {/* Top Banner with Operational Safety Status */}
      <div className="bg-slate-900 text-slate-100 text-xs px-4 py-1.5 flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-mono text-emerald-400 font-semibold tracking-wide">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            HSEQ LIVE TELEMETRY
          </span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-300 hidden md:flex items-center gap-1">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <strong className="text-white font-semibold">418 Days</strong> Lost Time Incident (LTI) Free
          </span>
          <span className="text-slate-500 hidden md:inline">|</span>
          <span className="text-slate-300 hidden lg:inline">
            <strong className="text-white font-semibold">1,420,500</strong> Safe Man-Hours Worked
          </span>
        </div>

        <div className="flex items-center gap-3">
          {openSwaAlertCount > 0 && (
            <span className="bg-rose-500/20 text-rose-300 border border-rose-500/40 px-2 py-0.5 rounded-full flex items-center gap-1 font-medium animate-pulse">
              <AlertTriangle className="w-3 h-3 text-rose-400" />
              {openSwaAlertCount} Active SWA Interventions
            </span>
          )}
          <span className="text-slate-400 font-mono text-[11px]">
            IOGP 9 Life-Saving Rules Certified
          </span>
        </div>
      </div>

      {/* Main Nav Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Logo & System Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
            <Flame className="w-6 h-6 text-white stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">
                PetroSafe HSEQ
              </h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                Oil & Gas Safety
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Hazard Observation & Real-Time Safety Protocol System
            </p>
          </div>
        </div>

        {/* Facility Filter & Primary Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 bg-slate-100/90 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700">
            <Building2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="font-medium text-slate-500 hidden md:inline">Asset:</span>
            <select
              id="facility-selector"
              value={selectedFacility}
              onChange={(e) => onSelectFacility(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">All Operating Assets (5)</option>
              {OIL_GAS_FACILITIES.map((fac) => (
                <option key={fac} value={fac}>
                  {fac}
                </option>
              ))}
            </select>
          </div>

          <button
            id="declare-observation-btn"
            onClick={onOpenDeclareModal}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 stroke-[2.5]" />
            <span>Report Hazard / Near Miss</span>
          </button>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 border-t border-slate-100 overflow-x-auto scrollbar-none py-1">
        <button
          id="nav-tab-dashboard"
          onClick={() => setActiveTab('dashboard')}
          className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'dashboard'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          Real-Time Analytics & Risk Matrix
        </button>

        <button
          id="nav-tab-observations"
          onClick={() => setActiveTab('observations')}
          className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'observations'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Observation Log & CAPA
        </button>

        <button
          id="nav-tab-protocols"
          onClick={() => setActiveTab('protocols')}
          className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'protocols'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Site Safety Protocols & AI Audits
        </button>

        <button
          id="nav-tab-toolbox"
          onClick={() => setActiveTab('toolbox')}
          className={`px-3 py-2 text-xs font-semibold rounded-md transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'toolbox'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <HardHat className="w-3.5 h-3.5 text-orange-500" />
          Pre-Job Toolbox Talks (TBT)
        </button>
      </div>
    </header>
  );
};
