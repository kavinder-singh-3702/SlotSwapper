'use client';

import type { ReactNode } from 'react';
import { AuthProvider } from '@/features/auth/context/AuthContext';
import { EventProvider } from '@/features/events/context/EventContext';

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
