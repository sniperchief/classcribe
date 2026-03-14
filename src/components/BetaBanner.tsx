'use client';

import { useState, useEffect } from 'react';

export default function BetaBanner() {
  const [dismissed, setDismissed] = useState(true); // Start hidden to avoid flash

  useEffect(() => {
    const isDismissed = localStorage.getItem('beta_banner_dismissed');
    setDismissed(isDismissed === 'true');
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('beta_banner_dismissed', 'true');
  };

  if (dismissed) return null;

  return (
    <div className="bg-[#A855F7] text-white text-center py-2 px-4 text-sm relative">
      <span>
        We&apos;re in beta! Share your feedback at{' '}
        <a
          href="mailto:support@classcribe.app"
          className="underline font-medium hover:text-white/90"
        >
          support@classcribe.app
        </a>
      </span>
      <button
        onClick={handleDismiss}
        className="absolute right-4 top-1/2 -translate-y-1/2 hover:text-white/80 transition-colors"
        aria-label="Dismiss banner"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
