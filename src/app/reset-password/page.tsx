'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validSession, setValidSession] = useState<boolean | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const isFormComplete = password.trim() !== '' && confirmPassword.trim() !== '';

  useEffect(() => {
    // Check if user has a valid session from the reset link
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setValidSession(!!session);
    };
    checkSession();
  }, [supabase.auth]);

  const handleSubmit = async (e: React.FormEvent) => {
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

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    }
  };

  // Loading state while checking session
  if (validSession === null) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#A855F7] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Verifying your reset link...</p>
        </div>
      </main>
    );
  }

  // Invalid or expired session
  if (!validSession) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 bg-[#F8FAFC]">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-2">
            Invalid or expired link
          </h1>
          <p className="text-gray-600 text-sm sm:text-base mb-6 px-4">
            This password reset link is invalid or has expired. Please request a new one.
          </p>
          <Link
            href="/forgot-password"
            className="inline-block w-full py-3 rounded-lg text-base font-medium bg-[#A855F7] hover:bg-[#9333EA] transition-colors text-center"
            style={{ color: '#FFFFFF' }}
          >
            Request new link
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 bg-[#F8FAFC]">
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

        {success ? (
          /* Success State */
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-2">
              Password updated!
            </h1>
            <p className="text-gray-600 text-sm sm:text-base mb-6 px-4">
              Your password has been successfully reset. Redirecting you to your dashboard...
            </p>
            <div className="w-8 h-8 border-2 border-[#A855F7] border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          /* Form State */
          <>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] text-center mb-2">
              Set new password
            </h1>
            <p className="text-gray-600 text-center mb-8 text-sm sm:text-base px-4">
              Your new password must be at least 6 characters.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Password Field */}
              <div>
                <label className="block mb-1.5 text-sm font-medium text-[#0F172A]">
                  New Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
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
                  placeholder="Confirm new password"
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
                    ? 'bg-[#A855F7] hover:bg-[#9333EA] cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                style={{ color: isFormComplete && !loading ? '#FFFFFF' : undefined }}
              >
                {loading ? 'Updating...' : 'Reset password'}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
