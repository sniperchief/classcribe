import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy - Classcribe',
  description: 'Learn how Classcribe protects your data and privacy. Read our privacy policy.',
};

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
