'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface SharedContent {
  title: string;
  outputType: string;
  createdAt: string;
  isAuthenticated: boolean;
  isPreview: boolean;
  totalCount: number;
  previewCount: number;
  flashcards?: { front: string; back: string }[];
  mcqs?: Array<{
    question: string;
    options: { label: string; text: string }[];
    correctAnswer: string;
    explanation: string;
  }>;
  quiz?: Array<{
    statement: string;
    correctAnswer: boolean;
    explanation: string;
  }>;
  summary?: string;
}

export default function SharedContentPage() {
  const params = useParams();
  const code = params.code as string;

  const [content, setContent] = useState<SharedContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    fetch(`/api/share/${code}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setContent(data);
        }
      })
      .catch(() => setError('Failed to load content'))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading shared content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-[#0F172A] mb-2">{error}</h1>
          <p className="text-gray-500 mb-6">This share link may have expired or been removed.</p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
          >
            Go to Classcribe
          </Link>
        </div>
      </div>
    );
  }

  if (!content) return null;

  const outputTypeLabels: Record<string, string> = {
    flashcards: 'Flashcards',
    mcqs: 'Multiple Choice Questions',
    quiz: 'True/False Quiz',
    summary: 'Summary',
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#A855F7] rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-xl font-semibold text-[#0F172A]">Classcribe</span>
          </Link>
          {!content.isAuthenticated && (
            <Link
              href="/signup"
              className="px-4 py-2 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors text-sm"
            >
              Sign Up Free
            </Link>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Title */}
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium mb-3">
            {outputTypeLabels[content.outputType]}
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-2">{content.title}</h1>
          <p className="text-gray-500">
            Shared via Classcribe
          </p>
        </div>

        {/* Preview Banner */}
        {content.isPreview && (
          <div className="bg-gradient-to-r from-purple-50 to-emerald-50 border border-purple-200 rounded-xl p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-[#0F172A] mb-1">
                  Preview Mode - {content.previewCount} of {content.totalCount} items
                </h3>
                <p className="text-gray-600 text-sm">
                  Sign up for free to see all {content.totalCount} {content.outputType} and create your own study materials!
                </p>
              </div>
              <Link
                href="/signup"
                className="px-5 py-2.5 bg-[#A855F7] text-white rounded-lg font-medium hover:bg-[#9333EA] transition-colors whitespace-nowrap"
              >
                Sign Up to See All
              </Link>
            </div>
          </div>
        )}

        {/* Flashcards */}
        {content.outputType === 'flashcards' && content.flashcards && (
          <div className="space-y-6">
            {/* Flashcard Display */}
            <div
              onClick={() => setFlipped(!flipped)}
              className="bg-white rounded-2xl shadow-lg border border-[#E5E7EB] p-8 min-h-[300px] flex items-center justify-center cursor-pointer hover:shadow-xl transition-shadow"
            >
              <div className="text-center">
                <p className="text-xs text-gray-400 uppercase tracking-wide mb-4">
                  {flipped ? 'Answer' : 'Question'} • Card {currentCard + 1} of {content.flashcards.length}
                </p>
                <p className="text-xl sm:text-2xl font-medium text-[#0F172A]">
                  {flipped ? content.flashcards[currentCard].back : content.flashcards[currentCard].front}
                </p>
                <p className="text-sm text-gray-400 mt-6">Click to flip</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={() => { setCurrentCard(Math.max(0, currentCard - 1)); setFlipped(false); }}
                disabled={currentCard === 0}
                className="p-3 rounded-full bg-white border border-[#E5E7EB] disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-gray-500">
                {currentCard + 1} / {content.flashcards.length}
              </span>
              <button
                onClick={() => { setCurrentCard(Math.min(content.flashcards!.length - 1, currentCard + 1)); setFlipped(false); }}
                disabled={currentCard === content.flashcards.length - 1}
                className="p-3 rounded-full bg-white border border-[#E5E7EB] disabled:opacity-50 hover:bg-gray-50 transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* MCQs */}
        {content.outputType === 'mcqs' && content.mcqs && (
          <div className="bg-white rounded-2xl shadow-lg border border-[#E5E7EB] p-6 sm:p-8">
            <p className="text-sm text-gray-400 mb-4">
              Question {currentQuestion + 1} of {content.mcqs.length}
            </p>
            <h2 className="text-xl font-semibold text-[#0F172A] mb-6">
              {content.mcqs[currentQuestion].question}
            </h2>

            <div className="space-y-3 mb-6">
              {content.mcqs[currentQuestion].options.map((option) => (
                <button
                  key={option.label}
                  onClick={() => { setSelectedAnswer(option.label); setShowExplanation(true); }}
                  disabled={showExplanation}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3
                    ${showExplanation
                      ? option.label === content.mcqs![currentQuestion].correctAnswer
                        ? 'border-green-500 bg-green-50'
                        : option.label === selectedAnswer
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200'
                      : selectedAnswer === option.label
                      ? 'border-emerald-500 bg-emerald-50'
                      : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-medium text-sm
                    ${showExplanation && option.label === content.mcqs![currentQuestion].correctAnswer
                      ? 'bg-green-500 text-white'
                      : showExplanation && option.label === selectedAnswer
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-100 text-gray-600'
                    }`}>
                    {option.label}
                  </span>
                  <span className="flex-1">{option.text}</span>
                </button>
              ))}
            </div>

            {showExplanation && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Explanation:</strong> {content.mcqs[currentQuestion].explanation}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                onClick={() => { setCurrentQuestion(Math.max(0, currentQuestion - 1)); setSelectedAnswer(null); setShowExplanation(false); }}
                disabled={currentQuestion === 0}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                ← Previous
              </button>
              <button
                onClick={() => { setCurrentQuestion(Math.min(content.mcqs!.length - 1, currentQuestion + 1)); setSelectedAnswer(null); setShowExplanation(false); }}
                disabled={currentQuestion === content.mcqs.length - 1}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Quiz (True/False) */}
        {content.outputType === 'quiz' && content.quiz && (
          <div className="bg-white rounded-2xl shadow-lg border border-[#E5E7EB] p-6 sm:p-8">
            <p className="text-sm text-gray-400 mb-4">
              Question {currentQuestion + 1} of {content.quiz.length}
            </p>
            <h2 className="text-xl font-semibold text-[#0F172A] mb-6">
              {content.quiz[currentQuestion].statement}
            </h2>

            <div className="flex gap-4 mb-6">
              {['True', 'False'].map((answer) => (
                <button
                  key={answer}
                  onClick={() => { setSelectedAnswer(answer); setShowExplanation(true); }}
                  disabled={showExplanation}
                  className={`flex-1 p-4 rounded-xl border-2 font-medium transition-all
                    ${showExplanation
                      ? (answer === 'True') === content.quiz![currentQuestion].correctAnswer
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : selectedAnswer === answer
                        ? 'border-red-500 bg-red-50 text-red-700'
                        : 'border-gray-200 text-gray-400'
                      : selectedAnswer === answer
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 hover:border-gray-300'
                    }`}
                >
                  {answer}
                </button>
              ))}
            </div>

            {showExplanation && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl mb-6">
                <p className="text-sm text-blue-800">
                  <strong>Explanation:</strong> {content.quiz[currentQuestion].explanation}
                </p>
              </div>
            )}

            <div className="flex items-center justify-between">
              <button
                onClick={() => { setCurrentQuestion(Math.max(0, currentQuestion - 1)); setSelectedAnswer(null); setShowExplanation(false); }}
                disabled={currentQuestion === 0}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
              >
                ← Previous
              </button>
              <button
                onClick={() => { setCurrentQuestion(Math.min(content.quiz!.length - 1, currentQuestion + 1)); setSelectedAnswer(null); setShowExplanation(false); }}
                disabled={currentQuestion === content.quiz.length - 1}
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Summary */}
        {content.outputType === 'summary' && content.summary && (
          <div className="bg-white rounded-2xl shadow-lg border border-[#E5E7EB] p-6 sm:p-8">
            <div className="prose prose-sm sm:prose max-w-none">
              <div dangerouslySetInnerHTML={{ __html: content.summary.replace(/\n/g, '<br/>') }} />
            </div>
            {content.isPreview && (
              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <p className="text-gray-500 mb-4">Sign up to see the full summary</p>
                <Link
                  href="/signup"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors"
                >
                  Sign Up Free
                </Link>
              </div>
            )}
          </div>
        )}

        {/* CTA Footer */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8">
            <h2 className="text-xl font-semibold text-[#0F172A] mb-2">
              Create Your Own Study Materials
            </h2>
            <p className="text-gray-500 mb-6">
              Turn any PDF, lecture, or document into flashcards, quizzes, and summaries in seconds.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#A855F7] text-white rounded-xl font-medium hover:bg-[#9333EA] transition-colors"
            >
              Get Started Free
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            <p className="text-xs text-gray-400 mt-4">
              No credit card required • 3 free materials
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5E7EB] mt-12 py-6">
        <div className="max-w-4xl mx-auto px-4 text-center text-sm text-gray-500">
          Made with Classcribe • <Link href="/" className="text-emerald-600 hover:underline">classcribe.app</Link>
        </div>
      </footer>
    </div>
  );
}
