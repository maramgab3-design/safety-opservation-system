export type ObservationType = 
  | 'near_miss' 
  | 'unsafe_condition' 
  | 'unsafe_act' 
  | 'positive_observation' 
  | 'stop_work_authority';

export type IOGPRule =
  | 'Bypassing Safety Controls'
  | 'Confined Space Entry'
  | 'Energy Isolation (LOTO)'
  | 'Hot Work & Ignition Control'
  | 'Line of Fire'
  | 'Safe Mechanical Lifting'
  | 'Driving & Mobile Equipment'
  | 'Working at Height'
  | 'Toxic Gas & H2S Atmosphere'
  | 'Work Authorization & Permit-to-Work'
  | 'Dropped Objects Prevention'
  | 'Chemical & Hydrocarbon Handling';

export type SeverityLevel = 1 | 2 | 3 | 4 | 5;
export type LikelihoodLevel = 'A' | 'B' | 'C' | 'D' | 'E';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';
export type ObservationStatus = 'open' | 'investigating' | 'action_assigned' | 'closed';

export interface CorrectiveAction {
  id: string;
  actionText: string;
  assignedTo: string;
  department: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  completedAt?: string;
  verificationNotes?: string;
}

export interface AIHazardAssessment {
  summary: string;
  potentialEscalation: string;
  hierarchyOfControls: {
    engineering: string;
    administrative: string;
    ppe: string;
  };
  recommendedProtocolUpdate: string;
  suggestedToolboxTalkTopic: string;
}

export interface SafetyObservation {
  id: string;
  trackingNumber: string; // e.g. "SVO-2026-0419"
  type: ObservationType;
  title: string;
  description: string;
  facility: string;
  specificArea: string;
  timestamp: string;
  reportedBy: {
    name: string;
    badgeNumber: string;
    department: string;
    company: string;
    anonymous: boolean;
  };
  iogpRule: IOGPRule;
  severity: SeverityLevel;
  likelihood: LikelihoodLevel;
  riskLevel: RiskLevel;
  stopWorkExercised: boolean;
  immediateActionTaken: string;
  status: ObservationStatus;
  correctiveActions: CorrectiveAction[];
  aiHazardAssessment?: AIHazardAssessment;
  tags: string[];
}

export interface SafetyMetrics {
  totalObservations: number;
  nearMisses: number;
  unsafeConditions: number;
  unsafeActs: number;
  positiveObservations: number;
  stopWorkCount: number;
  openCorrectiveActions: number;
  closedCorrectiveActions: number;
  safeWorkHoursSinceLTI: number;
  daysWithoutRecordable: number;
  observationClosureRate: number; // percentage
  leadingToLaggingRatio: number;
  criticalHazardsActive: number;
}

export interface FacilityStats {
  facility: string;
  count: number;
  criticalCount: number;
  openActions: number;
}

export interface ToolboxTalk {
  id: string;
  title: string;
  date: string;
  targetShift: 'Morning Tour (Day)' | 'Night Tour (Night)';
  facility: string;
  hazardFocus: string;
  keyHazardsIdentified: string[];
  preventativeMeasures: string[];
  lifeSavingRuleRef: IOGPRule;
  leadSupervisor: string;
}
