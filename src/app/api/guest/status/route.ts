import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/guest/status - Get guest lecture status
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  const adminClient = createAdminClient();

  const { data, error } = await adminClient
    .from('guest_lectures')
    .select('status, error_message')
    .eq('token', token)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Lecture not found' }, { status: 404 });
  }

  return NextResponse.json({
    status: data.status,
    error: data.error_message,
  });
}
