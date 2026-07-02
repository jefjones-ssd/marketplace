'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

interface ConversationRow {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  listings: { title: string } | null;
  buyer: { display_name: string } | null;
  seller: { display_name: string } | null;
}

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
}

type ViewStatus = 'loading' | 'ready' | 'not-found' | 'error';
type SendStatus = 'idle' | 'sending';

export default function ConversationThreadPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = Array.isArray(params.conversationId)
    ? params.conversationId[0]
    : params.conversationId;

  const [viewStatus, setViewStatus] = useState<ViewStatus>('loading');
  const [listingTitle, setListingTitle] = useState('');
  const [otherPartyName, setOtherPartyName] = useState('');
  const [otherPartyId, setOtherPartyId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState('');
  const [sendStatus, setSendStatus] = useState<SendStatus>('idle');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!supabase) {
      setViewStatus('error');
      return;
    }

    if (!conversationId) {
      setViewStatus('not-found');
      return;
    }

    const client = supabase;

    const loadThread = async () => {
      const {
        data: { session },
      } = await client.auth.getSession();

      if (!session) {
        router.push('/auth');
        return;
      }

      const currentUserId = session.user.id;

      const { data: conversation, error: conversationError } = await client
        .from('conversations')
        .select(
          `id, listing_id, buyer_id, seller_id,
           listings ( title ),
           buyer:profiles!conversations_buyer_id_fkey ( display_name ),
           seller:profiles!conversations_seller_id_fkey ( display_name )`
        )
        .eq('id', conversationId)
        .single();

      if (conversationError || !conversation) {
        setViewStatus('not-found');
        return;
      }

      const thread = conversation as unknown as ConversationRow;
      const isBuyer = thread.buyer_id === currentUserId;
      const isSeller = thread.seller_id === currentUserId;

      if (!isBuyer && !isSeller) {
        setViewStatus('not-found');
        return;
      }

      const { data: messageRows, error: messagesError } = await client
        .from('messages')
        .select('id, sender_id, recipient_id, body, created_at')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (messagesError) {
        setViewStatus('error');
        return;
      }

      setUserId(currentUserId);
      setListingTitle(thread.listings?.title ?? 'Untitled listing');
      setOtherPartyName(
        (isBuyer ? thread.seller?.display_name : thread.buyer?.display_name) ??
          'Unknown user'
      );
      setOtherPartyId(isBuyer ? thread.seller_id : thread.buyer_id);
      setMessages((messageRows ?? []) as Message[]);
      setViewStatus('ready');
    };

    loadThread();
  }, [conversationId, router]);

  useEffect(() => {
    if (!supabase || !conversationId || viewStatus !== 'ready') return;

    const client = supabase;

    const channel = client
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [conversationId, viewStatus]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supabase || !userId || !otherPartyId || !conversationId) return;

    const body = draft.trim();
    if (!body) return;

    setSendStatus('sending');

    const { error } = await supabase.from('messages').insert([
      {
        conversation_id: conversationId,
        sender_id: userId,
        recipient_id: otherPartyId,
        body,
      },
    ]);

    if (!error) {
      setDraft('');
    }

    setSendStatus('idle');
  };

  if (viewStatus === 'loading') {
    return (
      <main className="px-5 py-8 sm:px-8">
        <p className="text-sm text-[#5F5E5A]">Loading…</p>
      </main>
    );
  }

  if (viewStatus === 'error') {
    return (
      <main className="px-5 py-8 sm:px-8">
        <p className="text-sm text-[#5F5E5A]">
          Could not load this conversation. Please try again.
        </p>
      </main>
    );
  }

  if (viewStatus === 'not-found') {
    return (
      <main className="px-5 py-8 sm:px-8">
        <p className="text-sm text-[#5F5E5A]">Conversation not found.</p>
        <a
          href="/dashboard/messages"
          className="mt-4 inline-block text-sm font-bold text-[#2C2C2A] hover:text-[#1a1a18]"
        >
          ← Back to messages
        </a>
      </main>
    );
  }

  return (
    <main className="flex h-[calc(100vh-64px)] flex-col px-5 sm:px-8">
      <div className="border-b border-[#C4D8D8] py-5">
        <a
          href="/dashboard/messages"
          className="text-sm font-semibold text-[#5F5E5A] hover:text-[#2C2C2A]"
        >
          ← Messages
        </a>
        <h1 className="mt-2 text-xl font-extrabold tracking-tight text-[#2C2C2A]">
          {listingTitle}
        </h1>
        <p className="text-sm text-[#5F5E5A]">{otherPartyName}</p>
      </div>

      <div className="flex-1 overflow-y-auto py-5">
        <div className="flex flex-col gap-3">
          {messages.map((message) => {
            const isOwn = message.sender_id === userId;

            return (
              <div
                key={message.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-[13px] px-4 py-2.5 text-sm ${
                    isOwn
                      ? 'bg-[#2C2C2A] text-white'
                      : 'border border-[#C4D8D8] bg-white text-[#2C2C2A]'
                  }`}
                >
                  {message.body}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <form
        onSubmit={handleSend}
        className="flex items-center gap-3 border-t border-[#C4D8D8] py-4"
      >
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message…"
          className="flex-1 rounded-[13px] border border-[#C4D8D8] px-4 py-3 text-sm text-[#2C2C2A] focus:outline-none focus:border-[#0A7D7D] focus:ring-4 focus:ring-[#0A7D7D1a]"
        />
        <button
          type="submit"
          disabled={sendStatus === 'sending' || !draft.trim()}
          className="rounded-[13px] bg-[#2C2C2A] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[#1a1a18] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </main>
  );
}
