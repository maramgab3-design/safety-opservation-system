import React, { useState } from 'react';
import { SafetyObservation, ObservationStatus, CorrectiveAction } from '../types';
import { 
  X, 
  AlertTriangle, 
  HandMetal, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Building2, 
  User, 
  Calendar, 
  ShieldAlert, 
  Plus, 
  Check, 
  Loader2,
  FileText,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface ObservationDetailModalProps {
  observation: SafetyObservation | null;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: ObservationStatus) => Promise<void>;
  onAddAction: (id: string, action: { actionText: string; assignedTo: string; department: string; dueDate: string }) => Promise<void>;
  onToggleActionStatus: (id: string, actionId: string, status: 'pending' | 'in_progress' | 'completed') => Promise<void>;
  onRunAIAssessment: (obs: SafetyObservation) => Promise<void>;
  isAiAnalyzing: boolean;
}

export const ObservationDetailModal: React.FC<ObservationDetailModalProps> = ({
  observation,
  onClose,
  onUpdateStatus,
  onAddAction,
  onToggleActionStatus,
  onRunAIAssessment,
  isAiAnalyzing,
}) => {
  if (!observation) return null;

  const [newActionText, setNewActionText] = useState('');
  const [newActionAssignee, setNewActionAssignee] = useState('');
  const [newActionDept, setNewActionDept] = useState('Operations');
  const [newActionDate, setNewActionDate] = useState('');
  const [showAddActionForm, setShowAddActionForm] = useState(false);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const handleCreateAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActionText.trim() || !newActionAssignee.trim()) return;
    setIsSubmittingAction(true);
    try {
      await onAddAction(observation.id, {
        actionText: newActionText,
        assignedTo: newActionAssignee,
        department: newActionDept,
        dueDate: newActionDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      });
      setNewActionText('');
      setNewActionAssignee('');
      setShowAddActionForm(false);
    } finally {
      setIsSubmittingAction(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-600 flex items-center justify-center text-white">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {observation.trackingNumber}
                </span>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  {observation.type.replace('_', ' ')}
                </span>
                {observation.stopWorkExercised && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                    <HandMetal className="w-3 h-3 text-rose-600" /> SWA EXERCISED
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight mt-0.5">
                {observation.title}
              </h2>
            </div>
          </div>

          <button
            id="close-detail-modal-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Key Incident Metadata Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5 font-medium">Facility / Asset</span>
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                {observation.facility}
              </span>
              <span className="text-[11px] text-slate-500 block truncate">{observation.specificArea}</span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5 font-medium">IOGP Life-Saving Rule</span>
              <span className="font-bold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200 inline-block truncate max-w-full">
                {observation.iogpRule}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5 font-medium">RAM 5x5 Matrix Rating</span>
              <div className="flex items-center gap-1.5 font-bold">
                <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-black ${
                  observation.riskLevel === 'critical' ? 'bg-red-600 text-white' :
                  observation.riskLevel === 'high' ? 'bg-amber-500 text-slate-950' :
                  observation.riskLevel === 'medium' ? 'bg-yellow-300 text-slate-900' :
                  'bg-emerald-400 text-slate-900'
                }`}>
                  {observation.riskLevel}
                </span>
                <span className="text-slate-600 font-mono text-[11px]">
                  (Sev {observation.severity} × Lik {observation.likelihood})
                </span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5 font-medium">Investigation Status</span>
              <select
                id="modal-change-status-select"
                value={observation.status}
                onChange={(e) => onUpdateStatus(observation.id, e.target.value as ObservationStatus)}
                className="font-bold text-xs bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="open">Open</option>
                <option value="investigating">Investigating</option>
                <option value="action_assigned">Action Assigned</option>
                <option value="closed">Closed &amp; Verified</option>
              </select>
            </div>
          </div>

          {/* Narrative & Immediate Containment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Hazard Observation Narrative
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {observation.description}
              </p>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <User className="w-3 h-3 text-slate-400" />
                  Reported by: <strong className="text-slate-700">{observation.reportedBy.name}</strong> ({observation.reportedBy.badgeNumber})
                </span>
                <span className="font-mono">
                  {new Date(observation.timestamp).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-2xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
                Immediate Action &amp; Barrier Secured
              </h3>
              <p className="text-xs text-slate-700 leading-relaxed bg-emerald-50/60 p-3 rounded-lg border border-emerald-100">
                {observation.immediateActionTaken || 'No immediate action was noted at declaration time.'}
              </p>
              {observation.stopWorkExercised && (
                <div className="mt-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                  <HandMetal className="w-4 h-4 text-rose-600 shrink-0" />
                  <span><strong>Stop Work Authority (SWA) Invoked:</strong> Deck personnel stood down until supervisor re-evaluated risk envelope.</span>
                </div>
              )}
            </div>
          </div>

          {/* AI Hazard Risk & Barrier Intelligence (Gemini 3.8 Flash) */}
          <div className="border border-amber-200/80 bg-gradient-to-br from-amber-50/40 via-white to-orange-50/30 rounded-xl p-5 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-3 border-b border-amber-200/60">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-md bg-amber-500 text-white">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                    AI Hazard &amp; Safety Protocol Analysis
                  </h3>
                  <span className="text-[10px] font-mono bg-amber-100 text-amber-900 font-semibold px-1.5 py-0.5 rounded">
                    Gemini 3.8 Flash
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Automated barrier defect analysis, potential escalation, and hierarchy of controls
                </p>
              </div>

              <button
                id="refresh-ai-analysis-btn"
                onClick={() => onRunAIAssessment(observation)}
                disabled={isAiAnalyzing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isAiAnalyzing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing Hazard...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Re-Analyze with AI</span>
                  </>
                )}
              </button>
            </div>

            {observation.aiHazardAssessment ? (
              <div className="space-y-3.5 text-xs">
                <div className="p-3 bg-white/80 rounded-lg border border-amber-200/60">
                  <span className="font-bold text-slate-900 block mb-0.5">Root Hazard Synopsis:</span>
                  <p className="text-slate-700 leading-relaxed">{observation.aiHazardAssessment.summary}</p>
                  <p className="text-red-700 font-medium mt-1">
                    Worst-Case Escalation: {observation.aiHazardAssessment.potentialEscalation}
                  </p>
                </div>

                {/* Hierarchy of Controls 3-Col */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="font-bold text-indigo-700 block mb-1">1. Engineering Controls</span>
                    <p className="text-slate-600 leading-normal">{observation.aiHazardAssessment.hierarchyOfControls.engineering}</p>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="font-bold text-blue-700 block mb-1">2. Administrative SOPs</span>
                    <p className="text-slate-600 leading-normal">{observation.aiHazardAssessment.hierarchyOfControls.administrative}</p>
                  </div>
                  <div className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="font-bold text-emerald-700 block mb-1">3. Personal Protective Equip</span>
                    <p className="text-slate-600 leading-normal">{observation.aiHazardAssessment.hierarchyOfControls.ppe}</p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-900 block">Recommended Site Protocol Update:</span>
                    <p className="text-slate-700">{observation.aiHazardAssessment.recommendedProtocolUpdate}</p>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-[10px] text-slate-400 block font-mono">Suggested Pre-Tour Briefing:</span>
                    <span className="font-semibold text-orange-700 text-[11px]">{observation.aiHazardAssessment.suggestedToolboxTalkTopic}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 bg-white/60 rounded-lg border border-dashed border-amber-200">
                <p className="text-xs text-slate-600 mb-2">No AI hazard assessment generated for this observation yet.</p>
                <button
                  onClick={() => onRunAIAssessment(observation)}
                  disabled={isAiAnalyzing}
                  className="px-3 py-1.5 rounded-lg bg-orange-600 text-white text-xs font-semibold hover:bg-orange-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  Generate AI Assessment &amp; Controls
                </button>
              </div>
            )}
          </div>

          {/* Corrective & Preventative Actions (CAPA) */}
          <div className="border border-slate-200 rounded-xl p-5 bg-white shadow-2xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Corrective &amp; Preventative Actions (CAPA)
                </h3>
                <p className="text-xs text-slate-500">Track accountable action owners, completion verification, and due dates</p>
              </div>

              {!showAddActionForm && (
                <button
                  id="open-add-action-btn"
                  onClick={() => setShowAddActionForm(true)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Action Item
                </button>
              )}
            </div>

            {/* Form to add action */}
            {showAddActionForm && (
              <form onSubmit={handleCreateAction} className="mb-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800">Assign New Corrective Action</div>
                <div>
                  <textarea
                    id="new-action-text-input"
                    rows={2}
                    required
                    placeholder="Specific barrier repair, SOP amendment, or mechanical action required..."
                    value={newActionText}
                    onChange={(e) => setNewActionText(e.target.value)}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-900"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Assignee</label>
                    <input
                      id="new-action-assignee-input"
                      type="text"
                      required
                      placeholder="e.g. John Doe (Lead Mechanic)"
                      value={newActionAssignee}
                      onChange={(e) => setNewActionAssignee(e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Department</label>
                    <input
                      id="new-action-dept-input"
                      type="text"
                      value={newActionDept}
                      onChange={(e) => setNewActionDept(e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-0.5">Target Due Date</label>
                    <input
                      id="new-action-date-input"
                      type="date"
                      value={newActionDate}
                      onChange={(e) => setNewActionDate(e.target.value)}
                      className="w-full p-1.5 bg-white border border-slate-300 rounded focus:outline-none"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddActionForm(false)}
                    className="px-3 py-1 text-xs text-slate-600 hover:text-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingAction}
                    className="px-3.5 py-1.5 rounded-md bg-orange-600 hover:bg-orange-700 text-white text-xs font-semibold cursor-pointer"
                  >
                    {isSubmittingAction ? 'Saving...' : 'Save Action'}
                  </button>
                </div>
              </form>
            )}

            {/* Actions list */}
            {observation.correctiveActions.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No corrective actions logged. Add an action item to track hazard mitigation.
              </div>
            ) : (
              <div className="space-y-2.5">
                {observation.correctiveActions.map((action) => (
                  <div
                    key={action.id}
                    id={`action-item-${action.id}`}
                    className={`p-3 rounded-lg border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                      action.status === 'completed'
                        ? 'bg-emerald-50/40 border-emerald-200 text-slate-700'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="space-y-1 max-w-xl">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${action.status === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        <p className={`font-semibold ${action.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                          {action.actionText}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                        <span>Owner: <strong className="text-slate-700">{action.assignedTo}</strong> ({action.department})</span>
                        <span>Due: <strong className="text-slate-700">{action.dueDate}</strong></span>
                        {action.completedAt && (
                          <span className="text-emerald-700 font-medium">
                            Completed: {new Date(action.completedAt).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                      {action.status !== 'completed' ? (
                        <button
                          onClick={() => onToggleActionStatus(observation.id, action.id, 'completed')}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs cursor-pointer shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Mark Completed
                        </button>
                      ) : (
                        <button
                          onClick={() => onToggleActionStatus(observation.id, action.id, 'in_progress')}
                          className="flex items-center gap-1 px-2 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] cursor-pointer"
                        >
                          Reopen Action
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
          <span className="text-slate-500 font-mono text-[11px]">
            API RP 75 Offshore Safety Audit Trail Logged
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold transition-colors cursor-pointer"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
