'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/features/navigation/Header';
import { useAuth } from '@/features/auth/context/AuthContext';

export default function ProtectedLayout({
  children
}: {
  children: ReactNode;
}) {
  const { isAuthenticated, initialising } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initialising && !isAuthenticated) {
      router.replace('/login');
    }
  }, [initialising, isAuthenticated, router]);

  if (!isAuthenticated) {
    return <p style={{ paddingTop: '5rem', textAlign: 'center' }}>Checking authentication…</p>;
  }

  return (
    <>
      <Header />
      {children}
    </>
  );
}
