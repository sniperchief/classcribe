import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reset Password - Classcribe',
  description: 'Create a new password for your Classcribe account.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
