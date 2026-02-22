'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function VerifyEmailPage() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Check for pending verification flag from signup
    const pendingEmail = sessionStorage.getItem('pendingVerification');

    if (pendingEmail) {
      // Valid session - user came from signup
      setEmail(pendingEmail);
      setIsValidSession(true);
      // Clear the flag immediately so refresh won't work
      sessionStorage.removeItem('pendingVerification');
    } else {
      // No valid session - redirect to signup
      router.replace('/signup');
    }
  }, [router]);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take last character
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace - move to previous input
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pastedData.length; i++) {
      newOtp[i] = pastedData[i];
    }
    setOtp(newOtp);
    // Focus last filled input or first empty
    const lastIndex = Math.min(pastedData.length, 5);
    inputRefs.current[lastIndex]?.focus();
  };

  const handleVerifyOtp = async () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setVerifying(true);
    setError('');

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        // Redirect to onboarding after short delay
        setTimeout(() => {
          router.push('/onboarding');
        }, 1500);
      } else {
        setError(data.error || 'Verification failed');
      }
    } catch {
      setError('Failed to verify code. Please try again.');
    } finally {
      setVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) {
      setError('No email found. Please try signing up again.');
      return;
    }

    setResending(true);
    setError('');
    setResendSuccess(false);

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setResendSuccess(true);
        setOtp(['', '', '', '', '', '']);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to resend code');
      }
    } catch {
      setError('Failed to resend code. Please try again.');
    } finally {
      setResending(false);
    }
  };

  // Show loading while checking session or redirecting
  if (!isValidSession) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#A855F7] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </main>
    );
  }

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

        {/* Email Icon */}
        <div className="w-20 h-20 bg-[#A855F7]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg
            className="w-10 h-10 text-[#A855F7]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
            />
          </svg>
        </div>

        {/* Heading */}
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-3">
          {success ? 'Email Verified!' : 'Verify your email'}
        </h1>

        {/* Description */}
        {!success && (
          <p className="text-gray-600 mb-6 px-4">
            We&apos;ve sent a 6-digit code to <span className="font-medium">{email || 'your email'}</span>.
            Enter it below to verify your account.
          </p>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-green-700">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-medium">Email verified successfully!</span>
            </div>
            <p className="text-sm text-green-600 mt-1">Redirecting to onboarding...</p>
          </div>
        )}

        {!success && (
          <>
            {/* OTP Input */}
            <div className="flex justify-center gap-2 sm:gap-3 mb-6" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => { inputRefs.current[index] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-[#A855F7] focus:ring-2 focus:ring-[#A855F7]/20 outline-none transition-all"
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Resend Success Message */}
            {resendSuccess && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-600 text-sm">New code sent to your email!</p>
              </div>
            )}

            {/* Verify Button */}
            <button
              onClick={handleVerifyOtp}
              disabled={verifying || otp.join('').length !== 6}
              className="w-full py-3 rounded-lg text-base font-medium bg-[#A855F7] text-white hover:bg-[#9333EA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            >
              {verifying ? 'Verifying...' : 'Verify Email'}
            </button>

            {/* Expiry Notice */}
            <p className="text-gray-500 text-sm mb-4">
              Code expires in 30 minutes
            </p>

            {/* Resend Link */}
            <p className="text-gray-600 text-sm">
              Didn&apos;t receive the code?{' '}
              <button
                onClick={handleResendCode}
                disabled={resending}
                className="text-[#A855F7] font-medium hover:underline disabled:opacity-50"
              >
                {resending ? 'Sending...' : 'Resend code'}
              </button>
            </p>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-200"></div>
              <span className="text-gray-400 text-sm">or</span>
              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            {/* Check email link info */}
            <p className="text-gray-500 text-sm mb-6">
              You can also click the verification link we sent to your email.
            </p>
          </>
        )}

        {/* Back to Login */}
        <Link
          href="/login"
          className="text-[#A855F7] text-sm font-medium hover:underline"
        >
          Back to login
        </Link>
      </div>
    </main>
  );
}
