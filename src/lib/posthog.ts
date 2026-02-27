import posthog from 'posthog-js';

export const POSTHOG_KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY || '';
export const POSTHOG_HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com';

export function initPostHog() {
  if (typeof window !== 'undefined' && POSTHOG_KEY) {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      capture_pageview: false, // We'll capture manually for better control
      capture_pageleave: true,
      persistence: 'localStorage',
    });
  }
}

export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && POSTHOG_KEY) {
    posthog.identify(userId, properties);
  }
}

export function trackEvent(eventName: string, properties?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && POSTHOG_KEY) {
    posthog.capture(eventName, properties);
  }
}

export function resetUser() {
  if (typeof window !== 'undefined' && POSTHOG_KEY) {
    posthog.reset();
  }
}

export default posthog;
