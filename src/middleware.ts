import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes that require onboarding
  const protectedPaths = ['/dashboard', '/lectures', '/settings'];
  const isProtectedPath = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // Auth routes (login, signup)
  const authPaths = ['/login', '/signup'];
  const isAuthPath = authPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  // Onboarding route
  const isOnboardingPath = request.nextUrl.pathname.startsWith('/onboarding');

  // Verify email route
  const isVerifyEmailPath = request.nextUrl.pathname.startsWith('/verify-email');

  // Auth callback route (for email verification)
  const isAuthCallbackPath = request.nextUrl.pathname.startsWith('/auth/callback');

  // Auth error route
  const isAuthErrorPath = request.nextUrl.pathname.startsWith('/auth/auth-error');

  // Redirect unauthenticated users to login
  if ((isProtectedPath || isOnboardingPath) && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Check if user's email is verified (via Supabase link or OTP)
  let isEmailVerified = user?.email_confirmed_at != null;

  // Also check our custom email_verified flag in profiles (for OTP verification)
  if (user && !isEmailVerified) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('email_verified')
      .eq('id', user.id)
      .single();

    if (profile?.email_verified) {
      isEmailVerified = true;
    }
  }

  // Redirect unverified users to verify-email page (except for allowed paths)
  if (user && !isEmailVerified && !isVerifyEmailPath && !isAuthCallbackPath && !isAuthPath && !isAuthErrorPath) {
    const url = request.nextUrl.clone();
    url.pathname = '/verify-email';
    return NextResponse.redirect(url);
  }

  // Redirect verified users away from verify-email page
  if (isVerifyEmailPath && user && isEmailVerified) {
    const url = request.nextUrl.clone();
    url.pathname = '/onboarding';
    return NextResponse.redirect(url);
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPath && user && isEmailVerified) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  // Check onboarding status for authenticated users on protected paths
  if (isProtectedPath && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single();

    // Redirect to onboarding if profile doesn't exist or onboarding not completed
    if (!profile || !profile.onboarding_completed) {
      const url = request.nextUrl.clone();
      url.pathname = '/onboarding';
      return NextResponse.redirect(url);
    }
  }

  // Redirect away from onboarding if already completed
  if (isOnboardingPath && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', user.id)
      .single();

    if (profile?.onboarding_completed) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
