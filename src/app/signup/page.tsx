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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // Check for guest token (audio) and material token (documents), plus redirect param
  const guestToken = searchParams.get('token');
  const materialToken = searchParams.get('material_token');
  const redirectTo = searchParams.get('redirect');
  const hasGuestContent = guestToken || materialToken;

  // Prefetch onboarding and dashboard pages
  useEffect(() => {
    router.prefetch('/onboarding');
    router.prefetch('/dashboard');
    if (redirectTo) {
      router.prefetch(`/${redirectTo}`);
    }

    // Store guest tokens in sessionStorage for claiming after verification
    if (guestToken) {
      sessionStorage.setItem('guest_lecture_token', guestToken);
    }
    if (materialToken) {
      sessionStorage.setItem('guest_material_token', materialToken);
    }
  }, [router, redirectTo, guestToken, materialToken]);

  // Check if form is complete
  const isFormComplete = fullName.trim() !== '' && email.trim() !== '' && password.trim() !== '' && confirmPassword.trim() !== '' && acceptedTerms;

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
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      } else {
        // Send OTP code to user's email
        const otpResponse = await fetch('/api/auth/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        if (!otpResponse.ok) {
          const otpData = await otpResponse.json();
          setError(otpData.error || 'Failed to send verification code. Please try again.');
          setLoading(false);
          return;
        }

        // Redirect to verify email page
        window.location.href = '/verify-email';
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Heading */}
      <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] text-center mb-2">
        {hasGuestContent ? 'Your study materials are ready!' : 'Get started!'}
      </h1>

      {/* Subtext */}
      <p className="text-gray-600 text-center mb-8 text-sm sm:text-base px-4">
        {hasGuestContent
          ? 'Create an account to view your generated content'
          : ''
        }
      </p>

      {/* Guest Content Notice */}
      {hasGuestContent && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2 text-green-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-sm font-medium">
              {guestToken ? 'Your lecture has been processed!' : 'Your document has been processed!'}
            </span>
          </div>
          <p className="text-xs text-green-600 mt-1">Sign up to access your study materials.</p>
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
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
              required
              className="w-full px-4 py-3 pr-12 border border-[#E5E7EB] rounded-lg text-base
                       focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent
                       placeholder:text-gray-400 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              )}
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">Must be at least 6 characters</p>
        </div>

        {/* Confirm Password Field */}
        <div>
          <label className="block mb-1.5 text-sm font-medium text-[#0F172A]">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              className="w-full px-4 py-3 pr-12 border border-[#E5E7EB] rounded-lg text-base
                       focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent
                       placeholder:text-gray-400 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
            >
              {showConfirmPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Terms Agreement Checkbox */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="acceptTerms"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-1 w-4 h-4 accent-[#A855F7] cursor-pointer"
          />
          <label htmlFor="acceptTerms" className="text-sm font-bold text-gray-700 cursor-pointer">
            By signing up, you accept Classcribe&apos;s{' '}
            <Link href="/terms" className="text-[#A855F7] font-bold underline decoration-[#A855F7] decoration-2">terms of service</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-[#A855F7] font-bold underline decoration-[#A855F7] decoration-2">privacy policy</Link>.
          </label>
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
