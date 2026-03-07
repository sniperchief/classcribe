import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Classcribe',
  description: 'Sign in to your Classcribe account. Access your study materials, flashcards, and quizzes.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
