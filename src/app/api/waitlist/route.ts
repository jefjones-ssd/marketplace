import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import fs from 'fs';
import path from 'path';

// Valid suburbs list as defined in the South Peninsula scope
const VALID_SUBURBS = [
  'Muizenberg',
  'Kalk Bay',
  'St James',
  'Fish Hoek',
  'Simon\'s Town',
  'Noordhoek',
  'Kommetjie',
  'Glencairn',
  'Lakeside',
  'Marina da Gama'
];

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

    // 1. Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return NextResponse.json({ error: 'Name must be at least 2 characters.' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
    }

    if (!suburb || !VALID_SUBURBS.includes(suburb)) {
      return NextResponse.json({ error: 'Please select a valid South Peninsula suburb.' }, { status: 400 });
    }

    const sanitizedEntry: WaitlistEntry = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      suburb,
      created_at: new Date().toISOString()
    };
    // 2. Database Insert (Supabase vs Mock Fallback)
    if (isSupabaseConfigured && supabase) {
      // In Supabase, the table is expected to be named 'waitlist'
      // It should have columns: name, email, suburb, created_at
      const { error } = await supabase
        .from('waitlist')
        .insert([sanitizedEntry]);

      if (error) {
        // If error is unique constraint violation (code 23505 in Postgres)
        if (error.code === '23505') {
          return NextResponse.json(
            { message: 'You are already on the waitlist!', isDuplicate: true },
            { status: 200 }
          );
        }
        console.error('Supabase waitlist insert error:', error);
        return NextResponse.json({ 
          error: `Supabase database error: ${error.message} (Code: ${error.code})` 
        }, { status: 500 });
      }
    } else {
      // Local file fallback
      const mockFilePath = path.join(process.cwd(), 'waitlist-mock.json');
      let currentWaitlist: WaitlistEntry[] = [];

      if (fs.existsSync(mockFilePath)) {
        try {
          const fileData = fs.readFileSync(mockFilePath, 'utf8');
          currentWaitlist = JSON.parse(fileData);
        } catch (e) {
          console.error('Error reading mock waitlist file, initializing empty array:', e);
          currentWaitlist = [];
        }
      }

      // Check for duplicate email
      const duplicateExists = currentWaitlist.some(
        (entry) => entry.email === sanitizedEntry.email
      );

      if (duplicateExists) {
        return NextResponse.json(
          { message: 'You are already on the waitlist!', isDuplicate: true },
          { status: 200 }
        );
      }

      currentWaitlist.push(sanitizedEntry);

      try {
        fs.writeFileSync(mockFilePath, JSON.stringify(currentWaitlist, null, 2), 'utf8');
      } catch (e) {
        console.error('Error writing to mock waitlist file:', e);
        return NextResponse.json({ error: 'Failed to write to mock storage.' }, { status: 500 });
      }
    }

    return NextResponse.json(
      { message: 'Successfully joined the waitlist!', isDuplicate: false },
      { status: 200 }
    );
  } catch (error) {
    console.error('Waitlist API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
