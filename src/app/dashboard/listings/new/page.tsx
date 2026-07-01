'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { SUBURBS } from '@/lib/suburbs';

const CATEGORIES = [
  'Electronics',
  'Furniture',
  'Clothing',
  'Vehicles',
  'Garden',
  'Sports',
  'Books',
  'Other',
] as const;

const CONDITIONS = ['New', 'Like New', 'Good', 'Fair', 'Poor'] as const;

type CheckStatus = 'checking' | 'unverified' | 'ready';
type SubmitStatus = 'idle' | 'submitting' | 'error';

export default function NewListingPage() {
  const router = useRouter();
  const [checkStatus, setCheckStatus] = useState<CheckStatus>('checking');
  const [userId, setUserId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    category: '',
    condition: '',
    suburb: '',
  });
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const client = supabase;
    if (!client) {
      setCheckStatus('unverified');
      return;
    }

    const checkAccess = async () => {
      const {
        data: { session },
      } = await client.auth.getSession();

      if (!session) {
        router.push('/auth');
        return;
      }

      const { data: profile } = await client
        .from('profiles')
        .select('verification_status')
        .eq('id', session.user.id)
        .single();

      setUserId(session.user.id);

      if (profile?.verification_status !== 'verified') {
        setCheckStatus('unverified');
        return;
      }

      setCheckStatus('ready');
    };

    checkAccess();
  }, [router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const client = supabase;
    if (!client || !userId) {
      setSubmitStatus('error');
      setErrorMessage('Service not configured. Please try again later.');
      return;
    }

    setSubmitStatus('submitting');
    setErrorMessage('');

    const { error } = await client.from('listings').insert([
      {
        seller_id: userId,
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        price: parseFloat(formData.price),
        category: formData.category,
        condition: formData.condition,
        suburb: formData.suburb,
        status: 'active',
      },
    ]);

    if (error) {
      setSubmitStatus('error');
      setErrorMessage(error.message);
      return;
    }

    router.push('/dashboard');
  };

  if (checkStatus === 'checking') {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#F3F8F8] px-5 py-12">
        <p className="text-sm text-[#5F5E5A]">Loading…</p>
      </main>
    );
  }

  if (checkStatus === 'unverified') {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#F3F8F8] px-5 py-12">
        <div className="w-full max-w-sm rounded-[20px] border border-[#C4D8D8] bg-white p-8 text-center">
          <p className="text-sm font-medium text-[#2C2C2A]">
            You need to be verified before you can list items.
          </p>
          <a
            href="/dashboard"
            className="mt-5 inline-block text-sm font-bold text-[#2C2C2A] hover:text-[#1a1a18]"
          >
            Back to dashboard
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-[60vh] items-center justify-center bg-[#F3F8F8] px-5 py-12">
      <div className="w-full max-w-sm rounded-[20px] border border-[#C4D8D8] bg-white p-8 shadow-[0_1px_2px_rgba(44,44,42,0.04),0_18px_40px_-22px_rgba(44,44,42,0.14)]">
        <h1 className="text-2xl font-extrabold tracking-tight text-[#2C2C2A]">
          Create a listing
        </h1>
        <p className="mt-2 text-sm text-[#5F5E5A]">
          Tell your neighbours what you&rsquo;re selling.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="title" className="text-xs font-bold text-[#2C2C2A]">
              Title
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              maxLength={100}
              value={formData.title}
              onChange={handleChange}
              placeholder="Classic 9'2&quot; single-fin longboard"
              className="w-full rounded-[13px] border border-[#C4D8D8] px-4 py-3 text-sm text-[#2C2C2A] focus:outline-none focus:border-[#0A7D7D] focus:ring-4 focus:ring-[#0A7D7D1a]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="description"
              className="text-xs font-bold text-[#2C2C2A]"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              maxLength={1000}
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Hardly used, excellent condition…"
              className="w-full resize-none rounded-[13px] border border-[#C4D8D8] px-4 py-3 text-sm text-[#2C2C2A] focus:outline-none focus:border-[#0A7D7D] focus:ring-4 focus:ring-[#0A7D7D1a]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="price" className="text-xs font-bold text-[#2C2C2A]">
              Price (ZAR)
            </label>
            <input
              type="number"
              id="price"
              name="price"
              required
              min={0}
              step={0.01}
              value={formData.price}
              onChange={handleChange}
              placeholder="450"
              className="w-full rounded-[13px] border border-[#C4D8D8] px-4 py-3 text-sm text-[#2C2C2A] focus:outline-none focus:border-[#0A7D7D] focus:ring-4 focus:ring-[#0A7D7D1a]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="category" className="text-xs font-bold text-[#2C2C2A]">
              Category
            </label>
            <select
              id="category"
              name="category"
              required
              value={formData.category}
              onChange={handleChange}
              className="w-full rounded-[13px] border border-[#C4D8D8] px-4 py-3 text-sm text-[#2C2C2A] focus:outline-none focus:border-[#0A7D7D] focus:ring-4 focus:ring-[#0A7D7D1a]"
            >
              <option value="" disabled>
                Select a category
              </option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="condition"
              className="text-xs font-bold text-[#2C2C2A]"
            >
              Condition
            </label>
            <select
              id="condition"
              name="condition"
              required
              value={formData.condition}
              onChange={handleChange}
              className="w-full rounded-[13px] border border-[#C4D8D8] px-4 py-3 text-sm text-[#2C2C2A] focus:outline-none focus:border-[#0A7D7D] focus:ring-4 focus:ring-[#0A7D7D1a]"
            >
              <option value="" disabled>
                Select a condition
              </option>
              {CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="suburb" className="text-xs font-bold text-[#2C2C2A]">
              Suburb
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

          {submitStatus === 'error' && (
            <div className="rounded-[10px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={submitStatus === 'submitting'}
            className="mt-1 w-full rounded-[13px] bg-[#2C2C2A] py-3 text-sm font-bold text-white transition-colors hover:bg-[#1a1a18] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitStatus === 'submitting' ? 'Publishing…' : 'Publish listing'}
          </button>
        </form>
      </div>
    </main>
  );
}
