import { SafetyObservation, ToolboxTalk } from '../types';

export const INITIAL_OBSERVATIONS: SafetyObservation[] = [
  {
    id: 'svo-001',
    trackingNumber: 'SVO-2026-0812',
    type: 'stop_work_authority',
    title: 'Rigger positioned in Line-of-Fire beneath suspended 3.8-ton BOP component',
    description: 'During crane lifting operations on the main rig floor, a roustabout stepped directly under the suspended blowout preventer (BOP) lower ram housing while guiding tagline tension. Stop Work Authority was immediately invoked by the deck safety observer.',
    facility: 'Offshore Platform Horizon Alpha',
    specificArea: 'Rig Floor / Rotary Table V-Door',
    timestamp: '2026-09-11T11:20:00Z',
    reportedBy: {
      name: 'Tariq Al-Mansoor',
      badgeNumber: 'RIG-7741',
      department: 'Drilling & Well Operations',
      company: 'PetroSafe Marine Rigging Ltd',
      anonymous: false,
    },
    iogpRule: 'Line of Fire',
    severity: 4,
    likelihood: 'C',
    riskLevel: 'critical',
    stopWorkExercised: true,
    immediateActionTaken: 'Immediately signaled all-stop with air horn. Crane operator lowered load to deck rest pad. Stand-down safety briefing held with entire crane and rigging crew.',
    status: 'investigating',
    correctiveActions: [
      {
        id: 'ca-101',
        actionText: 'Demarcate red exclusion zone around all heavy lifts using magnetic barrier chains and floor stencil signage.',
        assignedTo: 'Marcus Vance (Rig Superintendent)',
        department: 'HSE / Operations',
        dueDate: '2026-09-14',
        status: 'in_progress',
      },
      {
        id: 'ca-102',
        actionText: 'Review hands-off lifting protocols and mandatory use of push-pull safety poles instead of direct hands-on taglines.',
        assignedTo: 'Elena Rostova (Lead Rigger)',
        department: 'Marine Lifting',
        dueDate: '2026-09-12',
        status: 'pending',
      }
    ],
    aiHazardAssessment: {
      summary: 'Critical Line-of-Fire hazard with potential catastrophic crush/pinch injury from heavy suspended load.',
      potentialEscalation: 'Failure of hoist sling or sudden vessel roll leading to uncontrolled swing and crushed personnel.',
      hierarchyOfControls: {
        engineering: 'Deploy rigid fiberglass push-pull safety poles and magnetic barricade gates to physically isolate lifting envelope.',
        administrative: 'Enforce Step-Back 5x5 dynamic risk assessment before any load leaves deck rests.',
        ppe: 'Standard high-impact hardhat, steel-toe metatarsal boots, and high-visibility level 3 overalls.',
      },
      recommendedProtocolUpdate: 'Amend Offshore Lifting Procedure SOP-OG-304 to mandate non-entry exclusion zone equal to load height + 50%.',
      suggestedToolboxTalkTopic: 'Hands-Free Lifting & Line-of-Fire: Zero Tolerance for Under-Load Stance',
    },
    tags: ['Line of Fire', 'Crane Operations', 'Rig Floor', 'SWA', 'High Potential']
  },
  {
    id: 'svo-002',
    trackingNumber: 'SVO-2026-0811',
    type: 'unsafe_condition',
    title: 'Defective fixed H2S sensor head with yellow fault flag in cellar pit',
    description: 'During pre-tour rounds, sensor head H2S-DT-04 in the wellhead cellar pit showed a blinking amber trouble status and failed bump response test during routine zero calibration check.',
    facility: 'Deepwater Drillship Atlas',
    specificArea: 'Subsea Wellhead Cellar Pit / Moonpool Bay',
    timestamp: '2026-09-11T09:15:00Z',
    reportedBy: {
      name: 'Sarah Chen',
      badgeNumber: 'ENG-9022',
      department: 'Instrumentation & Electrical',
      company: 'Apex Offshore Drilling Corp',
      anonymous: false,
    },
    iogpRule: 'Toxic Gas & H2S Atmosphere',
    severity: 4,
    likelihood: 'C',
    riskLevel: 'high',
    stopWorkExercised: false,
    immediateActionTaken: 'Posted red DO NOT ENTER tag at cellar pit access ladder. Placed portable 4-gas pumped area monitor with 100dB telemetry sounder at landing.',
    status: 'action_assigned',
    correctiveActions: [
      {
        id: 'ca-103',
        actionText: 'Replace electro-chemical H2S detector cartridge sensor assembly and recalibrate against certified 25ppm test cylinder.',
        assignedTo: 'Dave Kalu (I&E Specialist)',
        department: 'Maintenance',
        dueDate: '2026-09-12',
        status: 'in_progress',
      }
    ],
    aiHazardAssessment: {
      summary: 'Loss of toxic gas detection barrier in confined/low-point area with potential hydrocarbon or sour gas ingress.',
      potentialEscalation: 'Undetected hydrogen sulfide buildup causing acute inhalation hazard, loss of consciousness, or fatality upon entry.',
      hierarchyOfControls: {
        engineering: 'Dual redundant sensor arrangement with automatic audio/visual strobes tied to rig ESD (Emergency Shutdown).',
        administrative: 'Mandate entry permit and continuous personal multi-gas detector for all moonpool cellar access.',
        ppe: 'Positive pressure 30-minute SCBA required for standby rescue team during cellar operations.',
      },
      recommendedProtocolUpdate: 'Audit all Class 1 Div 1 fixed gas detection bump test schedules across fleet.',
      suggestedToolboxTalkTopic: 'H2S Toxic Gas Awareness & Secondary Detection Protocols',
    },
    tags: ['H2S', 'Gas Detection', 'Cellar Pit', 'Confined Space', 'I&E']
  },
  {
    id: 'svo-003',
    trackingNumber: 'SVO-2026-0808',
    type: 'near_miss',
    title: 'High-pressure chiksan swivel line vibration during coil tubing acid squeeze',
    description: 'During 7,500 psi acid stimulation pumping, extreme hammer pulsation caused temporary loosening of hammer-union safety lock ring on the 2-inch treatsline elbow. Operator throttled back pumps immediately before seal blowout.',
    facility: 'Permian Wellpad Cluster 14',
    specificArea: 'Wellhead Christmas Tree Flow Wing / Manifold Skid',
    timestamp: '2026-09-10T16:40:00Z',
    reportedBy: {
      name: 'James Walker',
      badgeNumber: 'FRAC-3310',
      department: 'Well Stimulation Services',
      company: 'Permian Energy Resources',
      anonymous: false,
    },
    iogpRule: 'Chemical & Hydrocarbon Handling',
    severity: 4,
    likelihood: 'B',
    riskLevel: 'high',
    stopWorkExercised: true,
    immediateActionTaken: 'Depressurized iron treatsline to 0 psi via bleed-off choke manifold. Inspected hammer union threads for erosion and replaced elastomeric O-ring seal.',
    status: 'investigating',
    correctiveActions: [
      {
        id: 'ca-104',
        actionText: 'Install certified hobble restraint safety slings (Whipcheck / Flowline Restraint) at all 90-degree iron bends.',
        assignedTo: 'Carlos Santana (Lead Pumping Tech)',
        department: 'Pressure Pumping',
        dueDate: '2026-09-13',
        status: 'completed',
        completedAt: '2026-09-11T08:00:00Z',
        verificationNotes: 'All 8 chiksan elbows secured with tested 15k psi rated Kevlar restraint straps.',
      },
      {
        id: 'ca-105',
        actionText: 'Ultrasonic thickness wall gauge testing on high-erosion discharge spool.',
        assignedTo: 'NDT Inspection Team',
        department: 'Asset Integrity',
        dueDate: '2026-09-15',
        status: 'pending',
      }
    ],
    aiHazardAssessment: {
      summary: 'Near-catastrophic high-pressure iron failure during chemical pumping with potential whip impact and acid spray.',
      potentialEscalation: 'Pressurized joint detachment causing severed flowline, catastrophic fluid release, and high velocity mechanical impact.',
      hierarchyOfControls: {
        engineering: 'Mandatory continuous restraint system (Whipcheck or Iron-Vest) engineered for maximum pump rating.',
        administrative: 'Automated pressure-drop shutdown interlocks on high-pressure positive displacement pumps.',
        ppe: 'Chemical splash face shield, butyl acid apron, and chemical resistant gauntlet gloves.',
      },
      recommendedProtocolUpdate: 'Enforce Pre-Pumping High Pressure Iron Inspection Checklist under API RP 54.',
      suggestedToolboxTalkTopic: 'Pressurized Systems Safety: Iron Integrity and Restraint Verification',
    },
    tags: ['High Pressure', 'Acidizing', 'Wellhead', 'Flowline Restraints', 'Near Miss']
  },
  {
    id: 'svo-004',
    trackingNumber: 'SVO-2026-0805',
    type: 'unsafe_condition',
    title: 'Scaffold platform missing toe boards and mid-rail on level 4 fractionator',
    description: 'Scaffold tag displayed Green (Safe for Use), however a 3-meter section on the south deck of Level 4 lacked kickboards (toe-boards) directly above an active personnel walkway and hot pump bay.',
    facility: 'Gulf Coast Olefins Refinery Unit 3',
    specificArea: 'Fractionation Column C-301 South Catwalk',
    timestamp: '2026-09-10T11:05:00Z',
    reportedBy: {
      name: 'Fatima Al-Hassan',
      badgeNumber: 'REF-5120',
      department: 'Health, Safety & Environment',
      company: 'Gulf Coast Refining & Petrochemicals',
      anonymous: false,
    },
    iogpRule: 'Dropped Objects Prevention',
    severity: 3,
    likelihood: 'D',
    riskLevel: 'medium',
    stopWorkExercised: false,
    immediateActionTaken: 'Flipped scaffold tag to RED (Unsafe - Do Not Enter). Barricaded ground-level access underneath with caution tape.',
    status: 'closed',
    correctiveActions: [
      {
        id: 'ca-106',
        actionText: 'Mobilize scaffolding contractor to install regulation 150mm toe-boards and mid-rail mesh netting.',
        assignedTo: 'Scaffold Supervisor Liam O’Connor',
        department: 'Civil Maintenance',
        dueDate: '2026-09-10',
        status: 'completed',
        completedAt: '2026-09-10T14:30:00Z',
        verificationNotes: 'Scaffold reinspected by HSE auditor and Green tagged.',
      }
    ],
    aiHazardAssessment: {
      summary: 'Elevated dropped object hazard over active personnel pathway with deficient secondary barrier.',
      potentialEscalation: 'Heavy hand tools, scaffolding clamps, or debris kicked off platform resulting in strike to personnel below.',
      hierarchyOfControls: {
        engineering: 'Install fine mesh debris safety netting along entire perimeter of elevated work deck.',
        administrative: 'Implement 100% tool tethering (Drops lanyard policy) above 2 meters elevation.',
        ppe: 'Hardhat with chin strap tightened, safety glasses with side shields.',
      },
      recommendedProtocolUpdate: 'Require 2-person sign-off on all scaffold safety tag issuances adjacent to active process units.',
      suggestedToolboxTalkTopic: 'DROPS Prevention: Securing Elevated Work Areas & Proper Tagging',
    },
    tags: ['Dropped Objects', 'Scaffolding', 'Working at Height', 'Refinery', 'Closed']
  },
  {
    id: 'svo-005',
    trackingNumber: 'SVO-2026-0801',
    type: 'positive_observation',
    title: 'Exemplary Stop Work & multi-gas re-test prior to Crude Heater entry',
    description: 'During turnaround inspection preparation, contractor operator noticed slight gasoline odor near heater manway despite previous gas-free certificate. He halted entry, exercised SWA, and requested fresh atmospheric testing which detected 15% LEL pockets.',
    facility: 'Gulf Coast Olefins Refinery Unit 3',
    specificArea: 'Crude Vacuum Furnace F-101 Manway',
    timestamp: '2026-09-09T08:30:00Z',
    reportedBy: {
      name: 'Ahmed Benali',
      badgeNumber: 'SAF-1109',
      department: 'Operations & Process Safety',
      company: 'SafeGuard Industrial Solutions',
      anonymous: false,
    },
    iogpRule: 'Confined Space Entry',
    severity: 1,
    likelihood: 'A',
    riskLevel: 'low',
    stopWorkExercised: true,
    immediateActionTaken: 'Praised operator on the spot. Re-purged heater furnace with nitrogen and forced mechanical eductor ventilation for 4 hours until 0% LEL verified across all internal elevations.',
    status: 'closed',
    correctiveActions: [
      {
        id: 'ca-107',
        actionText: 'Issue Monthly Safety Champion recognition award and document case study for site training.',
        assignedTo: 'Nadia Solis (VP Process Safety)',
        department: 'HSE Corporate',
        dueDate: '2026-09-16',
        status: 'completed',
        completedAt: '2026-09-09T17:00:00Z',
      }
    ],
    tags: ['Positive Observation', 'SWA', 'Confined Space', 'LEL Prevention', 'Safety Leadership']
  },
  {
    id: 'svo-006',
    trackingNumber: 'SVO-2026-0798',
    type: 'unsafe_act',
    title: 'Welder ground clamp attached to active process hydrocarbon pipe spool',
    description: 'Contract fabricator preparing structural support gusset clamped welding ground return cable onto an adjacent 6-inch condensates return line instead of the actual I-beam work piece.',
    facility: 'Eagle Ford Compressor Terminal',
    specificArea: 'Gas Dehydration Skid & Reboiler Yard',
    timestamp: '2026-09-08T13:45:00Z',
    reportedBy: {
      name: 'Robert Miller',
      badgeNumber: 'PLT-4402',
      department: 'Mechanical Maintenance',
      company: 'Midstream Operators Alliance',
      anonymous: false,
    },
    iogpRule: 'Hot Work & Ignition Control',
    severity: 4,
    likelihood: 'C',
    riskLevel: 'high',
    stopWorkExercised: true,
    immediateActionTaken: 'Struck machine power isolator immediately. Re-positioned grounding clamp directly to structural steel beam after wire brushing paint.',
    status: 'action_assigned',
    correctiveActions: [
      {
        id: 'ca-108',
        actionText: 'Conduct mandatory Hot Work Permit re-briefing for all contractor welding personnel.',
        assignedTo: 'Danielle Brooks (Permit Officer)',
        department: 'Safety Compliance',
        dueDate: '2026-09-13',
        status: 'pending',
      }
    ],
    aiHazardAssessment: {
      summary: 'Direct arc strike risk onto active hydrocarbon containment vessel leading to pinhole burn-through or ignition.',
      potentialEscalation: 'Electrical arcing creating hot-spot localized wall thinning and hydrocarbon gas fire in classified zone.',
      hierarchyOfControls: {
        engineering: 'Dedicated magnetic ground clamps with built-in impedance check interlocks.',
        administrative: 'Rigorous 360-degree Hot Work permit inspection by designated fire watch prior to striking arc.',
        ppe: 'Flame-retardant Nomex clothing and full face auto-darkening welding hood.',
      },
      recommendedProtocolUpdate: 'Amend Hot Work Permitting SOP to forbid grounding within 5 meters of active hydrocarbon pipe flanging.',
      suggestedToolboxTalkTopic: 'Electrical Grounding & Arc Strike Hazards in Hydrocarbon Facilities',
    },
    tags: ['Hot Work', 'Ignition Control', 'Welding', 'Arc Strike', 'SWA']
  },
  {
    id: 'svo-007',
    trackingNumber: 'SVO-2026-0792',
    type: 'near_miss',
    title: 'Forklift operator nearly struck pedestrian rounding blind blind corner',
    description: 'A 5-ton diesel warehouse forklift traveling with empty mast negotiated blind corner around mud chemical warehouse at approximately 15 km/h, nearly clipping an instrument technician exiting doorway.',
    facility: 'Offshore Platform Horizon Alpha',
    specificArea: 'Lower Deck Mud Chemical Warehouse Alleyway',
    timestamp: '2026-09-07T10:10:00Z',
    reportedBy: {
      name: 'Anonymous Employee',
      badgeNumber: 'ANON',
      department: 'Logistics',
      company: 'Contract Logistics Inc',
      anonymous: true,
    },
    iogpRule: 'Driving & Mobile Equipment',
    severity: 3,
    likelihood: 'D',
    riskLevel: 'medium',
    stopWorkExercised: false,
    immediateActionTaken: 'Speed limit reinforced verbally to driver. Floor pedestrian walking lanes re-cleared of staging pallets.',
    status: 'closed',
    correctiveActions: [
      {
        id: 'ca-109',
        actionText: 'Install convex wide-angle safety traffic mirror at blind corner entrance.',
        assignedTo: 'Warehouse Lead Greg Schultz',
        department: 'Logistics & Warehousing',
        dueDate: '2026-09-10',
        status: 'completed',
        completedAt: '2026-09-08T16:00:00Z',
      },
      {
        id: 'ca-110',
        actionText: 'Paint high-visibility yellow pedestrian crossing striping and add 5 km/h speed limiter to forklift vehicle.',
        assignedTo: 'Facility Maintenance',
        department: 'Infrastructure',
        dueDate: '2026-09-11',
        status: 'completed',
        completedAt: '2026-09-09T11:00:00Z',
      }
    ],
    tags: ['Mobile Equipment', 'Traffic Management', 'Pedestrian Safety', 'Near Miss']
  }
];

