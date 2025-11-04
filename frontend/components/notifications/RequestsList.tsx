'use client';

import { useState } from 'react';
import { useEventContext } from '../../context/EventContext';
import type { PopulatedSwapRequest } from '../../types/events';

const formatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short'
});

type RequestCardProps = {
  request: PopulatedSwapRequest;
  variant: 'incoming' | 'outgoing';
  onRespond?: (accepted: boolean) => void;
};

const statusTint: Record<PopulatedSwapRequest['status'], string> = {
  PENDING: 'tag pending',
  ACCEPTED: 'tag confirmed',
  REJECTED: 'tag busy'
};

function RequestCard({ request, variant, onRespond }: RequestCardProps) {
  return (
  <li className="list-item">
    <div style={{ display: 'grid', gap: '0.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong>
          {variant === 'incoming' ? `${request.requester.name} wants ${request.responderSlot.title}` : `Waiting on ${request.responder.name}`}
        </strong>
        <span className={statusTint[request.status]}>{request.status.toLowerCase()}</span>
      </div>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <div className="card" style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(148,163,184,0.12)' }}>
          <h4 style={{ margin: '0 0 0.25rem' }}>Their slot</h4>
          <p style={{ margin: 0 }}>
            {request.responderSlot.title}
            <br />
            <span className="muted">
              {formatter.format(new Date(request.responderSlot.startTime))} —
              {formatter.format(new Date(request.responderSlot.endTime))}
            </span>
          </p>
        </div>
        <div className="card" style={{ background: 'rgba(15, 23, 42, 0.65)', border: '1px solid rgba(148,163,184,0.12)' }}>
          <h4 style={{ margin: '0 0 0.25rem' }}>Your slot</h4>
          <p style={{ margin: 0 }}>
            {request.requesterSlot.title}
            <br />
            <span className="muted">
              {formatter.format(new Date(request.requesterSlot.startTime))} —
              {formatter.format(new Date(request.requesterSlot.endTime))}
            </span>
          </p>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
        {variant === 'incoming' && request.status === 'PENDING' && onRespond ? (
          <>
            <button className="button" style={{ background: 'var(--success)' }} type="button" onClick={() => onRespond(true)}>
              Accept
            </button>
            <button className="button" style={{ background: 'var(--danger)' }} type="button" onClick={() => onRespond(false)}>
              Reject
            </button>
          </>
        ) : (
          <span className="muted">{request.status === 'PENDING' ? 'Pending…' : `Marked ${request.status.toLowerCase()}`}</span>
        )}
      </div>
    </div>
  </li>
  );
}

export default function RequestsList() {
  const { incomingRequests, outgoingRequests, respondToRequest } = useEventContext();
  const [actionError, setActionError] = useState<string | null>(null);

  return (
    <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))' }}>
      <section className="grid">
        <h3 className="section-title">Incoming requests</h3>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '1rem' }}>
          {incomingRequests.length ? (
            incomingRequests.map((request) => (
              <RequestCard
                key={request.id}
                request={request}
                variant="incoming"
                onRespond={(accepted) => {
                  setActionError(null);
                  void respondToRequest(request.id, accepted).catch((error: unknown) => {
                    const message = error instanceof Error ? error.message : 'Failed to process the request.';
                    setActionError(message);
                  });
                }}
              />
            ))
          ) : (
            <li className="muted">No incoming requests right now.</li>
          )}
        </ul>
      </section>
      <section className="grid">
        <h3 className="section-title">Outgoing requests</h3>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: '1rem' }}>
          {outgoingRequests.length ? (
            outgoingRequests.map((request) => (
              <RequestCard key={request.id} request={request} variant="outgoing" />
            ))
          ) : (
            <li className="muted">No outgoing requests yet. Offer a slot from the marketplace!</li>
          )}
        </ul>
      </section>
      {actionError && <p style={{ color: 'var(--danger)' }}>{actionError}</p>}
    </div>
  );
}
