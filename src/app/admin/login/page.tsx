'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    const response = await fetch('/api/admin/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      setStatus('error');
      return;
    }

    router.push('/admin');
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F3F8F8] px-5 py-12">
      <div className="w-full max-w-sm rounded-[20px] border border-[#C4D8D8] bg-white p-8 shadow-[0_1px_2px_rgba(44,44,42,0.04),0_18px_40px_-22px_rgba(44,44,42,0.14)]">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#2C2C2A]">
          Admin login
        </h1>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="password" className="text-xs font-bold text-[#2C2C2A]">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-[13px] border border-[#C4D8D8] px-4 py-3 text-sm text-[#2C2C2A] focus:outline-none focus:border-[#0A7D7D] focus:ring-4 focus:ring-[#0A7D7D1a]"
            />
          </div>

          {status === 'error' && (
            <div className="rounded-[10px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              Incorrect password
            </div>
          )}

          <button
            type="submit"
            disabled={status === 'loading'}
            className="mt-1 w-full rounded-[13px] bg-[#2C2C2A] py-3 text-sm font-bold text-white transition-colors hover:bg-[#1a1a18] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'loading' ? 'Checking…' : 'Log in'}
          </button>
        </form>
      </div>
    </main>
  );
}
