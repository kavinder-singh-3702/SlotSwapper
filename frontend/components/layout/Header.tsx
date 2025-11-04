'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';

const navLinks = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/marketplace', label: 'Marketplace' },
  { href: '/notifications', label: 'Notifications' }
];

export default function Header() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <header style={{ paddingTop: '2rem' }}>
      <nav>
        <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>SlotSwapper</div>
        {user ? (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div className="nav-links">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '999px',
                    background: pathname === link.href ? 'rgba(56, 189, 248, 0.18)' : 'transparent',
                    color: 'inherit'
                  }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <span className="muted">{user.name}</span>
            <button className="button" type="button" onClick={logout}>
              Log out
            </button>
          </div>
        ) : (
          <div className="nav-links">
            <Link href="/login">Log in</Link>
            <Link href="/signup">Sign up</Link>
          </div>
        )}
      </nav>
    </header>
  );
}
