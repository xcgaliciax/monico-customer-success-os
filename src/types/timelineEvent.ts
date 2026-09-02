// "Qué cambió" timeline — spec §09. Only approved-snapshot events produce a
// numeric history entry; everything else is a directional marker, never a graph.
export type TimelineMarkerType =
  | 'snapshot_approved' // blue
  | 'value_or_milestone' // green
  | 'expansion_signal' // purple
  | 'new_risk' // orange
  | 'operational_signal_or_feedback'; // grey-4

export interface TimelineEvent {
  id: string;
  customerId: string;
  date: string; // ISO date
  // Short/relative display override (e.g. "fin ago", "actual"). When omitted, the
  // date is formatted short from `date` (e.g. "1 sep").
  dateLabel?: string;
  markerType: TimelineMarkerType;
  title: string;
  interpretation: string;
}
