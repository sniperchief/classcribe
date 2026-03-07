import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - Classcribe',
  description: 'Your Classcribe dashboard. Upload lectures, manage study materials, and track your progress.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
