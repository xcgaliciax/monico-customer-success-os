import type { TimelineEvent } from '../types/timelineEvent';

// "Qué cambió" seed — spec §09 explicitly seeds this exact three-event seed for the
// canonical Resumen D.1 screen. Only the approved-snapshot event produces a numeric
// history entry; the other two are directional markers, not measurements.
export const timelineEvents: TimelineEvent[] = [
  {
    id: 'tl-siemens-snapshot-approved',
    customerId: 'siemens',
    date: '2026-09-01',
    dateLabel: '1 sep',
    markerType: 'snapshot_approved',
    title: 'Snapshot de HealthScore aprobado',
    interpretation: '95 · Verde · confianza alta',
  },
  {
    id: 'tl-siemens-exec-summary-adjustment',
    customerId: 'siemens',
    date: '2026-08-28',
    dateLabel: 'fin ago',
    markerType: 'operational_signal_or_feedback',
    title: 'Ajuste al Resumen Ejecutivo solicitado',
    interpretation: 'Señal de adopción operativa',
  },
  {
    id: 'tl-siemens-regional-rollout-progress',
    customerId: 'siemens',
    date: '2026-09-01',
    dateLabel: 'actual',
    markerType: 'expansion_signal',
    title: 'Despliegue regional avanzando',
    interpretation: 'Señal de expansión',
  },
];
