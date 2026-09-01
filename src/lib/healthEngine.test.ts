import { describe, expect, it } from 'vitest';
import {
  DIMENSION_WEIGHTS,
  calculateHealthScore,
  deriveHealthStatus,
  resolveHealthSnapshot,
} from './healthEngine';
import type { HealthDimensions } from '../types/health';
import type { HealthSnapshotInput } from '../types/healthSnapshot';

describe('DIMENSION_WEIGHTS', () => {
  it('sums to 1', () => {
    const total = Object.values(DIMENSION_WEIGHTS).reduce((sum, weight) => sum + weight, 0);
    expect(total).toBeCloseTo(1);
  });
});

describe('calculateHealthScore + deriveHealthStatus — seed calibration values', () => {
  it('Siemens resolves to 95 / green', () => {
    const dimensions: HealthDimensions = {
      valueProgress: 98,
      workflowAdoption: 95,
      championEngagement: 100,
      requiredRoleActivation: 90,
      executionRisk: 92,
    };
    const score = calculateHealthScore(dimensions);
    expect(score).toBe(95);
    expect(deriveHealthStatus(score)).toBe('green');
  });

  it('Grupo Balle resolves to 77 / yellow', () => {
    const dimensions: HealthDimensions = {
      valueProgress: 76,
      workflowAdoption: 74,
      championEngagement: 80,
      requiredRoleActivation: 85,
      executionRisk: 76,
    };
    const score = calculateHealthScore(dimensions);
    expect(score).toBe(77);
    expect(deriveHealthStatus(score)).toBe('yellow');
  });

  it('Manprec resolves to 82 / green', () => {
    const dimensions: HealthDimensions = {
      valueProgress: 85,
      workflowAdoption: 78,
      championEngagement: 95,
      requiredRoleActivation: 85,
      executionRisk: 68,
    };
    const score = calculateHealthScore(dimensions);
    expect(score).toBe(82);
    expect(deriveHealthStatus(score)).toBe('green');
  });

  it('Fibroptica resolves to 76 / yellow', () => {
    const dimensions: HealthDimensions = {
      valueProgress: 82,
      workflowAdoption: 75,
      championEngagement: 85,
      requiredRoleActivation: 55,
      executionRisk: 78,
    };
    const score = calculateHealthScore(dimensions);
    expect(score).toBe(76);
    expect(deriveHealthStatus(score)).toBe('yellow');
  });
});

describe('deriveHealthStatus boundaries', () => {
  it('handles the score extremes', () => {
    expect(deriveHealthStatus(0)).toBe('red');
    expect(deriveHealthStatus(100)).toBe('green');
  });

  it('draws the red/yellow boundary at 59/60', () => {
    expect(deriveHealthStatus(59)).toBe('red');
    expect(deriveHealthStatus(60)).toBe('yellow');
  });

  it('draws the yellow/green boundary at 79/80', () => {
    expect(deriveHealthStatus(79)).toBe('yellow');
    expect(deriveHealthStatus(80)).toBe('green');
  });
});

describe('resolveHealthSnapshot — override behavior', () => {
  const baseInput: HealthSnapshotInput = {
    id: 'snap-test',
    customerId: 'test-customer',
    snapshotDate: '2026-09-01',
    dimensions: {
      valueProgress: 90,
      workflowAdoption: 90,
      championEngagement: 90,
      requiredRoleActivation: 90,
      executionRisk: 90,
    },
    trend: 'stable',
    confidence: 'high',
    lifecycle: 'adoption',
    approved: true,
  };

  it('with no override, finalScore/finalStatus equal the calculated values', () => {
    const resolved = resolveHealthSnapshot(baseInput);
    expect(resolved.calculatedScore).toBe(90);
    expect(resolved.calculatedStatus).toBe('green');
    expect(resolved.finalScore).toBe(resolved.calculatedScore);
    expect(resolved.finalStatus).toBe(resolved.calculatedStatus);
  });

  it('a score_cap override changes finalScore without changing calculatedScore', () => {
    const resolved = resolveHealthSnapshot({
      ...baseInput,
      override: { type: 'score_cap', finalScore: 69, reason: 'Risk rule / Yellow Cap applied' },
    });
    expect(resolved.calculatedScore).toBe(90); // unaffected by the override
    expect(resolved.finalScore).toBe(69);
    expect(resolved.finalStatus).toBe('yellow'); // re-derived from the capped finalScore
  });

  it('a status_override changes finalStatus directly', () => {
    const resolved = resolveHealthSnapshot({
      ...baseInput,
      override: { type: 'status_override', finalStatus: 'red', reason: 'Manual escalation' },
    });
    expect(resolved.calculatedStatus).toBe('green'); // unaffected by the override
    expect(resolved.finalStatus).toBe('red');
    expect(resolved.finalScore).toBe(resolved.calculatedScore); // no finalScore override given
  });
});
