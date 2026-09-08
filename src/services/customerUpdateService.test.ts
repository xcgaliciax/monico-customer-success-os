import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createCustomerUpdate,
  getCustomerUpdate,
  getProposedChangesForCustomerUpdate,
  publishCustomerUpdate,
  reviewProposedCustomerChange,
  submitAutomatedChanges,
} from './customerUpdateService';
import {
  getEvidenceForCustomer,
  getLatestHealthSnapshot,
  getOperatingStageForCustomer,
  getProductMetricSnapshotsForCustomer,
} from './customerRepository';
import type { NewProposedCustomerChangeInput } from '../types/proposedCustomerChange';

// The overlay persistence boundary (lib/localStorageStore.ts) reads/writes
// through `window.localStorage` and no-ops when `window` is undefined — true
// in vitest's configured 'node' environment (see vite.config.ts). Stubbing a
// fresh in-memory implementation before every test exercises the REAL overlay
// code path (not a bypass) and guarantees isolation: each test gets a brand
// new, empty store rather than a cleared one, so nothing can leak between tests.
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

function manprecMeetingCandidates(customerId = 'manprec'): Array<Omit<NewProposedCustomerChangeInput, 'customerUpdateId'>> {
  return [
    {
      customerId,
      operation: 'create',
      entityType: 'evidence',
      rationale: 'Observado durante sesión de trabajo técnico, 2026-09-08.',
      proposedValue: {
        statement: 'Múltiples especialistas técnicos de Manprec participaron en la sesión de trabajo.',
        type: 'meeting_transcript',
        category: 'required_role_activation',
        source: 'Sesión de trabajo técnico — Manprec',
        sourceDate: '2026-09-08',
        confidence: 'medium',
        verified: false,
        impact: 'positive',
        relatedDimension: 'requiredRoleActivation',
      },
    },
    {
      customerId,
      operation: 'create',
      entityType: 'evidence',
      rationale: 'Observado durante sesión de trabajo técnico, 2026-09-08.',
      proposedValue: {
        statement:
          'El equipo trabajó en un ejercicio real de análisis técnico de mastografía, comparando requisitos técnicos de la licitación contra fichas técnicas, catálogos y manuales.',
        type: 'meeting_transcript',
        category: 'workflow_adoption',
        source: 'Sesión de trabajo técnico — Manprec',
        sourceDate: '2026-09-08',
        confidence: 'medium',
        verified: false,
        impact: 'positive',
        relatedDimension: 'workflowAdoption',
      },
    },
    {
      customerId,
      operation: 'create',
      entityType: 'evidence',
      rationale: 'Observado durante sesión de trabajo técnico, 2026-09-08.',
      proposedValue: {
        statement: 'Los archivos .doc heredados no son aceptados y requieren conversión previa.',
        type: 'product_feedback',
        category: 'product_friction',
        source: 'Sesión de trabajo técnico — Manprec',
        sourceDate: '2026-09-08',
        confidence: 'medium',
        verified: false,
        impact: 'neutral',
        relatedDimension: 'executionRisk',
      },
    },
    {
      customerId,
      operation: 'create',
      entityType: 'evidence',
      rationale: 'Observado durante sesión de trabajo técnico, 2026-09-08.',
      proposedValue: {
        statement: 'Un análisis se mantuvo estancado alrededor del 2% durante la sesión.',
        type: 'meeting_transcript',
        category: 'execution_risk',
        source: 'Sesión de trabajo técnico — Manprec',
        sourceDate: '2026-09-08',
        confidence: 'medium',
        verified: false,
        impact: 'negative',
        relatedDimension: 'executionRisk',
      },
    },
    {
      customerId,
      operation: 'create',
      entityType: 'evidence',
      rationale: 'Observado durante sesión de trabajo técnico, 2026-09-08.',
      proposedValue: {
        statement: 'Se identificaron preguntas y necesidades de ajuste sobre las salidas de Junta de Aclaraciones.',
        type: 'product_feedback',
        category: 'product_friction',
        source: 'Sesión de trabajo técnico — Manprec',
        sourceDate: '2026-09-08',
        confidence: 'medium',
        verified: false,
        impact: 'neutral',
      },
    },
  ];
}

function createManprecMeetingUpdate() {
  return createCustomerUpdate({
    customerId: 'manprec',
    source: 'call_transcript',
    sourceDate: '2026-09-08',
    submittedBy: 'meeting-intelligence-fixture',
    rawInput:
      'Fixture: sesión de trabajo técnico con Manprec el 2026-09-08. Especialistas técnicos trabajaron un ejercicio real de mastografía; los .doc heredados requirieron conversión; un análisis quedó estancado ~2%; quedaron dudas sobre ajustes de Junta de Aclaraciones.',
  });
}

