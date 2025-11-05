'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthForm from '@/features/auth/components/AuthForm';
import { useAuth } from '@/features/auth/context/AuthContext';

export default function SignupPage() {
  const { register } = useAuth();
  const router = useRouter();

  const handleSubmit = async (values: { name?: string; email: string; password: string }) => {
    await register({
      name: values.name ?? '',
      email: values.email,
      password: values.password
    });
    router.replace('/dashboard');
  };

  return (
    <section style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <div style={{ display: 'grid', gap: '1.5rem', justifyItems: 'center' }}>
        <AuthForm mode="signup" onSubmit={handleSubmit} />
        <p className="muted">
          Already have an account?{' '}
          <Link style={{ color: 'var(--accent)' }} href="/login">
            Log in
          </Link>
        </p>
      </div>
    </section>
  );
}
