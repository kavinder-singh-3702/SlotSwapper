'use client';

import { useMemo } from 'react';
import { useEventContext } from '../../context/EventContext';
import type { CalendarEvent, EventStatus } from '../../types/events';
import EventStatusBadge from './EventStatusBadge';

const formatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short'
});

const nextStatusCopy: Partial<Record<EventStatus, { label: string; status: EventStatus }>> = {
  BUSY: { label: 'Make swappable', status: 'SWAPPABLE' },
  SWAPPABLE: { label: 'Mark busy', status: 'BUSY' }
};

type EventRowProps = {
  event: CalendarEvent;
  onStatusChange: (id: string, status: EventStatus) => void;
};

function EventRow({ event, onStatusChange }: EventRowProps) {
  const action = nextStatusCopy[event.status];
  return (
    <li className="list-item">
      <div>
        <div>
          <strong>{event.title}</strong>
          <p className="muted" style={{ margin: '0.25rem 0 0' }}>
            {formatter.format(new Date(event.startTime))} — {formatter.format(new Date(event.endTime))}
          </p>
        </div>
        <EventStatusBadge status={event.status} />
      </div>
      {action && (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="button" type="button" onClick={() => onStatusChange(event.id, action.status)}>
            {action.label}
          </button>
        </div>
      )}
      {event.status === 'SWAP_PENDING' && (
        <p className="muted" style={{ fontSize: '0.85rem', margin: 0 }}>
          A swap is in progress for this event. You will be notified once it is resolved.
        </p>
      )}
    </li>
  );
}

export default function EventList() {
  const { events, updateEventStatus } = useEventContext();
  const sortedEvents = useMemo(
    () => [...events].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    [events]
  );

  if (!sortedEvents.length) {
    return <p className="muted">No events yet. Use the form to add your first commitment.</p>;
  }

  return (
    <ul className="grid" style={{ margin: 0, padding: 0, listStyle: 'none' }}>
      {sortedEvents.map((event) => (
        <EventRow key={event.id} event={event} onStatusChange={updateEventStatus} />
      ))}
    </ul>
  );
}
