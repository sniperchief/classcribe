import {
  Navbar,
  Hero,
  Problem,
  HowItWorks,
  Features,
  Testimonials,
  FinalCTA,
  Footer,
} from '@/components/landing';
import type { Metadata } from 'next';

// Force static generation for the landing page
export const dynamic = 'force-static';
export const revalidate = 3600; // Revalidate every hour

export const metadata: Metadata = {
  title: 'Classcribe - Transform Lectures into Study-Ready Notes',
  description: 'Upload your lecture recordings and get AI-powered, structured notes in minutes. Perfect for students who want to ace their exams.',
  openGraph: {
    title: 'Classcribe - Transform Lectures into Study-Ready Notes',
    description: 'Upload your lecture recordings and get AI-powered, structured notes in minutes.',
    type: 'website',
  },
};

export default function Home() {
  return (
    <div className="w-full overflow-x-hidden">
      <Navbar />
      <main className="overflow-x-hidden">
        <Hero />
        <Problem />
        <HowItWorks />
        <Features />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}
