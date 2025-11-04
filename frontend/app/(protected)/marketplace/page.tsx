'use client';

import MarketplaceList from '../../../components/marketplace/MarketplaceList';
import { useEventContext } from '../../../context/EventContext';

export default function MarketplacePage() {
  const { loading, error } = useEventContext();

  return (
    <section className="grid" style={{ gap: '2rem' }}>
      <header className="grid" style={{ gap: '0.5rem' }}>
        <h1 style={{ margin: 0 }}>Marketplace</h1>
        <p className="muted" style={{ maxWidth: '560px' }}>
          Browse the slots other teammates made swappable and offer one of your own to initiate a trade.
        </p>
      </header>
      {loading && <p className="muted">Refreshing…</p>}
      {error && <p style={{ color: 'var(--danger)' }}>{error}</p>}
      <MarketplaceList />
    </section>
  );
}
