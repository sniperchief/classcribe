import {
  Navbar,
  Hero,
  Problem,
  HowItWorks,
  Stats,
  Testimonials,
  Pricing,
  FinalCTA,
  Footer,
} from '@/components/landing';
import BetaBanner from '@/components/BetaBanner';
import type { Metadata } from 'next';

// Force static generation for the landing page
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export const metadata: Metadata = {
  title: 'Classcribe - Score A\'s Without the All-Nighters',
  description: 'Turn any lecture, PDF, or notes into exam-ready flashcards, quizzes, and summaries instantly. The smart way to study and ace your exams.',
  openGraph: {
    title: 'Classcribe - Score A\'s Without the All-Nighters',
    description: 'Turn any lecture, PDF, or notes into exam-ready flashcards, quizzes, and summaries instantly. Study smarter, not harder.',
    type: 'website',
  },
};

export default function Home() {
  return (
    <div className="w-full overflow-x-hidden">
      <BetaBanner />
      <Navbar />
      <main className="overflow-x-hidden">
        <Hero />
        <HowItWorks />
        <Stats />
        <Problem />
        <Testimonials />
        <Pricing />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
