import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';
import Providers from '../providers';

export const metadata: Metadata = {
  title: 'SlotSwapper',
  description: 'Coordinate, mark, and trade calendar slots with your team.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem 3rem' }}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
