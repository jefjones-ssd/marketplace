import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  const adminSession = request.cookies.get('admin_session');

  if (!adminSession || adminSession.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const profileId = formData.get('profile_id');
  const action = formData.get('action');

  if (action !== 'approve' && action !== 'reject') {
    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  }

  const verificationStatus = action === 'approve' ? 'verified' : 'rejected';

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ verification_status: verificationStatus })
    .eq('id', profileId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.redirect(new URL('/admin', request.url), { status: 303 });
}
