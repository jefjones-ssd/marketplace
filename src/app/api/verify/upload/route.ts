import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { supabaseAdmin } from '@/lib/supabase-admin';

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const EXT_FROM_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};

function validateFile(file: FormDataEntryValue | null, label: string) {
  if (!(file instanceof File)) {
    return { error: `${label} is required` };
  }

  if (file.size > MAX_FILE_SIZE) {
    return { error: `${label} must be under 10MB` };
  }

  const ext = EXT_FROM_MIME[file.type];
  if (!ext) {
    return { error: `${label} must be a JPEG, PNG, or WEBP image` };
  }

  return { file, ext };
}

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

  let formData: FormData;

  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const idResult = validateFile(formData.get('idFile'), 'ID photo');
  if (idResult.error) {
    return NextResponse.json({ error: idResult.error }, { status: 400 });
  }

  const selfieResult = validateFile(formData.get('selfieFile'), 'Selfie photo');
  if (selfieResult.error) {
    return NextResponse.json({ error: selfieResult.error }, { status: 400 });
  }

  const { error: idUploadError } = await supabaseAdmin.storage
    .from('verifications')
    .upload(`${session.user.id}/id.${idResult.ext}`, idResult.file!, {
      upsert: true,
      contentType: idResult.file!.type,
    });

  if (idUploadError) {
    return NextResponse.json({ error: idUploadError.message }, { status: 500 });
  }

  const { error: selfieUploadError } = await supabaseAdmin.storage
    .from('verifications')
    .upload(`${session.user.id}/selfie.${selfieResult.ext}`, selfieResult.file!, {
      upsert: true,
      contentType: selfieResult.file!.type,
    });

  if (selfieUploadError) {
    return NextResponse.json({ error: selfieUploadError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
