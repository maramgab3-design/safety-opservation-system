import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MetricsOverview } from './components/MetricsOverview';
import { RiskMatrix5x5 } from './components/RiskMatrix5x5';
import { AnalyticsCharts } from './components/AnalyticsCharts';
import { ObservationList } from './components/ObservationList';
import { ObservationDetailModal } from './components/ObservationDetailModal';
import { DeclareObservationModal } from './components/DeclareObservationModal';
import { SafetyProtocolsSection } from './components/SafetyProtocolsSection';
import { ToolboxTalksSection } from './components/ToolboxTalksSection';
import { 
  SafetyObservation, 
  SafetyMetrics, 
  ObservationStatus, 
  ToolboxTalk,
  SeverityLevel,
  LikelihoodLevel
} from './types';
import { INITIAL_OBSERVATIONS, INITIAL_TOOLBOX_TALKS } from './data/seedObservations';
import { AlertTriangle, PlusCircle, Sparkles, ShieldAlert, Radio } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'observations' | 'protocols' | 'toolbox'>('dashboard');
  const [selectedFacility, setSelectedFacility] = useState<string>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [selectedMatrixCell, setSelectedMatrixCell] = useState<{ severity: SeverityLevel; likelihood: LikelihoodLevel } | null>(null);

  // Observations state
  const [observations, setObservations] = useState<SafetyObservation[]>(INITIAL_OBSERVATIONS);
  const [selectedObservation, setSelectedObservation] = useState<SafetyObservation | null>(null);
  const [isDeclareModalOpen, setIsDeclareModalOpen] = useState(false);
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);

  // Toolbox talks state
  const [toolboxTalks, setToolboxTalks] = useState<ToolboxTalk[]>(INITIAL_TOOLBOX_TALKS);
  const [isGeneratingTbt, setIsGeneratingTbt] = useState(false);

  // Analytics data
  const [analytics, setAnalytics] = useState<{
    metrics: SafetyMetrics;
    iogpDistribution: Record<string, number>;
    facilityDistribution: Record<string, { total: number; critical: number; openActions: number }>;
    riskMatrixCounts: Record<string, number>;
  }>({
    metrics: {
      totalObservations: INITIAL_OBSERVATIONS.length,
      nearMisses: INITIAL_OBSERVATIONS.filter(o => o.type === 'near_miss').length,
      unsafeConditions: INITIAL_OBSERVATIONS.filter(o => o.type === 'unsafe_condition').length,
      unsafeActs: INITIAL_OBSERVATIONS.filter(o => o.type === 'unsafe_act').length,
      positiveObservations: INITIAL_OBSERVATIONS.filter(o => o.type === 'positive_observation').length,
      stopWorkCount: INITIAL_OBSERVATIONS.filter(o => o.stopWorkExercised).length,
      openCorrectiveActions: 3,
      closedCorrectiveActions: 4,
      safeWorkHoursSinceLTI: 1420500,
      daysWithoutRecordable: 418,
      observationClosureRate: 57,
      leadingToLaggingRatio: 48.5,
      criticalHazardsActive: 3,
    },
    iogpDistribution: {
      'Line of Fire': 2,
      'Toxic Gas & H2S Atmosphere': 1,
      'Chemical & Hydrocarbon Handling': 1,
      'Dropped Objects Prevention': 1,
      'Confined Space Entry': 1,
      'Hot Work & Ignition Control': 1,
      'Driving & Mobile Equipment': 1,
    },
    facilityDistribution: {},
    riskMatrixCounts: {},
  });

  // Fetch observations & analytics from server
  const fetchData = async () => {
    try {
      const [obsRes, analyticsRes, tbtRes] = await Promise.all([
        fetch('/api/observations'),
        fetch('/api/analytics'),
        fetch('/api/toolbox-talks'),
      ]);

      if (obsRes.ok) {
        const obsData = await obsRes.json();
        setObservations(obsData);
      }

      if (analyticsRes.ok) {
        const aData = await analyticsRes.json();
        setAnalytics(aData);
      }

      if (tbtRes.ok) {
        const tData = await tbtRes.json();
        setToolboxTalks(tData);
      }
    } catch (err) {
      console.warn('Using client-side state due to connection / mock state:', err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedFacility]);

  // Handle new observation submission
  const handleCreateObservation = async (obsData: Partial<SafetyObservation>) => {
    try {
      const res = await fetch('/api/observations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(obsData),
      });

      if (res.ok) {
        const created = await res.json();
        setObservations(prev => [created, ...prev]);
        fetchData(); // refresh metrics & analytics
      } else {
        // Fallback local append
        const id = `svo-${Date.now()}`;
        const newObs = {
          ...obsData,
          id,
          trackingNumber: `SVO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          timestamp: new Date().toISOString(),
          status: 'open',
          correctiveActions: [],
        } as SafetyObservation;
        setObservations(prev => [newObs, ...prev]);
      }
    } catch (err) {
      console.error('Error submitting observation:', err);
    }
  };

  // Handle status update
  const handleUpdateStatus = async (id: string, newStatus: ObservationStatus) => {
    try {
      const res = await fetch(`/api/observations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        const updated = await res.json();
        setObservations(prev => prev.map(o => o.id === id ? updated : o));
        if (selectedObservation?.id === id) {
          setSelectedObservation(updated);
        }
        fetchData();
      }
    } catch (err) {
      console.error('Error updating status:', err);
      // Local fallback
      setObservations(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
      if (selectedObservation?.id === id) {
        setSelectedObservation(prev => prev ? { ...prev, status: newStatus } : null);
      }
    }
  };

  // Handle add corrective action
  const handleAddAction = async (id: string, actionData: { actionText: string; assignedTo: string; department: string; dueDate: string }) => {
    try {
      const res = await fetch(`/api/observations/${id}/actions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actionData),
      });

      if (res.ok) {
        const updated = await res.json();
        setObservations(prev => prev.map(o => o.id === id ? updated : o));
        if (selectedObservation?.id === id) {
          setSelectedObservation(updated);
        }
        fetchData();
      }
    } catch (err) {
      console.error('Error adding action:', err);
    }
  };

  // Handle toggle action status
  const handleToggleActionStatus = async (id: string, actionId: string, status: 'pending' | 'in_progress' | 'completed') => {
    try {
      const res = await fetch(`/api/observations/${id}/actions/${actionId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        const updated = await res.json();
        setObservations(prev => prev.map(o => o.id === id ? updated : o));
        if (selectedObservation?.id === id) {
          setSelectedObservation(updated);
        }
        fetchData();
      }
    } catch (err) {
      console.error('Error toggling action status:', err);
    }
  };

  // Run AI Hazard Assessment on specific observation
  const handleRunAIAssessment = async (obs: SafetyObservation) => {
    setIsAiAnalyzing(true);
    try {
      const res = await fetch('/api/ai/analyze-hazard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: obs.title,
          description: obs.description,
          facility: obs.facility,
          specificArea: obs.specificArea,
          iogpRule: obs.iogpRule,
          immediateActionTaken: obs.immediateActionTaken,
          stopWorkExercised: obs.stopWorkExercised,
        }),
      });

      if (res.ok) {
        const aiResult = await res.json();
        const patchRes = await fetch(`/api/observations/${obs.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ aiHazardAssessment: aiResult }),
        });
        if (patchRes.ok) {
          const updated = await patchRes.json();
          setObservations(prev => prev.map(o => o.id === obs.id ? updated : o));
          setSelectedObservation(updated);
        }
      }
    } catch (err) {
      console.error('Failed to run AI assessment:', err);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // Generate AI Toolbox Talk
  const handleGenerateToolboxTalk = async (facility: string, shift: string) => {
    setIsGeneratingTbt(true);
    try {
      const res = await fetch('/api/ai/generate-toolbox-talk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ facility, shift }),
      });

      if (res.ok) {
        const newTalk = await res.json();
        setToolboxTalks(prev => [newTalk, ...prev]);
      }
    } catch (err) {
      console.error('Failed to generate toolbox talk:', err);
    } finally {
      setIsGeneratingTbt(false);
    }
  };

  // Filter observations if a matrix cell is selected
  const displayedObservations = selectedMatrixCell
    ? observations.filter(o => o.severity === selectedMatrixCell.severity && o.likelihood === selectedMatrixCell.likelihood)
    : observations;

  const activeSwaCount = observations.filter(o => (o.stopWorkExercised || o.type === 'stop_work_authority') && o.status !== 'closed').length;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Header */}
      <Header
        selectedFacility={selectedFacility}
        onSelectFacility={(fac) => {
          setSelectedFacility(fac);
          setSelectedMatrixCell(null);
        }}
        onOpenDeclareModal={() => setIsDeclareModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        openSwaAlertCount={activeSwaCount}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
        {/* Leading Indicators Metrics Row */}
        <MetricsOverview
          metrics={analytics.metrics}
          onFilterClick={(type) => {
            setSelectedTypeFilter(type);
            setActiveTab('observations');
          }}
        />

        {/* Tab 1: Real-Time Analytics & 5x5 RAM Matrix */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* 5x5 Risk Assessment Matrix */}
            <RiskMatrix5x5
              matrixCounts={analytics.riskMatrixCounts}
              selectedCell={selectedMatrixCell}
              onSelectCell={(cell) => {
                setSelectedMatrixCell(cell);
                if (cell) {
                  // smooth scroll down to the filtered list
                  const el = document.getElementById('observation-log-section');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            />

            {/* Recharts Analytics Charts */}
            <AnalyticsCharts
              iogpDistribution={analytics.iogpDistribution}
              facilityDistribution={analytics.facilityDistribution}
              metrics={analytics.metrics}
            />

            {/* Quick Observations Register View with filtered items */}
            <div id="observation-log-section">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-800">
                    {selectedMatrixCell ? (
                      <span className="text-orange-600">
                        Filtered by Risk Matrix Cell: Severity {selectedMatrixCell.severity} &amp; Likelihood {selectedMatrixCell.likelihood}
                      </span>
                    ) : (
                      <span>Active Workplace Hazard Stream</span>
                    )}
                  </h3>
                  {selectedMatrixCell && (
                    <button
                      onClick={() => setSelectedMatrixCell(null)}
                      className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
                    >
                      (Clear Matrix Filter)
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setActiveTab('observations')}
                  className="text-xs font-semibold text-orange-600 hover:text-orange-700 cursor-pointer"
                >
                  View Full Register &rarr;
                </button>
              </div>

              <ObservationList
                observations={displayedObservations}
                onSelectObservation={(obs) => setSelectedObservation(obs)}
                selectedTypeFilter={selectedTypeFilter}
                setSelectedTypeFilter={setSelectedTypeFilter}
                selectedFacility={selectedFacility}
                setSelectedFacility={setSelectedFacility}
              />
            </div>
          </div>
        )}

        {/* Tab 2: Full Observation Register & CAPA Workflow */}
        {activeTab === 'observations' && (
          <div className="space-y-4">
            <ObservationList
              observations={displayedObservations}
              onSelectObservation={(obs) => setSelectedObservation(obs)}
              selectedTypeFilter={selectedTypeFilter}
              setSelectedTypeFilter={setSelectedTypeFilter}
              selectedFacility={selectedFacility}
              setSelectedFacility={setSelectedFacility}
            />
          </div>
        )}

        {/* Tab 3: Site Safety Protocols & AI Audits */}
        {activeTab === 'protocols' && (
          <SafetyProtocolsSection
            selectedFacility={selectedFacility}
            observations={observations}
          />
        )}

        {/* Tab 4: Pre-Job Toolbox Talks (TBT) */}
        {activeTab === 'toolbox' && (
          <ToolboxTalksSection
            talks={toolboxTalks}
            selectedFacility={selectedFacility}
            onGenerateTalk={handleGenerateToolboxTalk}
            isGenerating={isGeneratingTbt}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">PetroSafe HSEQ Operations</span>
            <span>&bull;</span>
            <span>API RP 75, IOGP Life-Saving Rules &amp; OSHA 1910 Compliance</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Goal Zero Barrier Verification Active
            </span>
          </div>
        </div>
      </footer>

      {/* Observation Detail Modal */}
      <ObservationDetailModal
        observation={selectedObservation}
        onClose={() => setSelectedObservation(null)}
        onUpdateStatus={handleUpdateStatus}
        onAddAction={handleAddAction}
        onToggleActionStatus={handleToggleActionStatus}
        onRunAIAssessment={handleRunAIAssessment}
        isAiAnalyzing={isAiAnalyzing}
      />

      {/* Declare Observation / Near Miss Modal */}
      <DeclareObservationModal
        isOpen={isDeclareModalOpen}
        onClose={() => setIsDeclareModalOpen(false)}
        onSubmit={handleCreateObservation}
        defaultFacility={selectedFacility}
      />
    </div>
  );
}
