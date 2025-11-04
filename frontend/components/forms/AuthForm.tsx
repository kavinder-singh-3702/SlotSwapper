'use client';

import React, { useState } from 'react';

export type AuthFormValues = {
  name?: string;
  email: string;
  password: string;
};

type AuthFormProps = {
  mode: 'login' | 'signup';
  onSubmit: (values: AuthFormValues) => Promise<void>;
};

const AuthForm: React.FC<AuthFormProps> = ({ mode, onSubmit }) => {
  const [values, setValues] = useState<AuthFormValues>({ email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(values);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to process request.';
      setError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="card" style={{ display: 'grid', gap: '1.25rem', minWidth: '320px' }} onSubmit={handleSubmit}>
      <div>
        <h2 style={{ margin: 0 }}>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h2>
        <p className="muted" style={{ marginTop: '0.5rem' }}>
          {mode === 'login' ? 'Enter your credentials to access SlotSwapper.' : 'Sign up to start swapping calendar events.'}
        </p>
      </div>

      {mode === 'signup' && (
        <label className="label" htmlFor="name">
          <span style={{ display: 'block', marginBottom: '0.35rem' }}>Name</span>
          <input
            className="input"
            id="name"
            name="name"
            value={values.name ?? ''}
            onChange={handleChange}
            placeholder="Your name"
            required
          />
        </label>
      )}

      <label className="label" htmlFor="email">
        <span style={{ display: 'block', marginBottom: '0.35rem' }}>Email</span>
        <input
          className="input"
          id="email"
          name="email"
          type="email"
          value={values.email}
          onChange={handleChange}
          placeholder="you@example.com"
          required
        />
      </label>

      <label className="label" htmlFor="password">
        <span style={{ display: 'block', marginBottom: '0.35rem' }}>Password</span>
        <input
          className="input"
          id="password"
          name="password"
          type="password"
          value={values.password}
          onChange={handleChange}
          placeholder="••••••••"
          minLength={8}
          required
        />
      </label>

      {error && <p style={{ color: 'var(--danger)', margin: 0 }}>{error}</p>}

      <button className="button" type="submit" disabled={submitting}>
        {submitting ? 'Processing…' : mode === 'login' ? 'Log in' : 'Create account'}
      </button>
    </form>
  );
};

export default AuthForm;
