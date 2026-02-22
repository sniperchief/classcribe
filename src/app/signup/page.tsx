'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

function SignupForm() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Check for guest token and redirect param
  const guestToken = searchParams.get('token');
  const redirectTo = searchParams.get('redirect');

  // Prefetch onboarding and dashboard pages
  useEffect(() => {
    router.prefetch('/onboarding');
    router.prefetch('/dashboard');
    if (redirectTo) {
      router.prefetch(`/${redirectTo}`);
    }
  }, [router, redirectTo]);

  // Check if form is complete
  const isFormComplete = fullName.trim() !== '' && email.trim() !== '' && password.trim() !== '' && confirmPassword.trim() !== '';

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      // Build the redirect URL for after email verification
      let redirectUrl = `${window.location.origin}/auth/callback`;
      if (guestToken) {
        redirectUrl += `?next=/api/guest/claim-redirect&token=${guestToken}`;
      } else if (redirectTo) {
        redirectUrl += `?next=/${redirectTo}`;
      } else {
        redirectUrl += '?next=/onboarding';
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        // Send OTP code to user's email
        try {
          await fetch('/api/auth/send-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
          });
        } catch {
          // Continue even if OTP send fails - user can resend from verify page
        }

        // Redirect to verify email page with email parameter
        window.location.href = `/verify-email?email=${encodeURIComponent(email)}`;
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="flex justify-center mb-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-10 h-10 bg-[#A855F7] rounded-xl flex items-center justify-center">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <span className="text-2xl font-bold text-[#0F172A]">Classcribe</span>
        </Link>
      </div>

      {/* Heading */}
      <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] text-center mb-2">
        {guestToken ? 'Your notes are ready!' : 'Get started!'}
      </h1>

      {/* Subtext */}
      <p className="text-gray-600 text-center mb-8 text-sm sm:text-base px-4">
        {guestToken
          ? 'Create an account to view your generated notes'
          : 'Join over 10,000+ students globally and start transforming recorded lectures into notes'
        }
      </p>

      {/* Guest Token Notice */}
      {guestToken && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">Your lecture has been processed!</span>
          </div>
          <p className="text-xs text-green-600 mt-1">Sign up to access your notes.</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSignup} className="space-y-5">
        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Full Name Field */}
        <div>
          <label className="block mb-1.5 text-sm font-medium text-[#0F172A]">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
            required
            className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg text-base
                     focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent
                     placeholder:text-gray-400 transition-all"
          />
        </div>

        {/* Email Field */}
        <div>
          <label className="block mb-1.5 text-sm font-medium text-[#0F172A]">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
            className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg text-base
                     focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent
                     placeholder:text-gray-400 transition-all"
          />
        </div>

        {/* Password Field */}
        <div>
          <label className="block mb-1.5 text-sm font-medium text-[#0F172A]">
            Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Create a password"
            required
            className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg text-base
                     focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent
                     placeholder:text-gray-400 transition-all"
          />
          <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block mb-1.5 text-sm font-medium text-[#0F172A]">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm your password"
            required
            className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg text-base
                     focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent
                     placeholder:text-gray-400 transition-all"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isFormComplete || loading}
          className={`w-full py-3 rounded-lg text-base font-medium transition-all duration-200
            ${isFormComplete && !loading
              ? 'bg-[#A855F7] text-white hover:bg-[#9333EA] cursor-pointer'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
        >
          {loading ? 'Creating account...' : 'Sign Up'}
        </button>
      </form>

      {/* Login Link */}
      <div className="mt-6 text-center">
        <span className="text-gray-600 text-sm">Already have an account?</span>{' '}
        <Link href={redirectTo ? `/login?redirect=${redirectTo}` : '/login'} className="text-[#A855F7] text-sm font-bold hover:underline">
          Sign in
        </Link>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 bg-[#F8FAFC]">
      <Suspense fallback={<div className="text-center">Loading...</div>}>
        <SignupForm />
      </Suspense>
    </main>
  );
}
