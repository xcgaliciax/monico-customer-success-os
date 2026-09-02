import { Link } from 'react-router-dom';
import { formatMonoDateShort } from '../../lib/formatters';
import type { TimelineDisplayItem, TimelineMarkerType } from '../../types/timelineEvent';

const MARKER_COLOR_CLASS: Record<TimelineMarkerType, string> = {
  snapshot_approved: 'bg-monico-blue',
  value_or_milestone: 'bg-health-green',
  expansion_signal: 'bg-[#7c3aed]',
  new_risk: 'bg-c-orange',
  operational_signal_or_feedback: 'bg-grey-4',
};

// Spec §09: 4-column grid (date · marker · event · chevron), hairline above, no
// vertical connecting line, no card per event.
export function TimelineEvent({ event, href }: { event: TimelineDisplayItem; href?: string }) {
  const content = (
    <div className="grid grid-cols-[68px_13px_1fr_14px] items-start gap-3 border-t border-grey-2 py-[15px]">
      <span className="font-mono text-[11px] text-grey-5">{event.dateLabel ?? formatMonoDateShort(event.date, { withYear: false })}</span>
      <span className="mt-1.5 flex justify-center">
        <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${MARKER_COLOR_CLASS[event.markerType]}`} />
      </span>
      <span>
        <span className="block text-[15px] leading-[1.35] text-ink">{event.title}</span>
        <span className="mt-0.5 block text-[13px] text-grey-5">{event.interpretation}</span>
      </span>
      <span aria-hidden="true" />
    </div>
  );

  return href ? (
    <Link to={href} className="block hover:bg-grey-1">
      {content}
    </Link>
  ) : (
    content
  );
}
