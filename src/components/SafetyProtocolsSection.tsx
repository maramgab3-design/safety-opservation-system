import React, { useState, useEffect } from 'react';
import { Sparkles, ShieldCheck, AlertTriangle, BookOpen, CheckCircle, RefreshCw, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { SafetyObservation } from '../types';

interface SafetyProtocolsSectionProps {
  selectedFacility: string;
  observations: SafetyObservation[];
}

interface ProtocolRecommendation {
  area: string;
  currentDeficiency: string;
  recommendedProtocol: string;
  targetStandard: string;
}

export const SafetyProtocolsSection: React.FC<SafetyProtocolsSectionProps> = ({
  selectedFacility,
  observations,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [auditSummary, setAuditSummary] = useState<string>(
    'Cross-asset analysis indicates recurring Line-of-Fire and Pressurized Flowline integrity risks. Upstream drilling decks and downstream fractionation columns exhibit highest barrier stress.'
  );
  const [recommendations, setRecommendations] = useState<ProtocolRecommendation[]>([
    {
      area: 'High Pressure Iron & Acidizing Operations',
      currentDeficiency: 'Hammer union loosening under 7,500 psi pulsating pump runs without secondary mechanical tethering.',
      recommendedProtocol: 'Mandate API RP 54 compliant double-choker whipcheck safety slings and continuous acoustic vibration sensors on all flowlines above 5,000 psi.',
      targetStandard: 'API RP 54 § 9.13 / IOGP Life-Saving Rules',
    },
    {
      area: 'Offshore Crane & Rig Floor Line-of-Fire',
      currentDeficiency: 'Personnel maintaining hand contact on load taglines within 1.5x load swing radius.',
      recommendedProtocol: 'Establish 100% hands-free load handling using rigid non-conductive push-pull poles. Paint magnetic red exclusion radius on all drill decks.',
      targetStandard: 'API RP 2D / IOGP Safe Mechanical Lifting',
    },
    {
      area: 'Confined Space & Cellar Pit Gas Detection',
      currentDeficiency: 'Reliance on single stationary sensor in cellar pit subject to mud/chemical fouling.',
      recommendedProtocol: 'Implement dual-redundant optical sensor topology coupled with mandatory 4-gas personal aspirated monitor verification prior to ladder descent.',
      targetStandard: 'OSHA 1910.146 / API RP 75',
    },
    {
      area: 'Hot Work Permitting in Classified Process Units',
      currentDeficiency: 'Ground return welding cables placed on active hydrocarbon pipe spools.',
      recommendedProtocol: 'Require dedicated magnetic copper grounding directly to structural building members with minimum 5-meter setback from process flanges, verified by designated Fire Watch.',
      targetStandard: 'API RP 2009 / NFPA 51B',
    }
  ]);

  const [implementedProtocols, setImplementedProtocols] = useState<string[]>([
    'Offshore Platform Horizon Alpha: Hands-free push pole SOP-OG-304 officially adopted for all casing running operations.',
    'Permian Wellpad Cluster 14: 15k psi Kevlar flowline restraints deployed on all acid frac skids.',
  ]);

  const runProtocolAudit = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/recommend-protocols', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facility: selectedFacility }),
      });
      const data = await res.json();
      if (data.auditSummary) setAuditSummary(data.auditSummary);
      if (data.protocolRecommendations) setRecommendations(data.protocolRecommendations);
    } catch (err) {
      console.error('Failed to audit protocols:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-md border border-slate-700/60">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold tracking-wider uppercase">
                Continuous Safety Improvement Engine
              </span>
              <span className="text-slate-400 text-xs">
                Asset: <strong>{selectedFacility === 'all' ? 'Enterprise-Wide Fleet' : selectedFacility}</strong>
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              Real-Time Protocol Optimization from Field Observations
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Synthesizing declared near misses, unsafe conditions, and SWA records into prescriptive Standard Operating Procedure (SOP) revisions to eliminate recurring failure modes.
            </p>
          </div>

          <button
            id="run-protocol-audit-btn"
            onClick={runProtocolAudit}
            disabled={isLoading}
            className="self-start md:self-auto flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 active:bg-orange-700 text-white text-xs font-bold shadow-lg shadow-orange-600/30 transition-all cursor-pointer disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Auditing Real-Time Hazards...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Run Real-Time Protocol Audit</span>
              </>
            )}
          </button>
        </div>

        {/* Audit Summary Callout */}
        <div className="mt-5 p-3.5 bg-slate-800/80 rounded-xl border border-slate-700 text-xs text-slate-200 flex items-start gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Active Systemic Risk Analysis:</strong> {auditSummary}
          </p>
        </div>
      </div>

      {/* Protocol Recommendations Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-orange-600" />
              Prescribed Safety Protocol Enhancements
            </h3>
            <p className="text-xs text-slate-500">Actionable revisions to site operating rules grounded in field findings</p>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {recommendations.length} Active Protocol Directives
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec, index) => (
            <div
              key={index}
              className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-100">
                  <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md bg-orange-100 text-orange-800 text-[10px] font-bold flex items-center justify-center">
                      0{index + 1}
                    </span>
                    {rec.area}
                  </span>
                  <span className="text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                    {rec.targetStandard}
                  </span>
                </div>

                <div className="space-y-2 text-xs mb-4">
                  <div className="p-2 bg-rose-50/50 rounded-lg border border-rose-100 text-rose-900">
                    <span className="font-bold block text-[11px] text-rose-800 mb-0.5">Observed Defect Pattern:</span>
                    <p className="leading-relaxed">{rec.currentDeficiency}</p>
                  </div>

                  <div className="p-2 bg-emerald-50/60 rounded-lg border border-emerald-100 text-slate-800">
                    <span className="font-bold block text-[11px] text-emerald-800 mb-0.5">Mandated Protocol Revision:</span>
                    <p className="leading-relaxed">{rec.recommendedProtocol}</p>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-500">IOGP Life-Saving Rules Aligned</span>
                <button
                  onClick={() => {
                    if (!implementedProtocols.includes(rec.recommendedProtocol)) {
                      setImplementedProtocols([`${rec.area}: ${rec.recommendedProtocol}`, ...implementedProtocols]);
                    }
                  }}
                  className="text-xs text-orange-600 hover:text-orange-700 font-semibold flex items-center gap-1 cursor-pointer"
                >
                  Adopt to Site SOP <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Adopted Site Protocols Registry */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Verified &amp; Adopted Site Protocols (Management of Change - MOC)
          </h3>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
            {implementedProtocols.length} Active MOCs
          </span>
        </div>

        <div className="space-y-2">
          {implementedProtocols.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-800">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed font-medium">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
