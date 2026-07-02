import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  const adminSession = request.cookies.get('admin_session');

  if (!adminSession || adminSession.value !== 'authenticated') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const reportId = formData.get('report_id');
  const action = formData.get('action');

  if (!reportId) {
    return NextResponse.json({ error: 'report_id is required' }, { status: 400 });
  }

  if (action !== 'reviewed') {
    return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from('reports')
    .update({ status: 'reviewed' })
    .eq('id', reportId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.redirect(new URL('/admin', request.url), { status: 303 });
}
