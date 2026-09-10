import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createCustomerUpdate, addProposedCustomerChange, reviewProposedCustomerChange } from '../../services/customerUpdateService';
import {
  getHealthSnapshotsForCustomer,
  getNextActionsForCustomer,
  getRisksForCustomer,
} from '../../services/customerRepository';
import { buildRiskAttentionItems } from './customerIntelligenceSelectors';
import { getCustomerContext } from './customerContext';
import type { NewProposedCustomerChangeInput } from '../../types/proposedCustomerChange';

function readSource(relativePath: string): string {
  return readFileSync(fileURLToPath(new URL(relativePath, import.meta.url)), 'utf-8');
}

function createMemoryLocalStorage() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };
}

beforeEach(() => {
  vi.stubGlobal('window', { localStorage: createMemoryLocalStorage() });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

function proposedEvidence(statement: string, sourceDate: string): NewProposedCustomerChangeInput {
  return {
    customerUpdateId: 'filled-by-test',
    customerId: 'manprec',
    operation: 'create',
    entityType: 'evidence',
    proposedValue: {
      statement,
      type: 'meeting_transcript',
      category: 'workflow_adoption',
      source: 'CustomerContext test fixture',
      sourceDate,
      confidence: 'medium',
      verified: false,
      impact: 'positive',
    },
  };
}

describe('getCustomerContext', () => {
  it('exposes machine-readable temporal coverage at runtime', () => {
    const context = getCustomerContext('siemens', '2026-09-08')!;

    expect(context.temporalCoverage).toEqual({
      customer: 'current_state',
      operatingStage: 'as_of',
      productMetrics: 'as_of',
      canonicalEvidence: 'partial_as_of',
      risks: 'current_state_only',
      riskAttention: 'current_state_only',
      commercial: 'as_of',
      commitments: 'current_state_only',
      nextActions: 'current_state_only',
      weeklyActions: 'as_of',
      health: 'as_of',
      missingInformation: 'derived_from_mixed_context',
    });
  });

  it('exposes temporal limitations for fields whose history cannot be fully reconstructed', () => {
    const context = getCustomerContext('siemens', '2026-09-08')!;

    expect(context.temporalLimitations).toEqual(
      expect.arrayContaining([
        {
          field: 'canonicalEvidence',
          reason:
            'Evidence is currently canonical and filtered by sourceDate <= asOfDate, but canonical publication time is not attached to Evidence records.',
        },
        {
          field: 'risks',
          reason: 'Risk status history cannot be reconstructed reliably from the current model.',
        },
        {
          field: 'riskAttention',
          reason: 'Risk status history cannot be reconstructed reliably from the current model.',
        },
        {
          field: 'commitments',
          reason: 'Commitment creation/status history is not versioned.',
        },
        {
          field: 'nextActions',
          reason: 'NextAction has no historical/version timestamp.',
        },
      ]),
    );
    expect(context.temporalLimitations.map((item) => item.field).sort()).toEqual([
      'canonicalEvidence',
      'commitments',
      'nextActions',
      'riskAttention',
      'risks',
    ]);
  });

  it('returns complete structured context for a known customer', () => {
    const context = getCustomerContext('siemens', '2026-09-08')!;

    expect(context.customer.name).toBe('Siemens');
    expect(context.operatingStage).toBe('operating');
    expect(context.productMetrics.hasBaseline).toBe(true);
    expect(context.productMetrics.latestSnapshot?.id).toBe('metrics-siemens-2026-09-08');
    expect(context.canonicalEvidence.length).toBeGreaterThan(0);
    expect(context.risks).toEqual(getRisksForCustomer('siemens'));
    expect(context.commercial.latestSnapshot?.id).toBe('commercial-siemens-2026-09-08');
    expect(context.commitments).toEqual([]);
    expect(context.nextActions).toEqual(getNextActionsForCustomer('siemens'));
    expect(context.weeklyActions.map((action) => action.id)).toContain('wa-siemens-confirm-payment-date');
    expect(context.health?.id).toBe('siemens-2026-09-01');
  });

  it('ASCH works without a ProductMetricSnapshot baseline or invented Health', () => {
    const context = getCustomerContext('asch', '2026-09-08')!;

    expect(context.operatingStage).toBe('ready');
    expect(context.commercial.latestSnapshot?.commercialStatus).toBe('pre_contract');
    expect(context.productMetrics.hasBaseline).toBe(false);
    expect(context.productMetrics.latestSnapshot).toBeUndefined();
    expect(context.productMetrics.canonicalSnapshotsAsOf).toEqual([]);
    expect(context.health).toBeUndefined();
    expect(context.missingInformation).toContainEqual(expect.objectContaining({ field: 'productMetricSnapshot' }));
    expect(context.missingInformation).toContainEqual(expect.objectContaining({ field: 'healthSnapshot' }));
  });

  it('keeps explicit zero activity metrics as zero and does not infer a Risk from them', () => {
    const context = getCustomerContext('siemens', '2026-09-08')!;

    expect(context.productMetrics.latestSnapshot).toMatchObject({
      projectsCreatedInWindow: 0,
      projectsCompletedInWindow: 0,
      projectsErroredInWindow: 0,
      platformErrorsInWindow: 0,
    });
    expect(context.riskAttention.map((item) => item.id)).toEqual(['attention-risk-siemens-regulatory-doc-approval']);
  });

  it('returns only canonical/published Evidence and excludes pending or rejected ProposedChanges', () => {
    const update = createCustomerUpdate({
      customerId: 'manprec',
      source: 'manual_note',
      sourceDate: '2026-09-08',
      submittedBy: 'customer-context-test',
    });

    const pending = addProposedCustomerChange({
      ...proposedEvidence('PENDING_CONTEXT_EVIDENCE_SHOULD_NOT_APPEAR', '2026-09-08'),
      customerUpdateId: update.id,
    });
    const rejected = addProposedCustomerChange({
      ...proposedEvidence('REJECTED_CONTEXT_EVIDENCE_SHOULD_NOT_APPEAR', '2026-09-08'),
      customerUpdateId: update.id,
    });
    reviewProposedCustomerChange(rejected.id, { reviewStatus: 'rejected', reviewedBy: 'cs-test' });

    const statements = getCustomerContext('manprec', '2026-09-08')!.canonicalEvidence.map((item) => item.statement);
    expect(pending.reviewStatus).toBe('pending');
    expect(statements).not.toContain('PENDING_CONTEXT_EVIDENCE_SHOULD_NOT_APPEAR');
    expect(statements).not.toContain('REJECTED_CONTEXT_EVIDENCE_SHOULD_NOT_APPEAR');
  });

  it('does not claim overlay Evidence publication time is historically reconstructed', () => {
    const context = getCustomerContext('manprec', '2026-09-08')!;

    expect(context.temporalCoverage.canonicalEvidence).toBe('partial_as_of');
    expect(context.temporalLimitations).toContainEqual(
      expect.objectContaining({
        field: 'canonicalEvidence',
        reason: expect.stringContaining('canonical publication time is not attached to Evidence records'),
      }),
    );
  });

  it('keeps CommercialStanding separate from Health', () => {
    const context = getCustomerContext('fibroptica', '2026-09-08')!;

    expect(context.commercial.latestSnapshot?.commercialStatus).toBe('healthy');
    expect(context.health?.finalStatus).toBe('yellow');
    expect(context.health).not.toHaveProperty('commercialStatus');
    expect(context.commercial).not.toHaveProperty('finalStatus');
  });

  it('reuses existing Risk attention logic on the context Risk/Evidence/NextAction set', () => {
    const context = getCustomerContext('fibroptica', '2026-09-08')!;

    expect(context.riskAttention).toEqual(
      buildRiskAttentionItems(context.risks, context.canonicalEvidence, context.nextActions),
    );
  });

  it('makes missing data explicit', () => {
    const context = getCustomerContext('asch', '2026-09-08')!;

    expect(context.missingInformation.map((item) => item.field).sort()).toEqual(['healthSnapshot', 'productMetricSnapshot']);
  });

  it('returns undefined for an unknown customer', () => {
    expect(getCustomerContext('unknown-customer', '2026-09-08')).toBeUndefined();
  });

  it('does not import or alter the Health engine behavior', () => {
    expect(getCustomerContext('siemens', '2026-09-08')!.health).toEqual(getHealthSnapshotsForCustomer('siemens')[0]);
    expect(readSource('./customerContext.ts')).not.toMatch(/from ['"].*healthEngine['"]/);
    expect(readSource('./customerIntelligenceSelectors.ts')).not.toMatch(/from ['"].*healthEngine['"]/);
    expect(readSource('../healthEngine.ts')).not.toContain('CustomerContext');
    expect(readSource('../healthEngine.ts')).not.toContain('CommercialStanding');
  });
});

describe('getCustomerContext — asOf semantics', () => {
  it('filters reliable future-dated records out of historical context', () => {
    const context = getCustomerContext('siemens', '2026-09-01')!;

    expect(context.operatingStage).toBeUndefined();
    expect(context.productMetrics.latestSnapshot).toBeUndefined();
    expect(context.commercial.latestSnapshot).toBeUndefined();
    expect(context.weeklyActions).toEqual([]);
    expect(context.health?.snapshotDate).toBe('2026-09-01');
    expect(context.canonicalEvidence.every((item) => item.sourceDate <= '2026-09-01')).toBe(true);
  });
});
