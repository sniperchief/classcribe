'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useLanguage, languageNames, Language } from '@/contexts/LanguageContext';
import MobileMenu from '@/components/MobileMenu';

type Profile = {
  full_name: string | null;
  country: string | null;
  university: string | null;
  course_of_study: string | null;
};

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [isPremium, setIsPremium] = useState(false);
  const router = useRouter();
  const supabase = createClient();
  const { language, setLanguage, t } = useLanguage();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('/api/dashboard');
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load user data');
        }

        if (data.profile) {
          setProfile(data.profile);
        }

        if (data.email) {
          setUserEmail(data.email);
        }

        if (data.subscription) {
          setIsPremium(data.subscription.plan !== 'free');
        }
      } catch (err) {
        console.error('Failed to fetch user data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    router.push('/login');
    supabase.auth.signOut();
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-[#F8FAFC]">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="bg-white rounded-xl p-6 space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2">
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
              <span className="text-xl font-semibold text-[#0F172A] hidden sm:block">Classcribe</span>
            </Link>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Desktop Navigation */}
              <Link
                href="/dashboard"
                className="hidden md:flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-[#E5E7EB] rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                {t('nav.dashboard')}
              </Link>

              {/* Mobile Menu */}
              <MobileMenu isPremium={isPremium} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Page Title */}
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          {t('settings.title')}
        </h1>

        {/* Profile Section */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden mb-6">
          <div className="px-4 sm:px-6 py-4 border-b border-[#E5E7EB] bg-gradient-to-r from-violet-50 to-emerald-50">
            <h2 className="text-lg font-semibold text-[#0F172A]">Profile</h2>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            {/* Full Name */}
            <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-violet-50 to-emerald-50 rounded-lg border border-violet-200">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-emerald-500 flex items-center justify-center flex-shrink-0">
                <span className="text-white font-semibold text-lg">
                  {profile?.full_name ? profile.full_name[0].toUpperCase() : userEmail ? userEmail[0].toUpperCase() : '?'}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-500">Full Name</p>
                <p className="text-[#0F172A] font-medium">
                  {profile?.full_name || 'Not set'}
                </p>
              </div>
            </div>

            {/* Country */}
            <div className="px-4 py-3 bg-gray-50 rounded-lg border border-[#E5E7EB]">
              <p className="text-xs text-gray-500 mb-1">Country</p>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-[#0F172A]">{profile?.country || 'Not set'}</span>
              </div>
            </div>

            {/* University */}
            <div className="px-4 py-3 bg-gray-50 rounded-lg border border-[#E5E7EB]">
              <p className="text-xs text-gray-500 mb-1">University</p>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                </svg>
                <span className="text-[#0F172A]">{profile?.university || 'Not set'}</span>
              </div>
            </div>

            {/* Course of Study */}
            <div className="px-4 py-3 bg-gray-50 rounded-lg border border-[#E5E7EB]">
              <p className="text-xs text-gray-500 mb-1">Course of Study</p>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <span className="text-[#0F172A]">{profile?.course_of_study || 'Not set'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Account Section */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden mb-6">
          <div className="px-4 sm:px-6 py-4 border-b border-[#E5E7EB] bg-gradient-to-r from-emerald-50 to-violet-50">
            <h2 className="text-lg font-semibold text-[#0F172A]">{t('settings.account')}</h2>
          </div>

          <div className="p-4 sm:p-6 space-y-6">
            {/* Email Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('settings.email')}
              </label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg border border-[#E5E7EB]">
                <span className="text-[#0F172A]">{userEmail}</span>
              </div>
            </div>

            {/* Language Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('settings.language')}
              </label>
              <div className="relative">
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="w-full px-4 py-3 bg-white rounded-lg border border-[#E5E7EB] appearance-none cursor-pointer
                           focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
                           hover:border-violet-300 transition-colors"
                >
                  {(Object.keys(languageNames) as Language[]).map((lang) => (
                    <option key={lang} value={lang}>
                      {languageNames[lang]}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                {t('settings.selectLanguage')}
              </p>
            </div>
          </div>
        </div>

        {/* Logout Section */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="p-4 sm:p-6">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium text-red-600 border-2 border-red-300 hover:bg-red-50 hover:border-red-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              {t('nav.logout')}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