export const INITIAL_TOOLBOX_TALKS: ToolboxTalk[] = [
  {
    id: 'tbt-1',
    title: 'Pre-Tour Safety Meeting: Line-of-Fire & Dynamic Deck Hazards',
    date: '2026-09-11',
    targetShift: 'Morning Tour (Day)',
    facility: 'Offshore Platform Horizon Alpha',
    hazardFocus: 'Suspended load path violations and rotating machinery blind zones',
    keyHazardsIdentified: [
      'Uncontrolled load swing during cross-deck transfer in 25 knot wind gust',
      'Personnel stepping into pinch zones near drawworks hydraulic cathead',
      'Communication breakdown between crane banksman and deck rigger'
    ],
    preventativeMeasures: [
      'Strict 100% hands-free policy using fiberglass push poles',
      'Clear red perimeter tape around entire hoist trajectory radius',
      'Test two-way intrinsically safe radio channels prior to lift'
    ],
    lifeSavingRuleRef: 'Line of Fire',
    leadSupervisor: 'Marcus Vance, Rig Superintendent'
  },
  {
    id: 'tbt-2',
    title: 'Pre-Job Briefing: High-Pressure Iron & Hammer Union Integrity',
    date: '2026-09-11',
    targetShift: 'Morning Tour (Day)',
    facility: 'Permian Wellpad Cluster 14',
    hazardFocus: 'Pumping operations above 5,000 psi and line vibration fatigue',
    keyHazardsIdentified: [
      'Micro-fissures in swivel elbow female unions from acid erosion',
      'Missing or unpinned whip-check restraint cables',
      'Personnel in high-pressure exclusion zone during pressure test'
    ],
    preventativeMeasures: [
      'Visual inspect all wing nut lugs before torqueing with brass hammer',
      'Step back beyond exclusion tape during 1.25x working pressure hold test',
      'Continuous pressure sensor readouts monitored by control cabin tech'
    ],
    lifeSavingRuleRef: 'Chemical & Hydrocarbon Handling',
    leadSupervisor: 'Carlos Santana, Lead Pumping Tech'
  }
];

export const OIL_GAS_FACILITIES = [
  'Offshore Platform Horizon Alpha',
  'Deepwater Drillship Atlas',
  'Permian Wellpad Cluster 14',
  'Gulf Coast Olefins Refinery Unit 3',
  'Eagle Ford Compressor Terminal'
];

export const IOGP_RULES_LIST = [
  'Bypassing Safety Controls',
  'Confined Space Entry',
  'Energy Isolation (LOTO)',
  'Hot Work & Ignition Control',
  'Line of Fire',
  'Safe Mechanical Lifting',
  'Driving & Mobile Equipment',
  'Working at Height',
  'Toxic Gas & H2S Atmosphere',
  'Work Authorization & Permit-to-Work',
  'Dropped Objects Prevention',
  'Chemical & Hydrocarbon Handling'
] as const;
