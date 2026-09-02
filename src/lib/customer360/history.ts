import {
  getCustomerById,
  getEvidenceForCustomer,
  getHealthSnapshotsForCustomer,
  getMilestonesForCustomer,
  getRisksForCustomer,
  getTimelineEventsForCustomer,
} from '../../services/customerRepository';
import { formatMonoDateShort, formatMonthYearEs } from '../formatters';
import { CONFIDENCE_LABELS_ES, STATUS_LABELS_ES } from '../labels';
import type { TimelineMarkerType } from '../../types/timelineEvent';

export interface HistoryEntry {
  id: string;
  date: string; // ISO
  dateLabel: string;
  monthGroup: string; // e.g. "sep 2026" — for grouping in the Historial page
  datePrecision: 'day' | 'month';
  markerType: TimelineMarkerType;
  title: string;
  interpretation: string;
}

// Day-of-month === 1 is this seed's documented convention for "only the month is
// known" (see data/evidence.ts) — a real, dated snapshot approval is the one
// exception, since that IS a specific calendar day.
function inferDatePrecision(iso: string, exactDates: Set<string>): 'day' | 'month' {
  if (exactDates.has(iso)) return 'day';
  return new Date(`${iso}T00:00:00`).getDate() === 1 ? 'month' : 'day';
}

function dateLabelFor(iso: string, precision: 'day' | 'month'): string {
  return precision === 'month' ? formatMonthYearEs(iso) : formatMonoDateShort(iso, { withYear: false });
}

// Builds the full account history from existing structured objects (HealthSnapshots,
// Evidence, Risks, Milestones) plus any curated seed TimelineEvents. Health
// numerical history uses ONLY approved HealthSnapshots; everything else is a
// directional marker, never a fabricated score. Dates are never invented — an
// object with no date simply contributes no entry.
export function buildCustomerHistoryView(customerId: string):
  | { entries: HistoryEntry[]; hasNumericHistory: boolean }
  | undefined {
  const customer = getCustomerById(customerId);
  if (!customer) return undefined;

  const snapshots = getHealthSnapshotsForCustomer(customerId);
  const curated = getTimelineEventsForCustomer(customerId);
  const exactDates = new Set(snapshots.map((s) => s.snapshotDate));
  const curatedSnapshotDates = new Set(curated.filter((e) => e.markerType === 'snapshot_approved').map((e) => e.date));

  const entries: HistoryEntry[] = [];

  for (const event of curated) {
    const precision = inferDatePrecision(event.date, exactDates);
    entries.push({
      id: event.id,
      date: event.date,
      dateLabel: event.dateLabel ?? dateLabelFor(event.date, precision),
      monthGroup: formatMonthYearEs(event.date),
      datePrecision: precision,
      markerType: event.markerType,
      title: event.title,
      interpretation: event.interpretation,
    });
  }

  for (const snapshot of snapshots) {
    if (curatedSnapshotDates.has(snapshot.snapshotDate)) continue; // already represented by a curated event
    if (!snapshot.approved) continue;
    entries.push({
      id: `snapshot-${snapshot.id}`,
      date: snapshot.snapshotDate,
      dateLabel: dateLabelFor(snapshot.snapshotDate, 'day'),
      monthGroup: formatMonthYearEs(snapshot.snapshotDate),
      datePrecision: 'day',
      markerType: 'snapshot_approved',
      title: 'Snapshot de HealthScore aprobado',
      interpretation: `${snapshot.finalScore} · ${STATUS_LABELS_ES[snapshot.finalStatus]} · confianza ${CONFIDENCE_LABELS_ES[snapshot.confidence]}`,
    });
  }

  for (const evidence of getEvidenceForCustomer(customerId)) {
    const precision = inferDatePrecision(evidence.sourceDate, exactDates);
    const markerType: TimelineMarkerType =
      evidence.impact === 'negative'
        ? 'new_risk'
        : evidence.impact === 'neutral'
          ? 'operational_signal_or_feedback'
          : evidence.type === 'expansion_signal'
            ? 'expansion_signal'
            : 'value_or_milestone';
    entries.push({
      id: `evidence-${evidence.id}`,
      date: evidence.sourceDate,
      dateLabel: dateLabelFor(evidence.sourceDate, precision),
      monthGroup: formatMonthYearEs(evidence.sourceDate),
      datePrecision: precision,
      markerType,
      title: evidence.statement,
      interpretation: `${evidence.source} · confianza ${CONFIDENCE_LABELS_ES[evidence.confidence]}`,
    });
  }

  for (const risk of getRisksForCustomer(customerId)) {
    if (!risk.openedAt) continue; // never fabricate an opening date
    const precision = inferDatePrecision(risk.openedAt, exactDates);
    entries.push({
      id: `risk-${risk.id}`,
      date: risk.openedAt,
      dateLabel: dateLabelFor(risk.openedAt, precision),
      monthGroup: formatMonthYearEs(risk.openedAt),
      datePrecision: precision,
      markerType: 'new_risk',
      title: risk.shortTitle ?? risk.title,
      interpretation: risk.shortCause ?? risk.description,
    });
  }

  for (const milestone of getMilestonesForCustomer(customerId)) {
    if (!milestone.targetDate) continue; // never fabricate a target date
    const precision = inferDatePrecision(milestone.targetDate, exactDates);
    entries.push({
      id: `milestone-${milestone.id}`,
      date: milestone.targetDate,
      dateLabel: dateLabelFor(milestone.targetDate, precision),
      monthGroup: formatMonthYearEs(milestone.targetDate),
      datePrecision: precision,
      markerType: 'expansion_signal',
      title: milestone.title,
      interpretation: 'Próximo hito',
    });
  }

  entries.sort((a, b) => a.date.localeCompare(b.date));

  return { entries, hasNumericHistory: snapshots.length >= 2 };
}
