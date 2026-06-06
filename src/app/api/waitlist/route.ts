import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { SUBURBS } from '@/lib/suburbs';

interface WaitlistEntry {
  name: string;
  email: string;
  suburb: string;
  created_at: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, suburb } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Name must be at least 2 characters.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (!suburb || !(SUBURBS as readonly string[]).includes(suburb)) {
      return NextResponse.json(
        { error: 'Please select a valid South Peninsula suburb.' },
        { status: 400 }
      );
    }

    const sanitizedEntry: WaitlistEntry = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      suburb,
      created_at: new Date().toISOString(),
    };

    // Supabase path
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('waitlist').insert([sanitizedEntry]);

      if (error) {
        if (error.code === '23505') {
          return NextResponse.json(
            { message: 'You are already on the waitlist!', isDuplicate: true },
            { status: 200 }
          );
        }
        console.error('Supabase waitlist insert error:', error);
        return NextResponse.json(
          { error: `Database error: ${error.message}` },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { message: 'Successfully joined the waitlist!', isDuplicate: false },
        { status: 200 }
      );
    }

    // Local file fallback — dev only, not available in serverless environments
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      console.error('Mock file storage used in production — configure Supabase env vars.');
      return NextResponse.json(
        { error: 'Service not configured. Please try again later.' },
        { status: 503 }
      );
    }

    // Dynamic import so fs is never bundled in serverless builds
    const fs = await import('fs');
    const path = await import('path');
    const mockFilePath = path.join(process.cwd(), 'waitlist-mock.json');
    let currentWaitlist: WaitlistEntry[] = [];

    if (fs.existsSync(mockFilePath)) {
      try {
        currentWaitlist = JSON.parse(fs.readFileSync(mockFilePath, 'utf8'));
      } catch {
        currentWaitlist = [];
      }
    }

    if (currentWaitlist.some((entry) => entry.email === sanitizedEntry.email)) {
      return NextResponse.json(
        { message: 'You are already on the waitlist!', isDuplicate: true },
        { status: 200 }
      );
    }

    currentWaitlist.push(sanitizedEntry);
    fs.writeFileSync(mockFilePath, JSON.stringify(currentWaitlist, null, 2), 'utf8');

    return NextResponse.json(
      { message: 'Successfully joined the waitlist!', isDuplicate: false },
      { status: 200 }
    );
  } catch (error) {
    console.error('Waitlist API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}