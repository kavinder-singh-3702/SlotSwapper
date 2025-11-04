'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthForm from '../../../components/forms/AuthForm';
import { useAuth } from '../../../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (values: { email: string; password: string }) => {
    await login(values);
    router.replace('/dashboard');
  };

  return (
    <section style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>
      <div style={{ display: 'grid', gap: '1.5rem', justifyItems: 'center' }}>
        <AuthForm mode="login" onSubmit={handleSubmit} />
        <p className="muted">
          Need an account?{' '}
          <Link style={{ color: 'var(--accent)' }} href="/signup">
            Sign up
          </Link>
        </p>
      </div>
    </section>
  );
}
