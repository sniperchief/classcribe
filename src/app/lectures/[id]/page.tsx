'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import type { Lecture } from '@/lib/types';

// Check if notes are in old Cornell format
function isOldCornellFormat(notes: string): boolean {
  return notes.includes(':::cornell') && notes.includes('::cue') && notes.includes('::note');
}

// Convert old Cornell format to plain format for display
function convertCornellToPlain(notes: string): string {
  // Extract title
  const titleMatch = notes.match(/^#\s+(.+)$/m);
  const title = titleMatch ? `# ${titleMatch[1]}\n\n` : '';

  // Extract Cornell section and convert to plain format
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
        // Convert cue to a heading and note to content
        plainContent += `## ${cue}\n\n${note}\n\n`;
      }
    }
  }

  // Get content after Cornell section (Summary, Practice Questions, etc.)
  const afterCornell = notes.split(':::').slice(-1)[0] || '';
  const otherContent = afterCornell.replace(/^#\s+.+$/m, '').trim();

  return title + plainContent + otherContent;
}

// Process notes - convert old format if needed
function processNotes(notes: string): string {
  if (isOldCornellFormat(notes)) {
    return convertCornellToPlain(notes);
  }
  return notes;
}

export default function LecturePage() {
  const params = useParams();
  const router = useRouter();
  const [lecture, setLecture] = useState<Lecture | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'notes' | 'transcript'>('notes');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const fetchLecture = async () => {
      const response = await fetch(`/api/lectures/${params.id}`);
      const data = await response.json();
      if (data.lecture) {
        setLecture(data.lecture);
      }
      setLoading(false);
    };

    fetchLecture();
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
                    // Main title - centered, large
                    h1: ({children}) => (
                      <h1 className="text-2xl sm:text-3xl font-bold text-[#0F172A] text-center mb-8 pb-4 border-b border-gray-100">
                        {children}
                      </h1>
                    ),
                    // Section headings - centered, violet
                    h2: ({children}) => (
                      <h2 className="text-xl sm:text-2xl font-semibold text-[#0F172A] text-center mt-10 mb-6">
                        {children}
                      </h2>
                    ),
                    // Sub-headings
                    h3: ({children}) => (
                      <h3 className="text-lg font-semibold text-[#0F172A] text-center mt-8 mb-4">
                        {children}
                      </h3>
                    ),
                    // Paragraphs - clean, readable
                    p: ({children}) => (
                      <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-4">
                        {children}
                      </p>
                    ),
                    // Bold text - violet color for keywords
                    strong: ({children}) => (
                      <strong className="font-semibold text-[#A855F7]">
                        {children}
                      </strong>
                    ),
                    // Unordered lists
                    ul: ({children}) => (
                      <ul className="space-y-2 mb-6 ml-4">
                        {children}
                      </ul>
                    ),
                    // Ordered lists
                    ol: ({children}) => (
                      <ol className="space-y-2 mb-6 ml-4 list-decimal list-inside">
                        {children}
                      </ol>
                    ),
                    // List items
                    li: ({children}) => (
                      <li className="text-gray-700 text-base sm:text-lg leading-relaxed flex items-start gap-2">
                        <span className="text-[#A855F7] mt-2 flex-shrink-0">•</span>
                        <span>{children}</span>
                      </li>
                    ),
                    // Horizontal rules
                    hr: () => (
                      <hr className="my-8 border-gray-100" />
                    ),
                    // Blockquotes
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