describe('submitAutomatedChanges — Manprec 2026-09-08 meeting fixture', () => {
  it('stores the parent CustomerUpdate with source "call_transcript" and the meeting date', () => {
    const update = createManprecMeetingUpdate();
    expect(update.source).toBe('call_transcript');
    expect(update.sourceDate).toBe('2026-09-08');
    expect(getCustomerUpdate(update.id)?.source).toBe('call_transcript');
  });

  it('creates exactly 5 pending evidence proposals, no other entity type', () => {
    const update = createManprecMeetingUpdate();
    const changes = submitAutomatedChanges(update.id, 'manprec', manprecMeetingCandidates());

    expect(changes).toHaveLength(5);
    for (const change of changes) {
      expect(change.entityType).toBe('evidence');
      expect(change.reviewStatus).toBe('pending');
    }
    expect(getProposedChangesForCustomerUpdate(update.id)).toHaveLength(5);
  });

  it('does not touch Evidence until the changes are reviewed and published', () => {
    const baseline = getEvidenceForCustomer('manprec').length;
    const update = createManprecMeetingUpdate();
    submitAutomatedChanges(update.id, 'manprec', manprecMeetingCandidates());

    expect(getEvidenceForCustomer('manprec')).toHaveLength(baseline);
  });

  it('publishes all 5 statements verbatim once every change is accepted', () => {
    const baseline = getEvidenceForCustomer('manprec').length;
    const update = createManprecMeetingUpdate();
    const changes = submitAutomatedChanges(update.id, 'manprec', manprecMeetingCandidates());

    for (const change of changes) {
      reviewProposedCustomerChange(change.id, { reviewStatus: 'accepted', reviewedBy: 'cs-test' });
    }
    publishCustomerUpdate(update.id, 'cs-test');

    const evidence = getEvidenceForCustomer('manprec');
    expect(evidence).toHaveLength(baseline + 5);
    const statements = evidence.map((item) => item.statement);
    for (const candidate of manprecMeetingCandidates()) {
      expect(statements).toContain((candidate.proposedValue as { statement: string }).statement);
    }
  });

  it('omits a rejected item while publishing the rest', () => {
    const baseline = getEvidenceForCustomer('manprec').length;
    const update = createManprecMeetingUpdate();
    const changes = submitAutomatedChanges(update.id, 'manprec', manprecMeetingCandidates());

    const [rejected, ...accepted] = changes;
    reviewProposedCustomerChange(rejected.id, { reviewStatus: 'rejected', reviewedBy: 'cs-test' });
    for (const change of accepted) {
      reviewProposedCustomerChange(change.id, { reviewStatus: 'accepted', reviewedBy: 'cs-test' });
    }
    publishCustomerUpdate(update.id, 'cs-test');

    const evidence = getEvidenceForCustomer('manprec');
    expect(evidence).toHaveLength(baseline + 4);
    const rejectedStatement = (rejected.proposedValue as { statement: string }).statement;
    expect(evidence.map((item) => item.statement)).not.toContain(rejectedStatement);
  });

  it('creates no Risk, Commitment, Insight, HealthSnapshot, or OperatingStage change', () => {
    const healthBefore = getLatestHealthSnapshot('manprec');
    const stageBefore = getOperatingStageForCustomer('manprec');
    const metricsBefore = getProductMetricSnapshotsForCustomer('manprec');

    const update = createManprecMeetingUpdate();
    const changes = submitAutomatedChanges(update.id, 'manprec', manprecMeetingCandidates());
    for (const change of changes) {
      reviewProposedCustomerChange(change.id, { reviewStatus: 'accepted', reviewedBy: 'cs-test' });
    }
    publishCustomerUpdate(update.id, 'cs-test');

    expect(getLatestHealthSnapshot('manprec')).toEqual(healthBefore);
    expect(getOperatingStageForCustomer('manprec')).toEqual(stageBefore);
    expect(getProductMetricSnapshotsForCustomer('manprec')).toEqual(metricsBefore);
  });
});

describe('submitAutomatedChanges — governance guardrails', () => {
  it('deny-by-default: throws on an entityType outside the explicit allowlist (insight)', () => {
    const update = createManprecMeetingUpdate();
    const candidates: Array<Omit<NewProposedCustomerChangeInput, 'customerUpdateId'>> = [
      {
        customerId: 'manprec',
        operation: 'create',
        entityType: 'insight',
        proposedValue: { section: 'why_score', statement: 'Fabricated conclusion — must be rejected.' },
      },
    ];

    expect(() => submitAutomatedChanges(update.id, 'manprec', candidates)).toThrow(/not authorized/i);
    expect(getProposedChangesForCustomerUpdate(update.id)).toHaveLength(0);
  });

  it('throws when a candidate customerId does not match the call, and creates nothing', () => {
    const update = createManprecMeetingUpdate();
    const candidates = manprecMeetingCandidates();
    candidates[2] = { ...candidates[2], customerId: 'siemens' };

    expect(() => submitAutomatedChanges(update.id, 'manprec', candidates)).toThrow(/does not match/i);
    expect(getProposedChangesForCustomerUpdate(update.id)).toHaveLength(0);
  });

  it('throws when the parent CustomerUpdate belongs to a different customer', () => {
    const siemensUpdate = createCustomerUpdate({
      customerId: 'siemens',
      source: 'call_transcript',
      sourceDate: '2026-09-08',
      submittedBy: 'meeting-intelligence-fixture',
    });

    expect(() => submitAutomatedChanges(siemensUpdate.id, 'manprec', manprecMeetingCandidates())).toThrow(/belongs to customer/i);
    expect(getProposedChangesForCustomerUpdate(siemensUpdate.id)).toHaveLength(0);
  });

  it('throws for an unknown CustomerUpdate id', () => {
    expect(() => submitAutomatedChanges('does-not-exist', 'manprec', manprecMeetingCandidates())).toThrow(/not found/i);
  });
});
