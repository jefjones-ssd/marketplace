'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Profile {
  display_name: string;
  suburb: string;
  verification_status: string;
}

const BADGE_STYLES: Record<string, string> = {
  unverified: 'bg-[#E5E5E3] text-[#5F5E5A]',
  pending: 'bg-[#E5E5E3] text-[#5F5E5A]',
  verified: 'bg-[#0A7D7D] text-white',
  rejected: 'bg-rose-600 text-white',
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileNotFound, setProfileNotFound] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const loadProfile = async () => {
      const client = supabase;
      if (!client) return;

      const {
        data: { session },
      } = await client.auth.getSession();

      if (!session) {
        setLoading(false);
        return;
      }

      const { data, error } = await client
        .from('profiles')
        .select('display_name, suburb, verification_status')
        .eq('id', session.user.id)
        .single();

      if (error || !data) {
        setProfileNotFound(true);
        setLoading(false);
        return;
      }

      setProfile(data);
      setLoading(false);
    };

    loadProfile();
  }, []);

  if (!supabase) {
    return (
      <main className="px-5 py-10 sm:px-8">
        <p className="text-sm text-[#5F5E5A]">
          Service not configured. Please try again later.
        </p>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="px-5 py-10 sm:px-8">
        <p className="text-sm text-[#5F5E5A]">Loading…</p>
      </main>
    );
  }

  if (profileNotFound) {
    return (
      <main className="px-5 py-10 sm:px-8">
        <p className="text-sm text-[#5F5E5A]">
          Profile not found. Please contact support.
        </p>
      </main>
    );
  }

  return (
    <main className="px-5 py-8 sm:px-8">
      {profile && (
        <div className="rounded-[20px] border border-[#C4D8D8] bg-white p-6">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-extrabold tracking-tight text-[#2C2C2A]">
              {profile.display_name}
            </h1>
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold capitalize ${
                BADGE_STYLES[profile.verification_status] ??
                BADGE_STYLES.unverified
              }`}
            >
              {profile.verification_status}
            </span>
          </div>
          <p className="mt-1 text-sm text-[#5F5E5A]">{profile.suburb}</p>

          {profile.verification_status === 'unverified' && (
            <a
              href="/dashboard/verify"
              className="mt-5 block rounded-[13px] border border-[#C4D8D8] bg-[#F3F8F8] px-4 py-4 text-sm font-medium text-[#2C2C2A] hover:bg-[#DDEEED]"
            >
              Get verified to start listing — upload your SA ID and selfie
            </a>
          )}
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-extrabold tracking-tight text-[#2C2C2A]">
          My Listings
        </h2>
        <a
          href="/dashboard/listings/new"
          className="rounded-[13px] bg-[#2C2C2A] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#1a1a18]"
        >
          Create a listing
        </a>
      </div>

      <div className="mt-4 rounded-[20px] border border-dashed border-[#C4D8D8] bg-white px-6 py-10 text-center text-sm text-[#5F5E5A]">
        You have no active listings yet
      </div>
    </main>
  );
}
