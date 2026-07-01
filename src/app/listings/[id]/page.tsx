'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

// TODO: formatPrice and formatRelativeTime are duplicated from /listings/page.tsx — extract to src/lib/format.ts

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
  status: string;
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

type ViewStatus = 'loading' | 'ready' | 'not-found' | 'error';

export default function ListingDetailPage() {
  const params = useParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [listing, setListing] = useState<Listing | null>(null);
  const [viewStatus, setViewStatus] = useState<ViewStatus>('loading');
  const [messageClicked, setMessageClicked] = useState(false);
  const [reportClicked, setReportClicked] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setViewStatus('error');
      return;
    }

    if (!id) {
      setViewStatus('not-found');
      return;
    }

    const client = supabase;

    const loadListing = async () => {
      const { data, error } = await client
        .from('listings')
        .select(
          'id, title, description, price, category, condition, suburb, created_at, status, seller_id, profiles(display_name, verification_status)'
        )
        .eq('id', id)
        .single();

      if (error) {
        setViewStatus('error');
        return;
      }

      if (!data) {
        setViewStatus('not-found');
        return;
      }

      const fetchedListing = data as unknown as Listing;

      if (fetchedListing.status !== 'active') {
        setViewStatus('not-found');
        return;
      }

      setListing(fetchedListing);
      setViewStatus('ready');
    };

    loadListing();
  }, [id]);

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

      <main className="mx-auto max-w-xl px-5 py-8 sm:px-8">
        <a
          href="/listings"
          className="text-sm font-semibold text-[#5F5E5A] hover:text-[#2C2C2A]"
        >
          ← All listings
        </a>

        <div className="mt-6">
          {viewStatus === 'loading' && (
            <p className="text-sm text-[#5F5E5A]">Loading…</p>
          )}

          {viewStatus === 'error' && (
            <p className="text-sm text-[#5F5E5A]">
              Could not load this listing. Please try again.
            </p>
          )}

          {viewStatus === 'not-found' && (
            <div>
              <p className="text-sm text-[#5F5E5A]">
                This listing is no longer available.
              </p>
              <a
                href="/listings"
                className="mt-4 inline-block text-sm font-bold text-[#2C2C2A] hover:text-[#1a1a18]"
              >
                Back to all listings
              </a>
            </div>
          )}

          {viewStatus === 'ready' && listing && (
            <div className="rounded-[20px] border border-[#C4D8D8] bg-white p-6 shadow-[0_1px_2px_rgba(44,44,42,0.04),0_18px_40px_-22px_rgba(44,44,42,0.14)] sm:p-8">
              <div className="flex items-start justify-between gap-4">
                <h1 className="text-2xl font-extrabold tracking-tight text-[#2C2C2A]">
                  {listing.title}
                </h1>
                <span className="whitespace-nowrap text-xl font-extrabold text-[#2C2C2A]">
                  {formatPrice(listing.price)}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full border border-[#C4D8D8] px-3 py-1 text-xs font-semibold text-[#5F5E5A]">
                  {listing.suburb}
                </span>
                <span className="rounded-full border border-[#C4D8D8] px-3 py-1 text-xs font-semibold text-[#5F5E5A]">
                  {listing.category}
                </span>
                <span className="rounded-full border border-[#C4D8D8] px-3 py-1 text-xs font-semibold text-[#5F5E5A]">
                  {listing.condition}
                </span>
              </div>

              {listing.description && (
                <p className="mt-5 text-sm leading-relaxed text-[#2C2C2A]">
                  {listing.description}
                </p>
              )}

              <div className="mt-6 flex items-center justify-between border-t border-[#C4D8D8] pt-5 text-sm">
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

              <button
                type="button"
                onClick={() => setMessageClicked(true)}
                className="mt-6 w-full rounded-[13px] bg-[#2C2C2A] py-3 text-sm font-bold text-white transition-colors hover:bg-[#1a1a18]"
              >
                Message seller
              </button>

              {messageClicked && (
                <p className="mt-3 text-sm text-[#5F5E5A]">
                  Messaging is coming soon.
                </p>
              )}

              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => setReportClicked(true)}
                  className="text-xs font-semibold text-[#5F5E5A] hover:text-[#2C2C2A]"
                >
                  Report listing
                </button>

                {reportClicked && (
                  <p className="mt-2 text-xs text-[#5F5E5A]">
                    Reporting is coming soon.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
