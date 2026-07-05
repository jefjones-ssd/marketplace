'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const EXT_FROM_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

type CheckStatus = 'checking' | 'error' | 'pending' | 'ready';
type SubmitStatus = 'idle' | 'submitting' | 'error' | 'success';

export default function VerifyPage() {
  const router = useRouter();
  const [checkStatus, setCheckStatus] = useState<CheckStatus>('checking');
  const [idFile, setIdFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [submitStatus, setSubmitStatus] = useState<SubmitStatus>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const client = supabase;
    if (!client) {
      setCheckStatus('error');
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

      const { data: profile, error: profileError } = await client
        .from('profiles')
        .select('verification_status')
        .eq('id', session.user.id)
        .single();

      if (profileError || !profile) {
        setCheckStatus('error');
        return;
      }

      if (profile.verification_status === 'verified') {
        router.push('/dashboard');
        return;
      }

      if (profile.verification_status === 'pending') {
        setCheckStatus('pending');
        return;
      }

      setCheckStatus('ready');
    };

    checkAccess();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const client = supabase;
    if (!client) {
      setSubmitStatus('error');
      setErrorMessage('Service not configured. Please try again later.');
      return;
    }

    if (!idFile || !selfieFile) {
      setSubmitStatus('error');
      setErrorMessage('Please attach both your SA ID photo and a selfie.');
      return;
    }

    if (idFile.size > MAX_FILE_SIZE || selfieFile.size > MAX_FILE_SIZE) {
      setSubmitStatus('error');
      setErrorMessage('Each file must be under 10MB.');
      return;
    }

    if (!EXT_FROM_MIME[idFile.type] || !EXT_FROM_MIME[selfieFile.type]) {
      setSubmitStatus('error');
      setErrorMessage('Please upload JPEG, PNG, or WEBP images only.');
      return;
    }

    setSubmitStatus('submitting');
    setErrorMessage('');

    const formData = new FormData();
    formData.append('idFile', idFile);
    formData.append('selfieFile', selfieFile);

    const uploadResponse = await fetch('/api/verify/upload', {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      const { error: uploadError } = await uploadResponse.json();
      setSubmitStatus('error');
      setErrorMessage(uploadError ?? 'Could not upload your documents. Please try again.');
      return;
    }

    const response = await fetch('/api/verify/submit', { method: 'POST' });

    if (!response.ok) {
      const { error: submitError } = await response.json();
      setSubmitStatus('error');
      setErrorMessage(submitError ?? 'Could not update your profile. Please try again.');
      return;
    }

    setSubmitStatus('success');
  };

  if (checkStatus === 'checking') {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#F3F8F8] px-5 py-12">
        <p className="text-sm text-[#5F5E5A]">Loading…</p>
      </main>
    );
  }

  if (checkStatus === 'error') {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#F3F8F8] px-5 py-12">
        <p className="text-sm text-[#5F5E5A]">
          Service not configured. Please try again later.
        </p>
      </main>
    );
  }

  if (checkStatus === 'pending') {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-[#F3F8F8] px-5 py-12">
        <div className="w-full max-w-sm rounded-[20px] border border-[#C4D8D8] bg-white p-8 text-center">
          <p className="text-sm font-medium text-[#2C2C2A]">
            Your verification is under review. We&rsquo;ll notify you by email
            when it&rsquo;s approved.
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
          Get verified
        </h1>
        <p className="mt-2 text-sm text-[#5F5E5A]">
          Upload a photo of your SA ID and a selfie. We review manually and
          notify you by email.
        </p>

        {submitStatus === 'success' ? (
          <div className="mt-6 rounded-[13px] border border-[#C4D8D8] bg-[#F3F8F8] px-4 py-4 text-sm font-medium text-[#2C2C2A]">
            Thank you — your documents have been submitted for review.
            We&rsquo;ll be in touch by email.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="id-photo" className="text-xs font-bold text-[#2C2C2A]">
                SA ID photo
              </label>
              <input
                type="file"
                id="id-photo"
                name="id-photo"
                required
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setIdFile(e.target.files?.[0] ?? null)}
                className="w-full rounded-[13px] border border-[#C4D8D8] px-4 py-3 text-sm text-[#2C2C2A] file:mr-3 file:rounded-[10px] file:border-0 file:bg-[#F3F8F8] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[#2C2C2A] focus:outline-none focus:border-[#0A7D7D] focus:ring-4 focus:ring-[#0A7D7D1a]"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="selfie-photo" className="text-xs font-bold text-[#2C2C2A]">
                Selfie photo
              </label>
              <input
                type="file"
                id="selfie-photo"
                name="selfie-photo"
                required
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setSelfieFile(e.target.files?.[0] ?? null)}
                className="w-full rounded-[13px] border border-[#C4D8D8] px-4 py-3 text-sm text-[#2C2C2A] file:mr-3 file:rounded-[10px] file:border-0 file:bg-[#F3F8F8] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-[#2C2C2A] focus:outline-none focus:border-[#0A7D7D] focus:ring-4 focus:ring-[#0A7D7D1a]"
              />
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
              {submitStatus === 'submitting' ? 'Submitting…' : 'Submit for review'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
