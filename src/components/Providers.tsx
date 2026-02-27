'use client';

import { ReactNode, Suspense } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';
import PostHogProvider from '@/components/PostHogProvider';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <PostHogProvider>
        <LanguageProvider>{children}</LanguageProvider>
      </PostHogProvider>
    </Suspense>
  );
}
