'use client';

import Link from 'next/link';

export default function AuthErrorPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 bg-[#F8FAFC]">
      <div className="w-full max-w-md text-center">
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

        {/* Error Icon */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-3">
          Verification Failed
        </h1>

        {/* Description */}
        <p className="text-gray-600 mb-8 px-4">
          The verification link may have expired or is invalid.
          Please try signing up again or request a new verification email.
        </p>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link
            href="/signup"
            className="block w-full py-3 rounded-lg text-base font-medium bg-[#A855F7] text-white hover:bg-[#9333EA] transition-colors"
          >
            Sign up again
          </Link>

          <Link
            href="/login"
            className="block w-full py-3 rounded-lg text-base font-medium border-2 border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back to login
          </Link>
        </div>
      </div>
    </main>
  );
}
