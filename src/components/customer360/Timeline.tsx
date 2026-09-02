import { TimelineEvent } from './TimelineEvent';
import type { TimelineDisplayItem } from '../../types/timelineEvent';

export function Timeline({ events, hrefFor }: { events: TimelineDisplayItem[]; hrefFor?: (event: TimelineDisplayItem) => string }) {
  return (
    <div>
      {events.map((event) => (
        <TimelineEvent key={event.id} event={event} href={hrefFor?.(event)} />
      ))}
    </div>
  );
}
