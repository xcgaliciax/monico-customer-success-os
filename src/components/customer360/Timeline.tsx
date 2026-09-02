import { TimelineEvent } from './TimelineEvent';
import type { TimelineEvent as TimelineEventModel } from '../../types/timelineEvent';

export function Timeline({ events, hrefFor }: { events: TimelineEventModel[]; hrefFor?: (event: TimelineEventModel) => string }) {
  return (
    <div>
      {events.map((event) => (
        <TimelineEvent key={event.id} event={event} href={hrefFor?.(event)} />
      ))}
    </div>
  );
}
