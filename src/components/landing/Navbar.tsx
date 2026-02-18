'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const [isMobileToolsOpen, setIsMobileToolsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setIsLoggedIn(!!user);
    } catch (error) {
      setIsLoggedIn(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#A855F7] rounded-lg flex items-center justify-center">
              <svg
                className="w-5 h-5 text-white"
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
            <span className="text-xl font-semibold text-[#0F172A]">Classcribe</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm text-gray-600 hover:text-[#4F6B5C] transition-colors">
              Home
            </Link>
            <div
              className="relative"
              onMouseEnter={() => setIsToolsDropdownOpen(true)}
              onMouseLeave={() => setIsToolsDropdownOpen(false)}
            >
              <button className="text-sm text-gray-600 hover:text-[#4F6B5C] transition-colors flex items-center gap-1">
                Tools
                <svg
                  className={`w-4 h-4 transition-transform ${isToolsDropdownOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isToolsDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#E5E7EB] py-2">
                  <Link
                    href="/signup"
                    className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-[#4F6B5C] transition-colors"
                  >
                    Exam Ready Notes
                  </Link>
                </div>
              )}
            </div>
            <Link href="/pricing" className="text-sm text-gray-600 hover:text-[#4F6B5C] transition-colors">
              Pricing
            </Link>
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            {!checkingAuth && (
              isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="bg-[#A855F7] text-sm font-medium py-2 px-4 rounded-lg hover:bg-[#9333EA] transition-colors"
                  style={{ color: '#FFFFFF' }}
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-medium text-gray-600 hover:text-[#4F6B5C] transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/signup"
                    className="bg-[#A855F7] text-sm font-medium py-2 px-4 rounded-lg hover:bg-[#9333EA] transition-colors"
                    style={{ color: '#FFFFFF' }}
                  >
                    Get Started Free
                  </Link>
                </>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            className="md:hidden p-2 text-gray-600 hover:text-[#4F6B5C]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-[#E5E7EB]">
            <div className="flex flex-col items-center gap-4 text-center">
              <Link
                href="/"
                className="text-sm text-gray-600 hover:text-[#4F6B5C] transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <div className="flex flex-col items-center">
                <button
                  className="text-sm text-gray-600 hover:text-[#4F6B5C] transition-colors flex items-center justify-center gap-1"
                  onClick={() => setIsMobileToolsOpen(!isMobileToolsOpen)}
                >
                  Tools
                  <svg
                    className={`w-4 h-4 transition-transform ${isMobileToolsOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isMobileToolsOpen && (
                  <div className="mt-2">
                    <Link
                      href="/signup"
                      className="block text-sm text-gray-600 hover:text-[#4F6B5C] transition-colors py-1"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Exam Ready Notes
                    </Link>
                  </div>
                )}
              </div>
              <Link
                href="/pricing"
                className="text-sm text-gray-600 hover:text-[#4F6B5C] transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              <hr className="border-[#E5E7EB] w-full" />
              {!checkingAuth && (
                isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    className="bg-[#A855F7] text-sm font-medium py-2 px-4 rounded-lg text-center hover:bg-[#9333EA] transition-colors"
                    style={{ color: '#FFFFFF' }}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-sm font-medium text-gray-600 hover:text-[#4F6B5C] border border-gray-300 py-2 px-6 rounded-lg shadow-md shadow-black/20 hover:shadow-lg hover:shadow-black/30 transition-all"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/signup"
                      className="bg-[#A855F7] text-sm font-medium py-2 px-4 rounded-lg text-center hover:bg-[#9333EA] transition-colors"
                      style={{ color: '#FFFFFF' }}
                    >
                      Get Started Free
                    </Link>
                  </>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
