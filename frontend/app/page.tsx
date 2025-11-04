import Link from 'next/link';
import Header from '../components/layout/Header';

export default function HomePage() {
  return (
    <div>
      <Header />
      <section style={{ padding: '5rem 0', display: 'grid', gap: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', maxWidth: '640px' }}>
          Trade calendar slots effortlessly with a collaborative swap marketplace.
        </h1>
        <p style={{ maxWidth: '520px', color: 'rgba(226, 232, 240, 0.75)' }}>
          SlotSwapper keeps your team agile. Mark events as swappable, browse available time slots, and negotiate swaps without
          leaving your browser.
        </p>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link className="button" href="/signup">
            Get started
          </Link>
          <Link className="button" style={{ background: 'rgba(148, 163, 184, 0.25)' }} href="/login">
            Log in
          </Link>
        </div>
      </section>
    </div>
  );
}
