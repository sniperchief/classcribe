'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Currency = 'NGN' | 'USD';

type UpgradeModalProps = {
  isOpen: boolean;
  onClose: () => void;
  lecturesUsed: number;
  lectureLimit: number;
};

export default function UpgradeModal({ isOpen, onClose, lecturesUsed, lectureLimit }: UpgradeModalProps) {
  const [currency, setCurrency] = useState<Currency>('USD');

  useEffect(() => {
    const detectLocation = async () => {
      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data.country_code === 'NG') {
          setCurrency('NGN');
        }
      } catch {
        // Default to USD
      }
    };

    if (isOpen) {
      detectLocation();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const price = currency === 'NGN' ? '₦2,500' : '$6';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8">
        {/* Icon */}
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A] mb-2">
            You&apos;ve used your free lectures this month
          </h2>
          <p className="text-gray-500">
            You&apos;ve processed {lecturesUsed} of {lectureLimit} lectures available on the free plan.
            Upgrade to continue generating notes.
          </p>
        </div>

        {/* Usage Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-600">Lectures used</span>
            <span className="font-medium text-[#0F172A]">{lecturesUsed}/{lectureLimit}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-yellow-500 rounded-full"
              style={{ width: '100%' }}
            />
          </div>
        </div>

        {/* Student Plan Highlight */}
        <div className="bg-[#2563EB]/5 border border-[#2563EB]/20 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between mb-3">
            <span className="font-semibold text-[#0F172A]">Student Plan</span>
            <span className="text-[#2563EB] font-bold">{price}/month</span>
          </div>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              20 lectures per month
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              PDF export
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Priority processing
            </li>
            <li className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              Advanced formatting
            </li>
          </ul>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <Link
            href="/pricing"
            className="block w-full py-3 bg-[#2563EB] text-white rounded-lg font-medium text-center hover:bg-[#1d4ed8] transition-colors"
          >
            Upgrade Now
          </Link>
          <button
            onClick={onClose}
            className="w-full py-3 border border-[#E5E7EB] text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Maybe Later
          </button>
        </div>

        {/* Reset Info */}
        <p className="text-center text-xs text-gray-400 mt-4">
          Your free lectures will reset at the start of next month.
        </p>
      </div>
    </div>
  );
}
