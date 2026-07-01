'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { SUBURBS } from '@/lib/suburbs';

type Mode = 'login' | 'signup';
type Status = 'idle' | 'loading' | 'error' | 'success';

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('login');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    display_name: '',
    suburb: '',
  });
  const [status, setStatus] = useState<Status>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setStatus('idle');
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supabase) {
      setStatus('error');
      setErrorMessage('Service not configured. Please try again later.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');
    setSuccessMessage('');

    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            display_name: formData.display_name,
            suburb: formData.suburb,
          },
        },
      });

      if (error) {
        setStatus('error');
        setErrorMessage(error.message);
        return;
      }

      setStatus('success');
      setSuccessMessage('Check your email to confirm your account');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email: formData.email,
      password: formData.password,
    });

    if (error) {
      setStatus('error');
      setErrorMessage(error.message);
      return;
    }

    setStatus('success');
    router.push('/dashboard');
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F3F8F8] px-5 py-12">
      <div className="w-full max-w-sm bg-white border border-[#C4D8D8] rounded-[20px] shadow-[0_1px_2px_rgba(44,44,42,0.04),0_18px_40px_-22px_rgba(44,44,42,0.14)] p-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#2C2C2A]">
          {mode === 'login' ? 'Log in' : 'Create your account'}
        </h1>
        <p className="mt-2 text-sm text-[#5F5E5A]">
          {mode === 'login'
            ? 'Welcome back to South Peninsula Marketplace.'
            : 'Join your local, verified marketplace.'}
        </p>

        <div className="mt-6 flex rounded-[13px] border border-[#C4D8D8] p-1 bg-[#F3F8F8]">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 py-2 text-sm font-semibold rounded-[10px] transition-colors ${
              mode === 'login'
                ? 'bg-white text-[#2C2C2A] shadow-sm'
                : 'text-[#5F5E5A]'
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => switchMode('signup')}
            className={`flex-1 py-2 text-sm font-semibold rounded-[10px] transition-colors ${
              mode === 'signup'
                ? 'bg-white text-[#2C2C2A] shadow-sm'
                : 'text-[#5F5E5A]'
            }`}
          >
            Sign up
          </button>
        </div>

        {status === 'success' && mode === 'signup' ? (
          <div className="mt-6 rounded-[13px] border border-[#C4D8D8] bg-[#DDEEED] px-4 py-4 text-sm font-medium text-[#085050]">
            {successMessage}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            {mode === 'signup' && (
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="display_name"
                  className="text-xs font-bold text-[#2C2C2A]"
                >
                  Full name
                </label>
                <input
                  type="text"
                  id="display_name"
                  name="display_name"
                  required
                  value={formData.display_name}
                  onChange={handleChange}
                  placeholder="Sarah Davies"
                  autoComplete="name"
                  className="w-full rounded-[13px] border border-[#C4D8D8] px-4 py-3 text-sm text-[#2C2C2A] focus:outline-none focus:border-[#0A7D7D] focus:ring-4 focus:ring-[#0A7D7D1a]"
                />
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-xs font-bold text-[#2C2C2A]">
                Email address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="joe@emailaddress.com"
                autoComplete="email"
                className="w-full rounded-[13px] border border-[#C4D8D8] px-4 py-3 text-sm text-[#2C2C2A] focus:outline-none focus:border-[#0A7D7D] focus:ring-4 focus:ring-[#0A7D7D1a]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="text-xs font-bold text-[#2C2C2A]"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                autoComplete={
                  mode === 'signup' ? 'new-password' : 'current-password'
                }
                className="w-full rounded-[13px] border border-[#C4D8D8] px-4 py-3 text-sm text-[#2C2C2A] focus:outline-none focus:border-[#0A7D7D] focus:ring-4 focus:ring-[#0A7D7D1a]"
              />
            </div>

            {mode === 'signup' && (
              <div className="flex flex-col gap-2">
                <label htmlFor="suburb" className="text-xs font-bold text-[#2C2C2A]">
                  Your suburb
                </label>
                <select
                  id="suburb"
                  name="suburb"
                  required
                  value={formData.suburb}
                  onChange={handleChange}
                  className="w-full rounded-[13px] border border-[#C4D8D8] px-4 py-3 text-sm text-[#2C2C2A] focus:outline-none focus:border-[#0A7D7D] focus:ring-4 focus:ring-[#0A7D7D1a]"
                >
                  <option value="" disabled>
                    Select your suburb
                  </option>
                  {SUBURBS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {status === 'error' && (
              <div className="rounded-[10px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="mt-1 w-full rounded-[13px] bg-[#2C2C2A] py-3 text-sm font-bold text-white transition-colors hover:bg-[#1a1a18] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading'
                ? 'Please wait…'
                : mode === 'login'
                ? 'Log in'
                : 'Create account'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
