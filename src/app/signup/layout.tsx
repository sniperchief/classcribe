import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - Classcribe',
  description: 'Create your free Classcribe account. Start turning lectures and notes into exam-ready study materials today.',
  openGraph: {
    title: 'Sign Up - Classcribe',
    description: 'Create your free account and start acing your exams with smart study materials.',
    type: 'website',
  },
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
