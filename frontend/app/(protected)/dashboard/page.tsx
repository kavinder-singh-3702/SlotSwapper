'use client';

import EventForm from '../../../components/dashboard/EventForm';
import EventList from '../../../components/dashboard/EventList';
import { useEventContext } from '../../../context/EventContext';

export default function DashboardPage() {
  const { loading, error } = useEventContext();

  return (
    <section className="grid" style={{ gap: '2rem' }}>
      <header className="grid" style={{ gap: '0.5rem' }}>
        <h1 style={{ margin: 0 }}>Your calendar</h1>
        <p className="muted" style={{ maxWidth: '560px' }}>
          Keep track of the events you own. Toggle availability to make them visible in the swap marketplace.
        </p>
      </header>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', alignItems: 'start', gap: '1.5rem' }}>
        <EventForm />
        <section className="grid" style={{ gap: '1rem' }}>
          <h2 style={{ margin: 0 }}>Upcoming events</h2>
          {loading && <p className="muted">Refreshing…</p>}
          {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
          <EventList />
        </section>
      </div>
    </section>
  );
}
