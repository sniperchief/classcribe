'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import dynamic from 'next/dynamic';
import type { Material } from '@/lib/types';
import MCQViewer from '@/components/MCQViewer';
import QuizViewer from '@/components/QuizViewer';

const ShareModal = dynamic(() => import('@/components/ShareModal'), { ssr: false });

// Flashcard component
function FlashcardViewer({ flashcards }: { flashcards: { front: string; back: string }[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev + 1) % flashcards.length), 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length), 150);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="text-center mb-6">
        <span className="text-sm text-gray-500">
          Card {currentIndex + 1} of {flashcards.length}
        </span>
        <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / flashcards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Card */}
      <div
        onClick={() => setIsFlipped(!isFlipped)}
        className="relative h-64 sm:h-80 cursor-pointer perspective-1000"
      >
        <div
          className={`absolute inset-0 transition-transform duration-500 transform-style-preserve-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden bg-white border-2 border-emerald-200 rounded-2xl shadow-lg flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-xs text-emerald-500 font-medium uppercase tracking-wide mb-4">Question</p>
              <p className="text-lg sm:text-xl text-gray-800 font-medium">{flashcards[currentIndex].front}</p>
            </div>
          </div>
          {/* Back */}
          <div className="absolute inset-0 backface-hidden rotate-y-180 bg-emerald-50 border-2 border-emerald-300 rounded-2xl shadow-lg flex items-center justify-center p-8">
            <div className="text-center">
              <p className="text-xs text-emerald-600 font-medium uppercase tracking-wide mb-4">Answer</p>
              <p className="text-lg sm:text-xl text-gray-800">{flashcards[currentIndex].back}</p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-sm text-gray-400 mt-4">Click the card to flip</p>

      {/* Navigation */}
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={prevCard}
          className="p-3 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={nextCard}
          className="p-3 bg-emerald-500 hover:bg-emerald-600 rounded-full transition-colors"
        >
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function MaterialPage() {
  const params = useParams();
  const router = useRouter();
  const [material, setMaterial] = useState<Material | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    const fetchMaterial = async () => {
      const response = await fetch(`/api/docs/${params.id}`);
      const data = await response.json();
      if (data.material) {
        setMaterial(data.material);
      }
      setLoading(false);
    };

    fetchMaterial();
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this material?')) return;

    setDeleting(true);
    const response = await fetch(`/api/docs/${params.id}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      router.push('/dashboard');
    } else {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">Loading material...</p>
        </div>
      </main>
    );
  }

  if (!material) {
    return (
      <main className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[#0F172A] mb-2">Material not found</h2>
          <p className="text-gray-500 mb-6">This material may have been deleted or does not exist.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
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
                  {new Date(material.created_at).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 uppercase">
                {material.file_type}
              </span>
              {material.output_type && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 capitalize">
                  {material.output_type === 'mcqs' ? 'MCQs' : material.output_type}
                </span>
              )}
              {/* Share Button */}
              {material.status === 'completed' && (
                <button
                  onClick={() => setShowShareModal(true)}
                  className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                  aria-label="Share material"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                </button>
              )}
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                aria-label="Delete material"
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
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] text-center mb-8 pb-4 border-b border-gray-100">
            {material.title}
          </h1>

          {/* Flashcards Output */}
          {material.output_type === 'flashcards' && material.flashcards && material.flashcards.length > 0 ? (
            <FlashcardViewer flashcards={material.flashcards} />
          ) : /* MCQs Output */
          material.output_type === 'mcqs' && material.mcqs && material.mcqs.length > 0 ? (
            <MCQViewer mcqs={material.mcqs} materialId={material.id} />
          ) : /* Quiz Output */
          material.output_type === 'quiz' && material.quiz && material.quiz.length > 0 ? (
            <QuizViewer quiz={material.quiz} materialId={material.id} />
          ) : /* Summary Output */
          material.generated_content ? (
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
                    <strong className="font-semibold text-emerald-600">
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
                      <span className="text-emerald-500 mt-2 flex-shrink-0">•</span>
                      <span>{children}</span>
                    </li>
                  ),
                  hr: () => (
                    <hr className="my-8 border-gray-100" />
                  ),
                  blockquote: ({children}) => (
                    <blockquote className="border-l-4 border-emerald-500 pl-4 my-6 text-gray-600 italic">
                      {children}
                    </blockquote>
                  ),
                }}
              >
                {material.generated_content}
              </ReactMarkdown>
            </article>
          ) : (
            <div className="text-center py-12">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-gray-500">No content available yet</p>
              {material.status === 'processing' || material.status === 'generating' ? (
                <p className="text-sm text-gray-400 mt-2">Processing in progress...</p>
              ) : material.status === 'failed' ? (
                <p className="text-sm text-red-500 mt-2">{material.error_message || 'Processing failed'}</p>
              ) : material.status === 'uploading' ? (
                <p className="text-sm text-gray-400 mt-2">Waiting to be processed...</p>
              ) : null}
            </div>
          )}
        </div>

        {/* Original File Link */}
        {material.file_url && (
          <div className="max-w-4xl mx-auto mt-8 pt-8 border-t border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-[#0F172A]">Original Document</h3>
                <p className="text-sm text-gray-500">{material.title}.{material.file_type}</p>
              </div>
              <a
                href={material.file_url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium"
              >
                View Original
              </a>
            </div>
          </div>
        )}

        {/* Back to Dashboard Link */}
        <div className="max-w-4xl mx-auto mt-8 text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-emerald-500 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to all materials
          </Link>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        materialId={params.id as string}
        materialTitle={material.title}
      />
    </main>
  );
}
