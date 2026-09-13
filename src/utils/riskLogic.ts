import { SeverityLevel, LikelihoodLevel, RiskLevel } from '../types';

/**
 * Standard 5x5 Risk Assessment Matrix (RAM) mapping for Oil & Gas operations
 * Consequence/Severity: 1 (Negligible) to 5 (Catastrophic)
 * Likelihood: A (Rare) to E (Frequent)
 */
export function calculateRiskLevel(severity: SeverityLevel, likelihood: LikelihoodLevel): RiskLevel {
  const likVal = { A: 1, B: 2, C: 3, D: 4, E: 5 }[likelihood] || 1;
  const score = severity * likVal;

  if (severity >= 5 || score >= 16) return 'critical';
  if (severity >= 4 || score >= 10) return 'high';
  if (severity >= 3 || score >= 6) return 'medium';
  return 'low';
}
