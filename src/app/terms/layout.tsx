import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service - Classcribe',
  description: 'Read the terms and conditions for using Classcribe. Understand your rights and responsibilities.',
};

export default function TermsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
