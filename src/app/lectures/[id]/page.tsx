'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import type { Lecture } from '@/lib/types';

type Flashcard = {
  front: string;
  back: string;
};

// Check if notes are in old Cornell format
function isOldCornellFormat(notes: string): boolean {
  return notes.includes(':::cornell') && notes.includes('::cue') && notes.includes('::note');
}

// Convert old Cornell format to plain format for display
function convertCornellToPlain(notes: string): string {
  const titleMatch = notes.match(/^#\s+(.+)$/m);
  const title = titleMatch ? `# ${titleMatch[1]}\n\n` : '';

  const cornellMatch = notes.match(/:::cornell\n([\s\S]*?):::/);
  let plainContent = '';

  if (cornellMatch) {
    const cornellContent = cornellMatch[1];
    const pairs = cornellContent.split('::cue').filter(Boolean);

    for (const pair of pairs) {
      const parts = pair.split('::note');
      if (parts.length === 2) {
        const cue = parts[0].trim();
        const note = parts[1].trim();
        plainContent += `## ${cue}\n\n${note}\n\n`;
      }
    }
  }

  const afterCornell = notes.split(':::').slice(-1)[0] || '';
  const otherContent = afterCornell.replace(/^#\s+.+$/m, '').trim();

  return title + plainContent + otherContent;
}

function processNotes(notes: string): string {
  if (isOldCornellFormat(notes)) {
    return convertCornellToPlain(notes);
  }
  return notes;
}

// Flashcard Component with flip animation
function FlashcardViewer({ flashcards }: { flashcards: Flashcard[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = flashcards[currentIndex];

  const goToPrevious = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev === 0 ? flashcards.length - 1 : prev - 1));
  };

  const goToNext = () => {
    setIsFlipped(false);
    setCurrentIndex((prev) => (prev === flashcards.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="w-full">
      {/* Card counter */}
      <div className="text-center mb-4">
        <span className="text-sm text-gray-500">
          Card {currentIndex + 1} of {flashcards.length}
        </span>
      </div>

      {/* Flashcard */}
      <div
        className="relative w-full h-64 sm:h-80 cursor-pointer perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div
          className={`absolute inset-0 w-full h-full transition-transform duration-500 transform-style-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 w-full h-full bg-gradient-to-br from-[#A855F7] to-[#7C3AED] rounded-2xl p-6 flex flex-col items-center justify-center text-white backface-hidden"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p className="text-xs uppercase tracking-wider mb-4 opacity-70">Question</p>
            <p className="text-lg sm:text-xl font-medium text-center leading-relaxed">
              {currentCard.front}
            </p>
            <p className="absolute bottom-4 text-xs opacity-50">Tap to flip</p>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 w-full h-full bg-white border-2 border-[#A855F7] rounded-2xl p-6 flex flex-col items-center justify-center backface-hidden"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <p className="text-xs uppercase tracking-wider mb-4 text-[#A855F7]">Answer</p>
            <p className="text-base sm:text-lg text-gray-700 text-center leading-relaxed">
              {currentCard.back}
            </p>
            <p className="absolute bottom-4 text-xs text-gray-400">Tap to flip</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={goToPrevious}
          className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Previous card"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {flashcards.map((_, index) => (
            <button
              key={index}
              onClick={() => {
                setIsFlipped(false);
                setCurrentIndex(index);
              }}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-[#A855F7]' : 'bg-gray-300 hover:bg-gray-400'
              }`}
              aria-label={`Go to card ${index + 1}`}
            />
          ))}
        </div>

        <button
          onClick={goToNext}
          className="p-3 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          aria-label="Next card"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Keyboard hint */}
      <p className="text-center text-xs text-gray-400 mt-4">
        Click card to flip • Use arrows to navigate
      </p>
    </div>
  );
}

