'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '../context/AuthContext';
import { EventProvider } from '../context/EventContext';

type ProvidersProps = {
  children: ReactNode;
};

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      <EventProvider>{children}</EventProvider>
    </AuthProvider>
  );
}
