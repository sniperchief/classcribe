'use client';

import { ReactNode, Suspense } from 'react';
import { LanguageProvider } from '@/contexts/LanguageContext';

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <LanguageProvider>{children}</LanguageProvider>
    </Suspense>
  );
}
