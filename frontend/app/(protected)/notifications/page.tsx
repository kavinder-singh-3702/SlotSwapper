'use client';

import RequestsList from '../../../components/notifications/RequestsList';
import { useEventContext } from '../../../context/EventContext';

export default function NotificationsPage() {
  const { loading, error } = useEventContext();

  return (
    <section className="grid" style={{ gap: '2rem' }}>
      <header className="grid" style={{ gap: '0.5rem' }}>
        <h1 style={{ margin: 0 }}>Requests</h1>
        <p className="muted" style={{ maxWidth: '560px' }}>
          Track swap offers you&apos;ve received and monitor the ones you initiated.
        </p>
      </header>
      {loading && <p className="muted">Refreshing…</p>}
      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
      <RequestsList />
    </section>
  );
}
