import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/onboarding';
  const guestToken = searchParams.get('token');

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // If there's a guest token, claim the lecture
      if (guestToken) {
        try {
          const claimResponse = await fetch(`${origin}/api/guest/claim`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: guestToken }),
          });

          if (claimResponse.ok) {
            const { lectureId } = await claimResponse.json();
            return NextResponse.redirect(`${origin}/lectures/${lectureId}`);
          }
        } catch {
          // If claim fails, continue to onboarding
        }
      }

      // Successfully verified, redirect to next page
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // If there's an error or no code, redirect to error page
  return NextResponse.redirect(`${origin}/auth/auth-error`);
}
