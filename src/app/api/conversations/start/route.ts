import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const listingId = body?.listing_id;
  const sellerId = body?.seller_id;

  if (!listingId || !sellerId) {
    return NextResponse.json(
      { error: 'listing_id and seller_id are required' },
      { status: 400 }
    );
  }

  if (sellerId === session.user.id) {
    return NextResponse.json(
      { error: 'You cannot message your own listing' },
      { status: 400 }
    );
  }

  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('id, status')
    .eq('id', listingId)
    .single();

  if (listingError || !listing || listing.status !== 'active') {
    return NextResponse.json({ error: 'Listing not found' }, { status: 400 });
  }

  const { data: conversation, error: conversationError } = await supabase
    .from('conversations')
    .upsert(
      {
        listing_id: listingId,
        buyer_id: session.user.id,
        seller_id: sellerId,
      },
      { onConflict: 'listing_id,buyer_id' }
    )
    .select('id')
    .single();

  if (conversationError || !conversation) {
    return NextResponse.json(
      { error: conversationError?.message ?? 'Could not start conversation' },
      { status: 500 }
    );
  }

  return NextResponse.json({ conversationId: conversation.id });
}
