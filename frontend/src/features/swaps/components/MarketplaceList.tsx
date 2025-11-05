'use client';

import { useMemo, useState } from 'react';
import { useEventContext } from '@/features/events/context/EventContext';
import type { CalendarEvent, SwappableSlot } from '@/features/events/types';
import EventStatusBadge from '@/features/events/components/EventStatusBadge';

const formatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short'
});

type SwapModalProps = {
  slot: SwappableSlot;
  mySwappableEvents: CalendarEvent[];
  onSelect: (eventId: string) => void;
  onClose: () => void;
};

function SwapModal({ slot, mySwappableEvents, onSelect, onClose }: SwapModalProps) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal" style={{ display: 'grid', gap: '1.25rem' }}>
        <header>
          <h3 style={{ margin: 0 }}>Offer a slot for {slot.title}</h3>
          <p className="muted" style={{ marginTop: '0.35rem' }}>
            Select one of your swappable events to exchange with {slot.owner.name}.
          </p>
        </header>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '0.75rem' }}>
          {mySwappableEvents.length ? (
            mySwappableEvents.map((event) => (
              <li key={event.id} className="list-item">
                <div>
                  <div>
                    <strong>{event.title}</strong>
                    <p className="muted" style={{ margin: '0.25rem 0 0' }}>
                      {formatter.format(new Date(event.startTime))} — {formatter.format(new Date(event.endTime))}
                    </p>
                  </div>
                  <EventStatusBadge status={event.status} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button className="button" type="button" onClick={() => onSelect(event.id)}>
                    Offer this slot
                  </button>
                </div>
              </li>
            ))
          ) : (
            <li className="muted">You currently have no swappable slots to offer.</li>
          )}
        </ul>
        <button className="button" style={{ background: 'rgba(148,163,184,0.25)' }} type="button" onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function MarketplaceList() {
  const { swappableSlots, events, requestSwap } = useEventContext();
  const [selectedSlot, setSelectedSlot] = useState<SwappableSlot | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const mySwappableEvents = useMemo(
    () => events.filter((event) => event.status === 'SWAPPABLE'),
    [events]
  );

  const handleRequest = async (theirSlotId: string, mySlotId: string) => {
    setSubmitting(true);
    setError(null);
    try {
      await requestSwap({ mySlotId, theirSlotId });
      setSelectedSlot(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to submit request.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!swappableSlots.length) {
    return <p className="muted">No swappable slots are currently available. Check back soon!</p>;
  }

  return (
    <div className="grid">
      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
      <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '1rem' }}>
        {swappableSlots.map((slot) => (
          <li key={slot.id} className="list-item">
            <div>
              <div>
                <strong>{slot.title}</strong>
                <p className="muted" style={{ margin: '0.25rem 0 0' }}>
                  {formatter.format(new Date(slot.startTime))} — {formatter.format(new Date(slot.endTime))}
                </p>
                <p className="muted" style={{ margin: '0.25rem 0 0' }}>
                  Hosted by {slot.owner.name}
                </p>
              </div>
              <EventStatusBadge status={slot.status} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button className="button" type="button" onClick={() => setSelectedSlot(slot)}>
                Request swap
              </button>
            </div>
          </li>
        ))}
      </ul>
      {selectedSlot && (
        <SwapModal
          slot={selectedSlot}
          mySwappableEvents={mySwappableEvents}
          onClose={() => setSelectedSlot(null)}
          onSelect={(eventId) => {
            if (!submitting) {
              void handleRequest(selectedSlot.id, eventId);
            }
          }}
        />
      )}
    </div>
  );
}
