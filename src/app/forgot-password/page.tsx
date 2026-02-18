'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const supabase = createClient();

  const isFormComplete = email.trim() !== '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setEmailSent(true);
      setLoading(false);
    }
  };

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

        {emailSent ? (
          /* Success State */
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-2">
              Check your email
            </h1>
            <p className="text-gray-600 text-sm sm:text-base mb-6 px-4">
              We&apos;ve sent a password reset link to <strong>{email}</strong>
            </p>
            <p className="text-gray-500 text-sm mb-8 px-4">
              Didn&apos;t receive the email? Check your spam folder or try again.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setEmailSent(false);
                  setEmail('');
                }}
                className="w-full py-3 rounded-lg text-base font-medium bg-[#A855F7] hover:bg-[#9333EA] transition-colors"
                style={{ color: '#FFFFFF' }}
              >
                Try another email
              </button>
              <Link
                href="/login"
                className="block w-full py-3 rounded-lg text-base font-medium border border-[#E5E7EB] text-gray-600 hover:bg-gray-50 transition-colors text-center"
              >
                Back to login
              </Link>
            </div>
          </div>
        ) : (
          /* Form State */
          <>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] text-center mb-2">
              Forgot password?
            </h1>
            <p className="text-gray-600 text-center mb-8 text-sm sm:text-base px-4">
              Please provide your account email address to receive verification code.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                  {error}
                </div>
              )}

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
                {loading ? 'Sending...' : 'Reset password'}
              </button>
            </form>

            {/* Back to Login */}
            <div className="mt-6 text-center">
              <Link href="/login" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-[#0F172A]">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back to login
              </Link>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