export default function LecturePage() {
  const params = useParams();
  const router = useRouter();
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'notes' | 'transcript'>('notes');
  const [deleting, setDeleting] = useState(false);

  // Flashcard states
  const [isPaidUser, setIsPaidUser] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[] | null>(null);
  const [flashcardsLoading, setFlashcardsLoading] = useState(false);
  const [flashcardsError, setFlashcardsError] = useState<string | null>(null);
  const [showFlashcards, setShowFlashcards] = useState(false);

  useEffect(() => {
    const fetchLecture = async () => {
      const response = await fetch(`/api/lectures/${params.id}`);
      const data = await response.json();
      if (data.lecture) {
        setLecture(data.lecture);
        // Check if flashcards already exist
        if (data.lecture.flashcards) {
          setFlashcards(data.lecture.flashcards);
        }
      }
      setLoading(false);
    };

    const checkSubscription = async () => {
      try {
        const response = await fetch('/api/subscription');
        const data = await response.json();
        if (data.subscription?.plan === 'student' && data.subscription?.isActive) {
          setIsPaidUser(true);
        }
      } catch {
        // Not a paid user
      }
    };

    fetchLecture();
    checkSubscription();
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this lecture?')) return;

    setDeleting(true);
    const response = await fetch(`/api/lectures/${params.id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      router.push('/dashboard');
    } else {
      setDeleting(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    setFlashcardsLoading(true);
    setFlashcardsError(null);

    try {
      const response = await fetch(`/api/lectures/${params.id}/flashcards`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate flashcards');
      }

      setFlashcards(data.flashcards);
      setShowFlashcards(true);
    } catch (error) {
      setFlashcardsError(error instanceof Error ? error.message : 'Failed to generate flashcards');
    } finally {
      setFlashcardsLoading(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-[#A855F7] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading lecture...</p>
        </div>
      </main>
    );
  }

  if (!lecture) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[#0F172A] mb-2">Lecture not found</h2>
          <p className="text-gray-500 mb-6">This lecture may have been deleted or does not exist.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#A855F7] text-white rounded-lg hover:bg-[#9333EA] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14">
            {/* Left Side */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 text-gray-500 hover:text-[#0F172A] hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
                aria-label="Go back"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <div className="min-w-0">
                <p className="text-sm text-gray-500">
                  {new Date(lecture.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Right Side - Tabs and Delete */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                  ${activeTab === 'notes'
                    ? 'bg-[#A855F7] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                Notes
              </button>
              <button
                onClick={() => setActiveTab('transcript')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
                  ${activeTab === 'transcript'
                    ? 'bg-[#A855F7] text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                  }`}
              >
                Transcript
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                aria-label="Delete lecture"
              >
                {deleting ? (
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {activeTab === 'notes' ? (
          <div className="max-w-4xl mx-auto">
            {lecture.notes ? (
              <article className="notes-content">
                <ReactMarkdown
                  components={{
                    h1: ({children}) => (
                      <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] text-center mb-8 pb-4 border-b border-gray-100">
                        {children}
                      </h1>
                    ),
                    h2: ({children}) => (
                      <h2 className="text-xl sm:text-2xl font-semibold text-[#0F172A] text-center mt-10 mb-6">
                        {children}
                      </h2>
                    ),
                    h3: ({children}) => (
                      <h3 className="text-lg font-semibold text-[#0F172A] text-center mt-8 mb-4">
                        {children}
                      </h3>
                    ),
                    p: ({children}) => (
                      <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-4">
                        {children}
                      </p>
                    ),
                    strong: ({children}) => (
                      <strong className="font-semibold text-[#A855F7]">
                        {children}
                      </strong>
                    ),
                    ul: ({children}) => (
                      <ul className="space-y-2 mb-6 ml-4">
                        {children}
                      </ul>
                    ),
                    ol: ({children}) => (
                      <ol className="space-y-2 mb-6 ml-4 list-decimal list-inside">
                        {children}
                      </ol>
                    ),
                    li: ({children}) => (
                      <li className="text-gray-700 text-base sm:text-lg leading-relaxed flex items-start gap-2">
                        <span className="text-[#A855F7] mt-2 flex-shrink-0">•</span>
                        <span>{children}</span>
                      </li>
                    ),
                    hr: () => (
                      <hr className="my-8 border-gray-100" />
                    ),
                    blockquote: ({children}) => (
                      <blockquote className="border-l-4 border-[#A855F7] pl-4 my-6 text-gray-600 italic">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {processNotes(lecture.notes)}
                </ReactMarkdown>
              </article>
            ) : (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500">No notes available yet</p>
              </div>
            )}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            {lecture.transcript ? (
              <div className="text-gray-600 text-base sm:text-lg leading-relaxed whitespace-pre-wrap">
                {lecture.transcript}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <p className="text-gray-500">No transcript available yet</p>
              </div>
            )}
          </div>
        )}

        {/* Audio Player */}
        {lecture.audio_url && (
          <div className="max-w-4xl mx-auto mt-8 pt-8 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-[#A855F7]/10 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-[#A855F7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                </svg>
              </div>
              <div>
                <h3 className="font-medium text-[#0F172A]">Audio Recording</h3>
                <p className="text-sm text-gray-500">Original lecture audio</p>
              </div>
            </div>
            <audio
              controls
              className="w-full h-12 rounded-lg"
              style={{ outline: 'none' }}
            >
              <source src={lecture.audio_url} />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {/* Flashcards Section */}
        {lecture.notes && (
          <div className="max-w-4xl mx-auto mt-8 pt-8 border-t border-gray-100">
            <div className="text-center">
              {/* Section Header */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#A855F7]/10 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#A855F7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-medium text-[#0F172A]">Study Flashcards</h3>
                  <p className="text-sm text-gray-500">15 cards to help you memorize key concepts</p>
                </div>
              </div>

              {/* Flashcards Content */}
              {showFlashcards && flashcards ? (
                <div className="mt-6">
                  <FlashcardViewer flashcards={flashcards} />
                  <button
                    onClick={() => setShowFlashcards(false)}
                    className="mt-6 text-sm text-gray-500 hover:text-[#A855F7] transition-colors"
                  >
                    Hide Flashcards
                  </button>
                </div>
              ) : flashcards ? (
                <button
                  onClick={() => setShowFlashcards(true)}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#A855F7] text-white rounded-lg hover:bg-[#9333EA] transition-colors font-medium"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Flashcards
                </button>
              ) : (
                <div>
                  {flashcardsError && (
                    <p className="text-red-500 text-sm mb-4">{flashcardsError}</p>
                  )}
                  <button
                    onClick={handleGenerateFlashcards}
                    disabled={flashcardsLoading}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#A855F7] text-white rounded-lg hover:bg-[#9333EA] transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {flashcardsLoading ? (
                      <>
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating Flashcards...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Generate Flashcards
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Back to Dashboard Link */}
        <div className="max-w-4xl mx-auto mt-8 text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#A855F7] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to all lectures
          </Link>
        </div>
      </div>
    </main>
  );
}
