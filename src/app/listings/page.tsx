'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SUBURBS } from '@/lib/suburbs';

// TODO: focus ring colour (#0A7D7D) used on inputs system-wide — should move to neutral to preserve teal's semantic meaning for verified badges

interface Seller {
  display_name: string;
  verification_status: string;
}

interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  condition: string;
  suburb: string;
  created_at: string;
  seller_id: string;
  profiles: Seller | null;
}

function formatPrice(price: number): string {
  const rounded = Math.round(price);
  const withSpaces = rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `R ${withSpaces}`;
}

function formatRelativeTime(dateString: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);

  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? '' : 's'} ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? '' : 's'} ago`;

  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? '' : 's'} ago`;

  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? '' : 's'} ago`;
}

export default function ListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [suburbFilter, setSuburbFilter] = useState('');

  useEffect(() => {
    if (!supabase) {
      setError(true);
      setLoading(false);
      return;
    }

    const client = supabase;

    const loadListings = async () => {
      const { data, error: fetchError } = await client
        .from('listings')
        .select(
          'id, title, description, price, category, condition, suburb, created_at, seller_id, profiles(display_name, verification_status)'
        )
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(50);

      if (fetchError) {
        setError(true);
        setLoading(false);
        return;
      }

      setListings((data as unknown as Listing[]) ?? []);
      setLoading(false);
    };

    loadListings();
  }, []);

  const filteredListings = useMemo(() => {
    if (!suburbFilter) return listings;
    return listings.filter((listing) => listing.suburb === suburbFilter);
  }, [listings, suburbFilter]);

  return (
    <div className="min-h-screen bg-[#F3F8F8]">
      <nav className="w-full border-b border-[#C4D8D8] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <span className="text-lg font-extrabold tracking-tight text-[#2C2C2A]">
            Breezee
          </span>
          <a
            href="/auth"
            className="text-sm font-semibold text-[#2C2C2A] hover:text-[#5F5E5A]"
          >
            Log in
          </a>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="flex flex-col gap-2">
          <label htmlFor="suburb-filter" className="text-xs font-bold text-[#2C2C2A]">
            Suburb
          </label>
          <select
            id="suburb-filter"
            value={suburbFilter}
            onChange={(e) => setSuburbFilter(e.target.value)}
            className="w-full max-w-xs rounded-[13px] border border-[#C4D8D8] bg-white px-4 py-3 text-sm text-[#2C2C2A] focus:outline-none focus:border-[#0A7D7D] focus:ring-4 focus:ring-[#0A7D7D1a]"
          >
            <option value="">All suburbs</option>
            {SUBURBS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-8">
          {loading ? (
            <p className="text-sm text-[#5F5E5A]">Loading…</p>
          ) : error ? (
            <p className="text-sm text-[#5F5E5A]">
              Could not load listings. Please try again.
            </p>
          ) : filteredListings.length === 0 ? (
            <p className="text-sm text-[#5F5E5A]">No listings in this area yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {filteredListings.map((listing) => (
                <a
                  key={listing.id}
                  href={`/listings/${listing.id}`}
                  className="flex flex-col rounded-[20px] border border-[#C4D8D8] bg-white p-5 transition-shadow hover:shadow-[0_1px_2px_rgba(44,44,42,0.04),0_18px_40px_-22px_rgba(44,44,42,0.14)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-base font-bold leading-tight text-[#2C2C2A]">
                      {listing.title}
                    </h3>
                    <span className="whitespace-nowrap text-sm font-extrabold text-[#2C2C2A]">
                      {formatPrice(listing.price)}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#5F5E5A]">
                    <span>{listing.suburb}</span>
                    <span className="h-1 w-1 rounded-full bg-[#C4D8D8]" />
                    <span>{listing.category}</span>
                    <span className="h-1 w-1 rounded-full bg-[#C4D8D8]" />
                    <span>{listing.condition}</span>
                  </div>

                  <div className="mt-4 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1 font-semibold text-[#2C2C2A]">
                      {listing.profiles?.display_name ?? 'Unknown seller'}
                      {listing.profiles?.verification_status === 'verified' && (
                        <span className="font-bold text-[#0A7D7D]">Verified</span>
                      )}
                    </span>
                    <span className="text-[#5F5E5A]">
                      {formatRelativeTime(listing.created_at)}
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
