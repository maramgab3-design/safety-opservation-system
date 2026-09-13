import React, { useState } from 'react';
import { 
  ObservationType, 
  IOGPRule, 
  SeverityLevel, 
  LikelihoodLevel, 
  RiskLevel, 
  SafetyObservation 
} from '../types';
import { calculateRiskLevel } from '../utils/riskLogic';
import { OIL_GAS_FACILITIES, IOGP_RULES_LIST } from '../data/seedObservations';
import { 
  X, 
  AlertTriangle, 
  HandMetal, 
  ShieldAlert, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  Building2,
  HardHat,
  EyeOff
} from 'lucide-react';

interface DeclareObservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (obsData: Partial<SafetyObservation>) => Promise<void>;
  defaultFacility?: string;
}

export const DeclareObservationModal: React.FC<DeclareObservationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  defaultFacility,
}) => {
  if (!isOpen) return null;

  const [type, setType] = useState<ObservationType>('near_miss');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [facility, setFacility] = useState(defaultFacility && defaultFacility !== 'all' ? defaultFacility : OIL_GAS_FACILITIES[0]);
  const [specificArea, setSpecificArea] = useState('');
  const [iogpRule, setIogpRule] = useState<IOGPRule>('Line of Fire');
  const [severity, setSeverity] = useState<SeverityLevel>(3);
  const [likelihood, setLikelihood] = useState<LikelihoodLevel>('C');
  const [stopWorkExercised, setStopWorkExercised] = useState(false);
  const [immediateActionTaken, setImmediateActionTaken] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [reporterName, setReporterName] = useState('');
  const [reporterBadge, setReporterBadge] = useState('');
  const [department, setDepartment] = useState('Operations');
  const [company, setCompany] = useState('Offshore & Production Corp');

  // AI Assistance state
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const calculatedRisk: RiskLevel = calculateRiskLevel(severity, likelihood);

  // Trigger server-side Gemini hazard evaluation to help field worker
  const handleAiAutoAnalyze = async () => {
    if (!description.trim()) {
      alert('Please enter a brief description of the incident or hazard first.');
      return;
    }

    setIsAiAnalyzing(true);
    try {
      const res = await fetch('/api/ai/analyze-hazard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title || 'Field Hazard Report',
          description,
          facility,
          specificArea,
          iogpRule,
          immediateActionTaken,
          stopWorkExercised,
        }),
      });
      const data = await res.json();
      setAiSuggestions(data);
      if (data.suggestedSeverity) setSeverity(data.suggestedSeverity as SeverityLevel);
      if (data.suggestedLikelihood) setLikelihood(data.suggestedLikelihood as LikelihoodLevel);
    } catch (err) {
      console.error('Failed to run AI assistance:', err);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        type,
        title,
        description,
        facility,
        specificArea: specificArea || 'General Facility Area',
        iogpRule,
        severity,
        likelihood,
        riskLevel: calculatedRisk,
        stopWorkExercised,
        immediateActionTaken: immediateActionTaken || 'Secured area and notified supervisor.',
        reportedBy: {
          name: isAnonymous ? 'Anonymous Employee' : (reporterName || 'Field Technician'),
          badgeNumber: isAnonymous ? 'ANON' : (reporterBadge || 'OP-104'),
          department,
          company,
          anonymous: isAnonymous,
        },
        aiHazardAssessment: aiSuggestions ? {
          summary: aiSuggestions.summary,
          potentialEscalation: aiSuggestions.potentialEscalation,
          hierarchyOfControls: aiSuggestions.hierarchyOfControls,
          recommendedProtocolUpdate: aiSuggestions.recommendedProtocolUpdate,
          suggestedToolboxTalkTopic: aiSuggestions.suggestedToolboxTalkTopic,
        } : undefined,
      });
      onClose();
    } catch (err) {
      console.error('Error declaring observation:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-600 flex items-center justify-center text-white">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Declare Hazard Observation or Near Miss
              </h2>
              <p className="text-xs text-slate-500">
                Encouraging zero-blame reporting to strengthen site barrier integrity
              </p>
            </div>
          </div>

          <button
            id="close-declare-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5">
          {/* Observation Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              1. Observation Classification *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'near_miss', label: 'Near Miss', desc: 'No injury, high potential', color: 'border-amber-400 bg-amber-50/50' },
                { id: 'unsafe_condition', label: 'Unsafe Condition', desc: 'Physical plant hazard', color: 'border-red-400 bg-red-50/50' },
                { id: 'unsafe_act', label: 'Unsafe Act', desc: 'Procedural deviation', color: 'border-orange-400 bg-orange-50/50' },
                { id: 'stop_work_authority', label: 'Stop Work (SWA)', desc: 'Work halted immediately', color: 'border-rose-400 bg-rose-50/50' },
                { id: 'positive_observation', label: 'Positive BBS', desc: 'Safe behavior praised', color: 'border-emerald-400 bg-emerald-50/50' },
              ].map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  id={`select-type-${opt.id}`}
                  onClick={() => {
                    setType(opt.id as ObservationType);
                    if (opt.id === 'stop_work_authority') setStopWorkExercised(true);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    type === opt.id
                      ? `${opt.color} ring-2 ring-orange-500 font-bold shadow-xs`
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900">{opt.label}</div>
                  <div className="text-[10px] text-slate-500 leading-tight mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* SWA Toggle Callout */}
          <div className="p-3 rounded-xl border border-rose-200 bg-rose-50/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0">
                <HandMetal className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-rose-950 block">Stop Work Authority (SWA) Exercised</span>
                <span className="text-[11px] text-rose-700">Did anyone halt the job or issue an all-stop horn/signal?</span>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                id="swa-toggle-input"
                type="checkbox"
                checked={stopWorkExercised}
                onChange={(e) => setStopWorkExercised(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
            </label>
          </div>

          {/* Incident Title & Narrative */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                2. Observation Title *
              </label>
              <input
                id="observation-title-input"
                type="text"
                required
                placeholder="e.g. Loose hydraulic high-pressure coupling on mud pump manifold"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white text-slate-900 font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  3. Narrative Description *
                </label>

                {/* AI Assistant Button */}
                <button
                  type="button"
                  id="ai-hazard-analyzer-btn"
                  onClick={handleAiAutoAnalyze}
                  disabled={isAiAnalyzing}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                >
                  {isAiAnalyzing ? (
                    <>
                      <Loader2 className="w-3 h-3 animate-spin" />
                      <span>Analyzing with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3 text-slate-950" />
                      <span>AI Hazard Risk Analyzer</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                id="observation-desc-input"
                rows={3}
                required
                placeholder="Describe specifically what you observed: what equipment was involved, personnel actions, weather conditions, or precursors..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white text-slate-900 leading-relaxed"
              />
            </div>
          </div>

          {/* AI Suggestions Box (if triggered) */}
          {aiSuggestions && (
            <div className="p-3.5 rounded-xl border border-amber-300 bg-amber-50/50 text-xs space-y-2 animate-in fade-in">
              <div className="flex items-center gap-2 text-amber-900 font-bold">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>AI Hazard Risk Analysis &amp; Suggested Controls</span>
              </div>
              <p className="text-slate-700 leading-relaxed">{aiSuggestions.summary}</p>
              <div className="text-[11px] text-red-700 font-semibold">
                Potential Escalation: {aiSuggestions.potentialEscalation}
              </div>
              <div className="text-[11px] text-slate-600">
                <strong>Recommended SOP Update:</strong> {aiSuggestions.recommendedProtocolUpdate}
              </div>
            </div>
          )}

          {/* Facility & Specific Area */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                4. Facility / Operating Asset *
              </label>
              <select
                id="observation-facility-select"
                value={facility}
                onChange={(e) => setFacility(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900 font-medium cursor-pointer"
              >
                {OIL_GAS_FACILITIES.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Exact Work Area / Module *
              </label>
              <input
                id="observation-area-input"
                type="text"
                placeholder="e.g. Drill Floor, Moonpool Bay, Crude Column 101"
                value={specificArea}
                onChange={(e) => setSpecificArea(e.target.value)}
                className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white text-slate-900"
              />
            </div>
          </div>

          {/* IOGP Life Saving Rule */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              5. Relevant IOGP Life-Saving Rule *
            </label>
            <select
              id="observation-iogp-select"
              value={iogpRule}
              onChange={(e) => setIogpRule(e.target.value as IOGPRule)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900 font-medium cursor-pointer"
            >
              {IOGP_RULES_LIST.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* 5x5 RAM Severity & Likelihood Selection */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                6. 5x5 Risk Assessment Matrix (RAM) Rating
              </span>
              <span className={`px-2.5 py-0.5 rounded text-xs uppercase font-black ${
                calculatedRisk === 'critical' ? 'bg-red-600 text-white' :
                calculatedRisk === 'high' ? 'bg-amber-500 text-slate-950' :
                calculatedRisk === 'medium' ? 'bg-yellow-300 text-slate-900' :
                'bg-emerald-400 text-slate-900'
              }`}>
                {calculatedRisk} Risk
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 text-[11px] mb-1 font-medium">
                  Potential Consequence (Severity 1 - 5)
                </label>
                <select
                  id="severity-input-select"
                  value={severity}
                  onChange={(e) => setSeverity(Number(e.target.value) as SeverityLevel)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:outline-none"
                >
                  <option value={1}>1 - Negligible (First aid / Superficial)</option>
                  <option value={2}>2 - Minor (Medical treatment / Contained)</option>
                  <option value={3}>3 - Moderate (Restricted work / Spill)</option>
                  <option value={4}>4 - Major (LTI / Severe release / Structural)</option>
                  <option value={5}>5 - Catastrophic (Fatality / Major blowout)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-500 text-[11px] mb-1 font-medium">
                  Likelihood of Recurrence (A - E)
                </label>
                <select
                  id="likelihood-input-select"
                  value={likelihood}
                  onChange={(e) => setLikelihood(e.target.value as LikelihoodLevel)}
                  className="w-full p-2 bg-white border border-slate-300 rounded-lg text-slate-800 font-semibold focus:outline-none"
                >
                  <option value="A">A - Rare (Never in company)</option>
                  <option value="B">B - Unlikely (Occurred in industry)</option>
                  <option value="C">C - Possible (Occurred at our sites)</option>
                  <option value="D">D - Likely (Annual recurrence on asset)</option>
                  <option value="E">E - Frequent (Weekly or routine)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Immediate Action Taken */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              7. Immediate Action / Barrier Secured
            </label>
            <input
              id="immediate-action-input"
              type="text"
              placeholder="e.g. Barricaded access, closed manual shut-off valve, replaced cotter pin"
              value={immediateActionTaken}
              onChange={(e) => setImmediateActionTaken(e.target.value)}
              className="w-full text-xs p-2.5 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white text-slate-900"
            />
          </div>

          {/* Reporter Information & Psychological Safety (Anonymous Option) */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                8. Reporter Identity &amp; Culture
              </span>
              <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                <input
                  id="anonymous-checkbox"
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="rounded text-orange-600 focus:ring-orange-500"
                />
                <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-semibold">Submit Anonymously (Zero-Blame)</span>
              </label>
            </div>

            {!isAnonymous && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">Your Name</label>
                  <input
                    id="reporter-name-input"
                    type="text"
                    placeholder="e.g. Marcus Vance"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:outline-none text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">Badge / ID</label>
                  <input
                    id="reporter-badge-input"
                    type="text"
                    placeholder="RIG-4421"
                    value={reporterBadge}
                    onChange={(e) => setReporterBadge(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:outline-none text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-0.5">Department</label>
                  <input
                    id="reporter-dept-input"
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full p-2 bg-white border border-slate-300 rounded-lg focus:outline-none text-slate-900"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="submit-observation-form-btn"
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 active:bg-orange-800 text-white text-xs font-bold shadow-md shadow-orange-600/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Logging Observation...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Submit Safety Declaration</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
