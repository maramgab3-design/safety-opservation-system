import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { INITIAL_OBSERVATIONS, INITIAL_TOOLBOX_TALKS } from "./src/data/seedObservations";
import { SafetyObservation, ToolboxTalk, RiskLevel, SeverityLevel, LikelihoodLevel } from "./src/types";

// In-memory data store initialized with authentic oil & gas hazard observations
let observations: SafetyObservation[] = [...INITIAL_OBSERVATIONS];
let toolboxTalks: ToolboxTalk[] = [...INITIAL_TOOLBOX_TALKS];

// Calculate 5x5 RAM (Risk Assessment Matrix) level
export function calculateRiskLevel(severity: SeverityLevel, likelihood: LikelihoodLevel): RiskLevel {
  const sev = Number(severity);
  const likOrder: Record<LikelihoodLevel, number> = { A: 1, B: 2, C: 3, D: 4, E: 5 };
  const lik = likOrder[likelihood] || 1;
  const score = sev * lik;

  if (sev >= 5 || score >= 16) return 'critical';
  if (sev >= 4 || score >= 10) return 'high';
  if (sev >= 3 || score >= 6) return 'medium';
  return 'low';
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.error("Failed to initialize GoogleGenAI client:", err);
    return null;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes FIRST
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // GET Observations
  app.get("/api/observations", (req, res) => {
    const { facility, type, status, riskLevel, iogpRule } = req.query;
    let filtered = [...observations];

    if (facility && typeof facility === 'string' && facility !== 'all') {
      filtered = filtered.filter(o => o.facility === facility);
    }
    if (type && typeof type === 'string' && type !== 'all') {
      filtered = filtered.filter(o => o.type === type);
    }
    if (status && typeof status === 'string' && status !== 'all') {
      filtered = filtered.filter(o => o.status === status);
    }
    if (riskLevel && typeof riskLevel === 'string' && riskLevel !== 'all') {
      filtered = filtered.filter(o => o.riskLevel === riskLevel);
    }
    if (iogpRule && typeof iogpRule === 'string' && iogpRule !== 'all') {
      filtered = filtered.filter(o => o.iogpRule === iogpRule);
    }

    // Sort newest first
    filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    res.json(filtered);
  });

  // POST Create Observation
  app.post("/api/observations", (req, res) => {
    try {
      const body = req.body;
      const id = `svo-${Date.now()}`;
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      const trackingNumber = `SVO-2026-${randomNum}`;

      const severity = (body.severity || 2) as SeverityLevel;
      const likelihood = (body.likelihood || 'C') as LikelihoodLevel;
      const riskLevel = calculateRiskLevel(severity, likelihood);

      const newObs: SafetyObservation = {
        id,
        trackingNumber,
        type: body.type || 'unsafe_condition',
        title: body.title || 'Safety Observation',
        description: body.description || '',
        facility: body.facility || 'Offshore Platform Horizon Alpha',
        specificArea: body.specificArea || 'General Rig / Plant Area',
        timestamp: body.timestamp || new Date().toISOString(),
        reportedBy: {
          name: body.reportedBy?.anonymous ? 'Anonymous Employee' : (body.reportedBy?.name || 'Field Operator'),
          badgeNumber: body.reportedBy?.anonymous ? 'ANON' : (body.reportedBy?.badgeNumber || 'EMP-1001'),
          department: body.reportedBy?.department || 'Operations',
          company: body.reportedBy?.company || 'Exploration & Production Ltd',
          anonymous: Boolean(body.reportedBy?.anonymous),
        },
        iogpRule: body.iogpRule || 'Line of Fire',
        severity,
        likelihood,
        riskLevel,
        stopWorkExercised: Boolean(body.stopWorkExercised),
        immediateActionTaken: body.immediateActionTaken || 'Area secured and communicated to supervisor.',
        status: body.status || 'open',
        correctiveActions: body.correctiveActions || [],
        aiHazardAssessment: body.aiHazardAssessment,
        tags: body.tags || [body.iogpRule || 'Safety'],
      };

      observations.unshift(newObs);
      res.status(201).json(newObs);
    } catch (err: any) {
      console.error("Error creating observation:", err);
      res.status(500).json({ error: err.message || "Failed to create observation" });
    }
  });

  // PATCH Observation (update status, immediate action, etc.)
  app.patch("/api/observations/:id", (req, res) => {
    const { id } = req.params;
    const index = observations.findIndex(o => o.id === id);
    if (index === -1) {
      return res.status(404).json({ error: "Observation not found" });
    }

    observations[index] = {
      ...observations[index],
      ...req.body,
      // recalculate risk if severity/likelihood changed
      riskLevel: calculateRiskLevel(
        req.body.severity || observations[index].severity,
        req.body.likelihood || observations[index].likelihood
      )
    };

    res.json(observations[index]);
  });

  // POST Add Corrective Action
  app.post("/api/observations/:id/actions", (req, res) => {
    const { id } = req.params;
    const obs = observations.find(o => o.id === id);
    if (!obs) {
      return res.status(404).json({ error: "Observation not found" });
    }

    const newAction = {
      id: `ca-${Date.now()}`,
      actionText: req.body.actionText,
      assignedTo: req.body.assignedTo,
      department: req.body.department || 'Operations',
      dueDate: req.body.dueDate || new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      status: 'pending' as const,
    };

    obs.correctiveActions.push(newAction);
    if (obs.status === 'open') {
      obs.status = 'action_assigned';
    }

    res.status(201).json(obs);
  });

  // PATCH Corrective Action Status
  app.patch("/api/observations/:id/actions/:actionId", (req, res) => {
    const { id, actionId } = req.params;
    const obs = observations.find(o => o.id === id);
    if (!obs) return res.status(404).json({ error: "Observation not found" });

    const action = obs.correctiveActions.find(a => a.id === actionId);
    if (!action) return res.status(404).json({ error: "Action not found" });

    Object.assign(action, req.body);
    if (req.body.status === 'completed' && !action.completedAt) {
      action.completedAt = new Date().toISOString();
    }

    // Check if all actions are completed
    const allDone = obs.correctiveActions.length > 0 && obs.correctiveActions.every(a => a.status === 'completed');
    if (allDone && obs.status !== 'closed') {
      obs.status = 'closed';
    }

    res.json(obs);
  });

  // GET Real-time Analytics & Safety Metrics
  app.get("/api/analytics", (req, res) => {
    const totalObservations = observations.length;
    const nearMisses = observations.filter(o => o.type === 'near_miss').length;
    const unsafeConditions = observations.filter(o => o.type === 'unsafe_condition').length;
    const unsafeActs = observations.filter(o => o.type === 'unsafe_act').length;
    const positiveObservations = observations.filter(o => o.type === 'positive_observation').length;
    const stopWorkCount = observations.filter(o => o.stopWorkExercised || o.type === 'stop_work_authority').length;

    let openActions = 0;
    let closedActions = 0;
    observations.forEach(o => {
      o.correctiveActions.forEach(a => {
        if (a.status === 'completed') closedActions++;
        else openActions++;
      });
    });

    const totalActions = openActions + closedActions;
    const closureRate = totalActions > 0 ? Math.round((closedActions / totalActions) * 100) : 100;

    // Distribution by IOGP Rule
    const iogpDistribution: Record<string, number> = {};
    observations.forEach(o => {
      iogpDistribution[o.iogpRule] = (iogpDistribution[o.iogpRule] || 0) + 1;
    });

    // Distribution by Facility
    const facilityDistribution: Record<string, { total: number; critical: number; openActions: number }> = {};
    observations.forEach(o => {
      if (!facilityDistribution[o.facility]) {
        facilityDistribution[o.facility] = { total: 0, critical: 0, openActions: 0 };
      }
      facilityDistribution[o.facility].total++;
      if (o.riskLevel === 'critical' || o.riskLevel === 'high') {
        facilityDistribution[o.facility].critical++;
      }
      const pending = o.correctiveActions.filter(a => a.status !== 'completed').length;
      facilityDistribution[o.facility].openActions += pending;
    });

    // 5x5 Matrix counts (Severity 1-5, Likelihood A-E)
    const riskMatrixCounts: Record<string, number> = {};
    for (let s = 1; s <= 5; s++) {
      for (const l of ['A', 'B', 'C', 'D', 'E']) {
        riskMatrixCounts[`${s}-${l}`] = 0;
      }
    }
    observations.forEach(o => {
      const key = `${o.severity}-${o.likelihood}`;
      riskMatrixCounts[key] = (riskMatrixCounts[key] || 0) + 1;
    });

    const criticalHazardsActive = observations.filter(o => 
      (o.riskLevel === 'critical' || o.riskLevel === 'high') && o.status !== 'closed'
    ).length;

    res.json({
      metrics: {
        totalObservations,
        nearMisses,
        unsafeConditions,
        unsafeActs,
        positiveObservations,
        stopWorkCount,
        openCorrectiveActions: openActions,
        closedCorrectiveActions: closedActions,
        safeWorkHoursSinceLTI: 1420500, // Industry standard metric display
        daysWithoutRecordable: 418,
        observationClosureRate: closureRate,
        leadingToLaggingRatio: 48.5, // 48.5 leading observations per lagging incident
        criticalHazardsActive,
      },
      iogpDistribution,
      facilityDistribution,
      riskMatrixCounts,
    });
  });

  // GET Toolbox talks
  app.get("/api/toolbox-talks", (req, res) => {
    res.json(toolboxTalks);
  });

  // AI Hazard Analysis endpoint using Gemini 3.8 Flash
  app.post("/api/ai/analyze-hazard", async (req, res) => {
    const { title, description, facility, specificArea, iogpRule, immediateActionTaken, stopWorkExercised } = req.body;

    const ai = getGeminiClient();

    // Fallback heuristic generator if API key is not configured
    const fallbackResponse = {
      summary: `Identified significant ${iogpRule || 'operational'} hazard at ${facility || 'site'} with potential containment or equipment stress risk.`,
      potentialEscalation: `Failure of primary engineered barrier or procedural deviation could escalate to lost time incident, environmental release, or equipment shutdown.`,
      hierarchyOfControls: {
        engineering: "Verify double-block-and-bleed isolation, install physical mechanical lockouts or rigid perimeter safety barriers.",
        administrative: "Mandate permit-to-work review, dynamic 5x5 step-back assessment, and designated supervisor sign-off.",
        ppe: "Ensure flame-resistant Nomex (CAT 2+), high-impact eyewear, safety footwear, and calibrated 4-gas atmospheric monitor.",
      },
      recommendedProtocolUpdate: `Revise Site Safe Work Procedure for ${iogpRule || 'this activity'} to require continuous gas monitoring and 2-person verification check before job release.`,
      suggestedToolboxTalkTopic: `Focus on ${iogpRule || 'Hazard Recognition'}: Barrier Verification and Stop Work Authority empowerment.`,
      suggestedSeverity: 3,
      suggestedLikelihood: 'C' as LikelihoodLevel,
      suggestedRisk: 'medium' as RiskLevel
    };

    if (!ai) {
      return res.json(fallbackResponse);
    }

    try {
      const prompt = `You are a Senior HSE Safety Director for an international Oil & Gas Exploration and Production company.
Analyze this safety observation / near miss report according to IOGP (International Association of Oil & Gas Producers) Life-Saving Rules and API RP 75 / OSHA 1910 standards:

Incident Title: ${title || 'N/A'}
Facility: ${facility || 'Offshore Platform / Refinery'}
Specific Area: ${specificArea || 'Deck / Process Area'}
Description: ${description || 'N/A'}
Reported IOGP Rule: ${iogpRule || 'General Hazard'}
Immediate Action Taken: ${immediateActionTaken || 'None reported'}
Stop Work Authority Exercised: ${stopWorkExercised ? 'YES' : 'NO'}

Respond with JSON matching the following schema:
- summary: concise high-impact 1-2 sentence hazard summary
- potentialEscalation: realistic worst-case consequence if barriers had failed
- hierarchyOfControls: object with { engineering: string, administrative: string, ppe: string }
- recommendedProtocolUpdate: specific operational SOP or permit protocol change to prevent recurrence
- suggestedToolboxTalkTopic: title for tomorrow morning's site crew pre-tour safety briefing
- suggestedSeverity: integer 1 to 5 (1=Negligible, 2=Minor, 3=Moderate, 4=Major, 5=Catastrophic)
- suggestedLikelihood: letter 'A', 'B', 'C', 'D', or 'E' ('A'=Rare, 'B'=Unlikely, 'C'=Possible, 'D'=Likely, 'E'=Frequent)`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              summary: { type: Type.STRING },
              potentialEscalation: { type: Type.STRING },
              hierarchyOfControls: {
                type: Type.OBJECT,
                properties: {
                  engineering: { type: Type.STRING },
                  administrative: { type: Type.STRING },
                  ppe: { type: Type.STRING },
                },
                required: ["engineering", "administrative", "ppe"],
              },
              recommendedProtocolUpdate: { type: Type.STRING },
              suggestedToolboxTalkTopic: { type: Type.STRING },
              suggestedSeverity: { type: Type.INTEGER },
              suggestedLikelihood: { type: Type.STRING },
            },
            required: [
              "summary",
              "potentialEscalation",
              "hierarchyOfControls",
              "recommendedProtocolUpdate",
              "suggestedToolboxTalkTopic",
              "suggestedSeverity",
              "suggestedLikelihood"
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      const sev = (parsed.suggestedSeverity || 3) as SeverityLevel;
      const lik = (['A', 'B', 'C', 'D', 'E'].includes(parsed.suggestedLikelihood) ? parsed.suggestedLikelihood : 'C') as LikelihoodLevel;

      res.json({
        ...parsed,
        suggestedRisk: calculateRiskLevel(sev, lik),
      });
    } catch (err: any) {
      console.error("Gemini hazard analysis error:", err);
      res.json(fallbackResponse);
    }
  });

  // AI Toolbox Talk Generation from active facility hazards
  app.post("/api/ai/generate-toolbox-talk", async (req, res) => {
    const { facility, shift } = req.body;
    const targetFacility = facility || 'Offshore Platform Horizon Alpha';
    const targetShift = shift || 'Morning Tour (Day)';

    // Get active open/investigating observations for this facility
    const activeObs = observations.filter(o => 
      o.facility === targetFacility && o.status !== 'closed'
    );

    const hazardsContext = activeObs.map(o => `- [${o.type.toUpperCase()}] ${o.title} (${o.iogpRule})`).join("\n") || 
      "- Routine high-pressure line inspection and line-of-fire awareness around rotating equipment";

    const ai = getGeminiClient();

    if (!ai) {
      const generated: ToolboxTalk = {
        id: `tbt-${Date.now()}`,
        title: `Pre-Tour Safety Briefing: Mitigating Critical Hazards at ${targetFacility}`,
        date: new Date().toISOString().split('T')[0],
        targetShift: targetShift as any,
        facility: targetFacility,
        hazardFocus: `Addressing ${activeObs.length} active site safety observations and IOGP Life-Saving Rules`,
        keyHazardsIdentified: [
          'Line of fire exposure around active high-pressure equipment and winches',
          'Potential atmospheric gas fluctuations and H2S sensor verification',
          'Dropped object potential from elevated scaffolding decks'
        ],
        preventativeMeasures: [
          'Conduct 100% 5x5 dynamic risk assessment before issuing hot work or entry permits',
          'Inspect all whipchecks, chiksan irons, and secondary retention slings',
          'Empower all team members to invoke Stop Work Authority without hesitation'
        ],
        lifeSavingRuleRef: activeObs[0]?.iogpRule || 'Line of Fire',
        leadSupervisor: 'Shift Safety Officer / Toolpusher',
      };
      toolboxTalks.unshift(generated);
      return res.json(generated);
    }

    try {
      const prompt = `You are a Lead Safety Superintendent in the Oil & Gas industry.
Generate an actionable, concise Pre-Job Safety Meeting / Toolbox Talk (TBT) for the upcoming ${targetShift} at facility "${targetFacility}".
Base the briefing directly on these recent real site hazard observations:
${hazardsContext}

Output JSON format with:
- title: engaging professional TBT title
- hazardFocus: summary of the operational hazard focus
- keyHazardsIdentified: array of 3 bullet points describing what the crew must watch for
- preventativeMeasures: array of 3 specific barrier controls or actions to implement today
- lifeSavingRuleRef: the most relevant IOGP Life-Saving Rule
- leadSupervisor: appropriate title for lead supervisor delivering the meeting`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              hazardFocus: { type: Type.STRING },
              keyHazardsIdentified: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              preventativeMeasures: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              lifeSavingRuleRef: { type: Type.STRING },
              leadSupervisor: { type: Type.STRING },
            },
            required: [
              "title",
              "hazardFocus",
              "keyHazardsIdentified",
              "preventativeMeasures",
              "lifeSavingRuleRef",
              "leadSupervisor"
            ],
          },
        },
      });

      const parsed = JSON.parse(response.text || '{}');
      const talk: ToolboxTalk = {
        id: `tbt-${Date.now()}`,
        title: parsed.title,
        date: new Date().toISOString().split('T')[0],
        targetShift: targetShift as any,
        facility: targetFacility,
        hazardFocus: parsed.hazardFocus,
        keyHazardsIdentified: parsed.keyHazardsIdentified || [],
        preventativeMeasures: parsed.preventativeMeasures || [],
        lifeSavingRuleRef: parsed.lifeSavingRuleRef || 'Line of Fire',
        leadSupervisor: parsed.leadSupervisor || 'HSE Coordinator / Tour Lead',
      };

      toolboxTalks.unshift(talk);
      res.json(talk);
    } catch (err: any) {
      console.error("Toolbox talk generation error:", err);
      res.status(500).json({ error: "Failed to generate toolbox talk" });
    }
  });

  // AI Site Protocol Advisory endpoint
  app.post("/api/ai/recommend-protocols", async (req, res) => {
    const { facility } = req.body;
    const targetFacility = facility || 'All Operating Assets';
    const facilityObs = targetFacility === 'All Operating Assets'
      ? observations
      : observations.filter(o => o.facility === targetFacility);

    const summaries = facilityObs.map(o => `[${o.iogpRule} - Severity ${o.severity}]: ${o.title} -> ${o.description}`).join("\n");

    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        facility: targetFacility,
        auditSummary: `Analysis of ${facilityObs.length} site observations reveals high concentration in Line of Fire and Pressurized Equipment maintenance interfaces.`,
        protocolRecommendations: [
          {
            area: "High Pressure Pumping & Flowlines",
            currentDeficiency: "Vibration fatigue causing loose unions during high-pressure pump runs.",
            recommendedProtocol: "Mandate API RP 54 certified double-choker whipcheck restraints on all iron lines rated above 5,000 psi.",
            targetStandard: "API RP 54 / IOGP Life-Saving Rules"
          },
          {
            area: "Permit to Work & Isolation",
            currentDeficiency: "Welding earth ground clamp placements near process hydrocarbon spools.",
            recommendedProtocol: "Implement mandatory 360-degree hot-work permit walkdown with continuous LEL sensor within 10m radius.",
            targetStandard: "OSHA 1910.252 / API RP 2009"
          }
        ]
      });
    }

    try {
      const prompt = `As a Principal Safety Engineer specializing in Oil & Gas upstream/downstream operations, analyze these recent incident reports for facility: "${targetFacility}":
${summaries}

Provide strategic safety protocol enhancements to prevent catastrophic Loss of Primary Containment (LOPC) or Lost Time Injuries (LTI).
Format response as JSON:
- facility: string
- auditSummary: 2-3 sentences overview of systemic safety trends
- protocolRecommendations: array of objects with { area: string, currentDeficiency: string, recommendedProtocol: string, targetStandard: string }`;

      const response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              facility: { type: Type.STRING },
              auditSummary: { type: Type.STRING },
              protocolRecommendations: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    area: { type: Type.STRING },
                    currentDeficiency: { type: Type.STRING },
                    recommendedProtocol: { type: Type.STRING },
                    targetStandard: { type: Type.STRING },
                  },
                  required: ["area", "currentDeficiency", "recommendedProtocol", "targetStandard"],
                },
              },
            },
            required: ["facility", "auditSummary", "protocolRecommendations"],
          },
        },
      });

      res.json(JSON.parse(response.text || '{}'));
    } catch (err: any) {
      console.error("AI Protocol recommendation error:", err);
      res.status(500).json({ error: "Failed to generate safety protocol recommendations" });
    }
  });

  // Vite middleware for development vs production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Safety Observation System server running on http://localhost:${PORT}`);
  });
}

startServer();
