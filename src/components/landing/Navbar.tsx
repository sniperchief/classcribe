'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isToolsDropdownOpen, setIsToolsDropdownOpen] = useState(false);
  const [isMobileToolsOpen, setIsMobileToolsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

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
    <nav ref={menuRef} className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-xl font-semibold text-[#A855F7]">Classcribe</span>
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
            <div className="flex flex-col gap-3">
              <Link
                href="/"
                className="text-xl text-left text-gray-800 hover:text-[#A855F7] hover:bg-gray-50 rounded-lg transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <div className="flex flex-col">
                <button
                  className="text-xl text-left text-gray-800 hover:text-[#A855F7] hover:bg-gray-50 rounded-lg transition-colors py-2 flex items-center gap-1"
                  onClick={() => setIsMobileToolsOpen(!isMobileToolsOpen)}
                >
                  Tools
                  <svg
                    className={`w-5 h-5 transition-transform ${isMobileToolsOpen ? 'rotate-180' : ''}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isMobileToolsOpen && (
                  <div className="ml-4 mt-1">
                    <Link
                      href="/signup"
                      className="block text-lg text-gray-600 hover:text-[#A855F7] transition-colors py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Exam Ready Notes
                    </Link>
                  </div>
                )}
              </div>
              <Link
                href="/pricing"
                className="text-xl text-left text-gray-800 hover:text-[#A855F7] hover:bg-gray-50 rounded-lg transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>

              <hr className="border-[#E5E7EB] my-2" />

              {!checkingAuth && (
                isLoggedIn ? (
                  <Link
                    href="/dashboard"
                    className="text-xl text-center bg-[#A855F7] font-medium border-2 border-[#A855F7] rounded-lg hover:bg-[#9333EA] hover:border-[#9333EA] transition-colors py-4 px-6"
                    style={{ color: '#FFFFFF' }}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-xl text-center text-gray-800 hover:text-[#A855F7] border-2 border-gray-300 rounded-lg transition-colors py-4 px-6"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Log In
                    </Link>
                    <Link
                      href="/signup"
                      className="text-xl text-center bg-[#A855F7] font-medium border-2 border-[#A855F7] rounded-lg hover:bg-[#9333EA] hover:border-[#9333EA] transition-colors py-4 px-6"
                      style={{ color: '#FFFFFF' }}
                      onClick={() => setIsMobileMenuOpen(false)}
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
