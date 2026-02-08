'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  // Prefetch dashboard page while user is on login
  useEffect(() => {
    router.prefetch('/dashboard');
  }, [router]);

  // Check if form is complete
  const isFormComplete = email.trim() !== '' && password.trim() !== '';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-8 sm:py-12 bg-[#F8FAFC]">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#2563EB] rounded-xl flex items-center justify-center">
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
          Welcome back!
        </h1>

        {/* Subtext */}
        <p className="text-gray-600 text-center mb-8 text-sm sm:text-base px-4">
          Sign in to continue transforming your lectures into notes
        </p>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-5">
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
                       focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent
                       placeholder:text-gray-400 transition-all"
            />
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-sm font-medium text-[#0F172A]">
                Password <span className="text-red-500">*</span>
              </label>
              <Link href="/forgot-password" className="text-sm text-[#2563EB] hover:underline">
                Forgot password?
              </Link>
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-3 border border-[#E5E7EB] rounded-lg text-base
                       focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent
                       placeholder:text-gray-400 transition-all"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={!isFormComplete || loading}
            className={`w-full py-3 rounded-lg text-base font-medium transition-all duration-200
              ${isFormComplete && !loading
                ? 'bg-[#2563EB] text-white hover:bg-[#1d4ed8] cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        {/* Signup Link */}
        <div className="mt-6 text-center">
          <span className="text-gray-600 text-sm">Don&apos;t have an account?</span>{' '}
          <Link href="/signup" className="text-[#2563EB] text-sm font-bold hover:underline">
            Sign up
          </Link>
        </div>
      </div>
    </main>
  );
}
