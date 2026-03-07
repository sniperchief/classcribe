import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - Classcribe',
  description: 'Choose the perfect plan for your study needs. Start free and upgrade when you need more. Affordable pricing for students.',
  openGraph: {
    title: 'Pricing - Classcribe',
    description: 'Choose the perfect plan for your study needs. Start free and upgrade when you need more.',
    type: 'website',
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
