'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface ConversationRow {
  id: string;
  created_at: string;
  buyer_id: string;
  seller_id: string;
  listings: { title: string } | null;
  buyer: { display_name: string } | null;
  seller: { display_name: string } | null;
}

interface ConversationItem {
  id: string;
  listingTitle: string;
  otherPartyName: string;
  createdAt: string;
}

type ViewStatus = 'loading' | 'ready' | 'error';

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

export default function MessagesPage() {
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [viewStatus, setViewStatus] = useState<ViewStatus>('loading');

  useEffect(() => {
    if (!supabase) {
      setViewStatus('error');
      return;
    }

    const client = supabase;

    const loadConversations = async () => {
      const {
        data: { session },
      } = await client.auth.getSession();

      if (!session) {
        setViewStatus('error');
        return;
      }

      const userId = session.user.id;

      const { data, error } = await client
        .from('conversations')
        .select(
          `id, created_at, buyer_id, seller_id,
           listings ( title ),
           buyer:profiles!conversations_buyer_id_fkey ( display_name ),
           seller:profiles!conversations_seller_id_fkey ( display_name )`
        )
        .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) {
        setViewStatus('error');
        return;
      }

      const rows = (data ?? []) as unknown as ConversationRow[];

      const items: ConversationItem[] = rows.map((row) => {
        const isBuyer = row.buyer_id === userId;
        const otherParty = isBuyer ? row.seller : row.buyer;

        return {
          id: row.id,
          listingTitle: row.listings?.title ?? 'Untitled listing',
          otherPartyName: otherParty?.display_name ?? 'Unknown user',
          createdAt: row.created_at,
        };
      });

      setConversations(items);
      setViewStatus('ready');
    };

    loadConversations();
  }, []);

  return (
    <main className="px-5 py-8 sm:px-8">
      <h1 className="text-xl font-extrabold tracking-tight text-[#2C2C2A]">
        Messages
      </h1>

      <div className="mt-6">
        {viewStatus === 'loading' && (
          <p className="text-sm text-[#5F5E5A]">Loading…</p>
        )}

        {viewStatus === 'error' && (
          <p className="text-sm text-[#5F5E5A]">
            Could not load your conversations. Please try again.
          </p>
        )}

        {viewStatus === 'ready' && conversations.length === 0 && (
          <div className="rounded-[20px] border border-dashed border-[#C4D8D8] bg-white px-6 py-10 text-center text-sm text-[#5F5E5A]">
            No conversations yet.
          </div>
        )}

        {viewStatus === 'ready' && conversations.length > 0 && (
          <div className="flex flex-col gap-3">
            {conversations.map((conversation) => (
              <a
                key={conversation.id}
                href={`/dashboard/messages/${conversation.id}`}
                className="block rounded-[20px] border border-[#C4D8D8] bg-white p-5 transition-colors hover:bg-[#F3F8F8]"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold text-[#2C2C2A]">
                    {conversation.listingTitle}
                  </span>
                  <span className="whitespace-nowrap text-xs text-[#5F5E5A]">
                    {formatRelativeTime(conversation.createdAt)}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#5F5E5A]">
                  {conversation.otherPartyName}
                </p>
              </a>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
