'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Footer from '@/components/landing/Footer';

export default function RefundPolicyPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [mobileMenuOpen]);

  return (
    <main className="min-h-screen bg-gray-100">
      {/* Header */}
      <nav ref={menuRef} className="bg-white sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#A855F7] rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <span className="text-xl font-semibold text-[#0F172A]">Classcribe</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm text-gray-800 hover:text-[#A855F7] transition-colors">
                Home
              </Link>
              <Link href="/#pricing" className="text-sm text-gray-800 hover:text-[#A855F7] transition-colors">
                Pricing
              </Link>
              <Link href="/login" className="text-sm text-gray-800 hover:text-[#A855F7] transition-colors">
                Login
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-[#A855F7] text-white text-sm font-medium rounded-lg hover:bg-[#9333EA] transition-colors"
              >
                Get Started
              </Link>
            </div>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile Menu Dropdown */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-100">
              <div className="flex flex-col gap-3">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xl text-left text-gray-800 hover:text-[#A855F7] hover:bg-gray-50 rounded-lg transition-colors py-2"
                >
                  Home
                </Link>
                <Link
                  href="/#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xl text-left text-gray-800 hover:text-[#A855F7] hover:bg-gray-50 rounded-lg transition-colors py-2"
                >
                  Pricing
                </Link>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xl text-center text-gray-800 hover:text-[#A855F7] border-2 border-gray-300 rounded-lg transition-colors py-4 px-6 mt-2"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-xl text-center bg-[#A855F7] font-medium border-2 border-[#A855F7] rounded-lg hover:bg-[#9333EA] hover:border-[#9333EA] transition-colors py-4 px-6"
                  style={{ color: '#FFFFFF' }}
                >
                  Get Started
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-[#0F172A] mb-2">Refund Policy</h1>
        <p className="text-gray-500 mb-8">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

        <div className="space-y-6 sm:space-y-8">
          {/* Hero Section */}
          <section className="text-center pb-6">
            <h3 className="text-xl font-bold text-emerald-800 mb-3">Try Classcribe 100% Risk-Free. Cancel Anytime.</h3>
            <p className="text-gray-800 leading-relaxed text-justify max-w-2xl mx-auto">
              We built Classcribe to help you study smarter, learn faster, and ace your exams — and we&apos;re confident
              you&apos;ll love it. But if it&apos;s not the right fit, we&apos;ve made it super easy to get your money back or cancel.
            </p>
          </section>

          {/* 3-Day Money-Back Guarantee */}
          <section>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-emerald-800 mb-2">3-Day 100% Money-Back Guarantee</h3>
                <p className="text-gray-800 leading-relaxed text-justify mb-4">
                  If you&apos;re not satisfied within the first 3 days of your first subscription, just contact us
                  and we&apos;ll give you a full refund — no questions asked.
                </p>
                <ul className="space-y-2 text-gray-800">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#A855F7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Valid only for first-time purchases on Student Plan
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#A855F7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Not available on subscription renewals
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#A855F7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Email <a href="mailto:support@classcribe.app" className="text-[#A855F7] hover:underline">support@classcribe.app</a> with subject: &quot;Refund Request&quot;
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#A855F7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Refunds processed within 3-5 business days
                  </li>
                </ul>
                <p className="text-gray-500 text-sm mt-4 italic">
                  We believe in earning your trust — not forcing your payment.
                </p>
              </div>
            </div>
          </section>

          {/* Cancel Anytime */}
          <section>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-emerald-800 mb-2">Cancel Anytime — You&apos;re in Control</h3>
                <p className="text-gray-800 leading-relaxed text-justify mb-4">
                  You can cancel your subscription anytime directly from your dashboard — no support tickets, no hoops to jump through.
                </p>
                <ul className="space-y-2 text-gray-800">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#A855F7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Access remains active until the end of your billing period
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-[#A855F7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    No cancellation fees or penalties
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Switch Plans */}
          <section>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-emerald-800 mb-2">Switch Plans Anytime</h3>
                <p className="text-gray-800 leading-relaxed text-justify">
                  Want to upgrade or switch from monthly to yearly? You can change your plan anytime, and we&apos;ll
                  automatically adjust the billing so you never overpay.
                </p>
              </div>
            </div>
          </section>

          {/* You're Protected */}
          <section>
            <h3 className="text-lg font-semibold text-emerald-800 mb-4 text-center">You&apos;re Protected — Always</h3>
            <p className="text-gray-800 text-center mb-6">With Classcribe, you&apos;re never locked in.</p>
            <div className="flex flex-wrap justify-center gap-4">
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs sm:text-sm font-medium text-[#0F172A]">3-Day Money-Back Guarantee</span>
              </div>
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs sm:text-sm font-medium text-[#0F172A]">Cancel Anytime</span>
              </div>
              <div className="flex items-center gap-2 px-3 sm:px-4 py-2">
                <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs sm:text-sm font-medium text-[#0F172A]">Plan Switching Made Easy</span>
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="text-center pt-4">
            <p className="text-gray-800">
              Questions about refunds or cancellations? Contact us at{' '}
              <a href="mailto:support@classcribe.app" className="text-[#A855F7] hover:underline font-medium">
                support@classcribe.app
              </a>
            </p>
          </section>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </main>
  );
}
