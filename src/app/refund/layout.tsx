import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Refund Policy - Classcribe',
  description: 'Learn about our refund policy and how to request a refund for Classcribe subscriptions.',
};

export default function RefundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
