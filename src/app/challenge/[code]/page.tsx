'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface MCQOption {
  label: string;
  text: string;
}

interface MCQ {
  question: string;
  options: MCQOption[];
  correctAnswer: string;
  explanation?: string;
}

interface TrueFalseQuestion {
  statement: string;
  correctAnswer: boolean;
  explanation?: string;
}

interface Flashcard {
  front: string;
  back: string;
}

interface LeaderboardEntry {
  id: string;
  user_id: string | null;
  guest_name: string | null;
  score: number;
  total_questions: number;
  percentage: number;
  completed_at: string;
}

interface ChallengeData {
  challenge: {
    id: string;
    shareCode: string;
    challengeType: 'mcqs' | 'quiz' | 'flashcards';
    creatorName: string;
    creatorScore: number | null;
    creatorTotal: number | null;
    createdAt: string;
  };
  material: {
    id: string;
    title: string;
  };
  content: MCQ[] | TrueFalseQuestion[] | Flashcard[];
  totalQuestions: number;
  isLimited: boolean;
  questionsShown: number;
  isAuthenticated: boolean;
  leaderboard: LeaderboardEntry[];
}

interface SavedProgress {
  answers: Record<number, string | boolean>;
  guestName: string;
  currentIndex: number;
  code: string;
}

const GUEST_QUESTION_LIMIT = 10;

export default function ChallengePage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState<ChallengeData | null>(null);
  const [guestName, setGuestName] = useState('');
  const [started, setStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | boolean | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [submittingScore, setSubmittingScore] = useState(false);
  const [finalRank, setFinalRank] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [answers, setAnswers] = useState<Record<number, string | boolean>>({});
  const [mustSignup, setMustSignup] = useState(false);
  const [restoredProgress, setRestoredProgress] = useState(false);

  // Check for saved progress on mount
  useEffect(() => {
    const savedProgressStr = sessionStorage.getItem(`challenge_progress_${code}`);
    if (savedProgressStr) {
      try {
        const savedProgress: SavedProgress = JSON.parse(savedProgressStr);
        if (savedProgress.code === code) {
          setAnswers(savedProgress.answers);
          setGuestName(savedProgress.guestName);
          setRestoredProgress(true);
        }
      } catch {
        // Invalid saved progress, ignore
      }
    }
  }, [code]);

  useEffect(() => {
    fetchChallenge();
  }, [code]);

  const fetchChallenge = async () => {
    try {
      const res = await fetch(`/api/challenges/${code}`);
      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Challenge not found');
        return;
      }

      setData(result);
      setLeaderboard(result.leaderboard || []);

      // If user is authenticated and has saved progress, restore and auto-start
      const savedProgressStr = sessionStorage.getItem(`challenge_progress_${code}`);
      if (savedProgressStr && result.isAuthenticated) {
        try {
          const savedProgress: SavedProgress = JSON.parse(savedProgressStr);
          if (savedProgress.code === code) {
            // Calculate score from saved answers
            let restoredScore = 0;
            const content = result.content;
            Object.entries(savedProgress.answers).forEach(([idx, answer]) => {
              const question = content[parseInt(idx)];
              if (result.challenge.challengeType === 'mcqs') {
                if (answer === (question as MCQ).correctAnswer) restoredScore++;
              } else if (result.challenge.challengeType === 'quiz') {
                if (answer === (question as TrueFalseQuestion).correctAnswer) restoredScore++;
              }
            });

            setAnswers(savedProgress.answers);
            setScore(restoredScore);
            setCurrentIndex(Object.keys(savedProgress.answers).length);
            setStarted(true);
            setRestoredProgress(true);

            // Clear saved progress now that user is authenticated
            sessionStorage.removeItem(`challenge_progress_${code}`);
          }
        } catch {
          // Invalid saved progress, ignore
        }
      }
    } catch {
      setError('Failed to load challenge');
    } finally {
      setLoading(false);
    }
  };

  const handleStart = () => {
    if (!data?.isAuthenticated && !guestName.trim()) {
      return;
    }
    setStarted(true);
  };

  const handleAnswer = (answer: string | boolean) => {
    if (showResult) return;
    setSelectedAnswer(answer);
  };

  const handleNext = () => {
    if (!data || selectedAnswer === null) return;

    const content = data.content;
    const currentQuestion = content[currentIndex];
    let isCorrect = false;

    if (data.challenge.challengeType === 'mcqs') {
      const mcq = currentQuestion as MCQ;
      isCorrect = selectedAnswer === mcq.correctAnswer;
    } else if (data.challenge.challengeType === 'quiz') {
      const quiz = currentQuestion as TrueFalseQuestion;
      isCorrect = selectedAnswer === quiz.correctAnswer;
    }

    // Save the answer
    const newAnswers = { ...answers, [currentIndex]: selectedAnswer };
    setAnswers(newAnswers);

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setShowResult(true);

    setTimeout(() => {
      const nextIndex = currentIndex + 1;
      const totalAnswered = Object.keys(newAnswers).length;

      // Check if guest has hit the limit (10 questions)
      if (!data.isAuthenticated && totalAnswered >= GUEST_QUESTION_LIMIT && data.totalQuestions > GUEST_QUESTION_LIMIT) {
        // Save progress to sessionStorage
        const progressToSave: SavedProgress = {
          answers: newAnswers,
          guestName,
          currentIndex: nextIndex,
          code,
        };
        sessionStorage.setItem(`challenge_progress_${code}`, JSON.stringify(progressToSave));
        setMustSignup(true);
        setShowResult(false);
        return;
      }

      if (nextIndex >= data.totalQuestions) {
        // All questions answered - calculate final score
        const finalScore = isCorrect ? score + 1 : score;
        handleComplete(finalScore);
      } else {
        setCurrentIndex(nextIndex);
        setSelectedAnswer(null);
        setShowResult(false);
      }
    }, 1500);
  };

  const handleComplete = async (finalScore: number) => {
    if (!data) return;

    setCompleted(true);
    setSubmittingScore(true);

    try {
      const res = await fetch(`/api/challenges/${code}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          score: finalScore,
          totalQuestions: data.totalQuestions,
          guestName: data.isAuthenticated ? null : guestName,
        }),
      });

      const result = await res.json();
      if (res.ok) {
        setFinalRank(result.rank);
        setLeaderboard(result.leaderboard || []);
      }
    } catch (err) {
      console.error('Failed to submit score:', err);
    } finally {
      setSubmittingScore(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-[#A855F7] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading challenge...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Challenge Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'This challenge may have expired or been deleted.'}</p>
          <Link href="/" className="text-[#A855F7] hover:underline">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // Pre-challenge screen
  if (!started) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-[#A855F7] rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Challenge Accepted!</h1>
            <p className="text-gray-600">
              <span className="font-semibold">{data.challenge.creatorName}</span> challenged you to a {data.challenge.challengeType === 'mcqs' ? 'MCQ' : data.challenge.challengeType} quiz
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="font-medium text-gray-800 mb-1">{data.material.title}</p>
            <p className="text-sm text-gray-600">
              {data.questionsShown} questions
              {data.isLimited && (
                <span className="text-[#A855F7]"> (Sign up to access all {data.totalQuestions})</span>
              )}
            </p>
            {data.challenge.creatorScore !== null && (
              <p className="text-sm text-gray-600 mt-2">
                {data.challenge.creatorName}&apos;s score: <span className="font-semibold">{data.challenge.creatorScore}/{data.challenge.creatorTotal}</span>
              </p>
            )}
          </div>

          {!data.isAuthenticated && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter your name
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Your name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A855F7]"
              />
            </div>
          )}

          <button
            onClick={handleStart}
            disabled={!data.isAuthenticated && !guestName.trim()}
            className="w-full py-3 bg-[#A855F7] text-white rounded-lg font-medium hover:bg-[#9333EA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Start Challenge
          </button>

          {/* Leaderboard Preview */}
          {leaderboard.length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Leaderboard</h3>
              <div className="space-y-2">
                {leaderboard.slice(0, 5).map((entry, index) => (
                  <div key={entry.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                        ${index === 0 ? 'bg-yellow-400 text-yellow-900' :
                          index === 1 ? 'bg-gray-300 text-gray-700' :
                          index === 2 ? 'bg-orange-300 text-orange-900' : 'bg-gray-100 text-gray-600'}`}>
                        {index + 1}
                      </span>
                      <span className="text-gray-800">{entry.guest_name || 'User'}</span>
                    </div>
                    <span className="font-medium text-gray-600">{entry.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Must signup screen - shown when guest hits 10 question limit
  if (mustSignup) {
    const answeredCount = Object.keys(answers).length;
    const remainingCount = data.totalQuestions - answeredCount;

    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-[#A855F7]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-[#A855F7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Great Progress!</h1>
            <p className="text-gray-600 mb-4">
              You&apos;ve answered <span className="font-semibold text-[#A855F7]">{answeredCount}</span> questions.
              Sign up to continue with the remaining <span className="font-semibold text-[#A855F7]">{remainingCount}</span> questions!
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Progress saved</span>
              <span className="text-green-600 font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {answeredCount} answers saved
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Your answers are saved. After signing up, you&apos;ll continue from where you left off.
            </p>
          </div>

          <div className="space-y-3">
            <Link
              href={`/signup?redirect=challenge/${code}`}
              className="block w-full py-3 bg-[#A855F7] text-white rounded-lg font-medium text-center hover:bg-[#9333EA] transition-colors"
            >
              Sign Up to Continue
            </Link>
            <Link
              href={`/login?redirect=challenge/${code}`}
              className="block w-full py-3 border border-gray-300 text-gray-700 rounded-lg font-medium text-center hover:bg-gray-50 transition-colors"
            >
              Already have an account? Log in
            </Link>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            Complete all questions to be scored and added to the leaderboard!
          </p>
        </div>
      </div>
    );
  }

  // Completed screen with scorecard
  if (completed) {
    const percentage = Math.round((score / data.totalQuestions) * 100);
    const passed = percentage >= 50;

    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 ${passed ? 'bg-green-100' : 'bg-red-100'}`}>
              {passed ? (
                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              {passed ? 'Congratulations!' : 'Good Effort!'}
            </h1>
            <p className="text-4xl font-bold text-[#A855F7] mb-2">{score}/{data.totalQuestions}</p>
            <p className="text-gray-600">{percentage}% correct</p>
            {finalRank && (
              <p className="text-sm text-gray-500 mt-2">
                You ranked <span className="font-semibold">#{finalRank}</span> on the leaderboard!
              </p>
            )}
          </div>

          {/* Leaderboard */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Leaderboard</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {leaderboard.map((entry, index) => (
                <div key={entry.id} className="flex items-center justify-between text-sm p-2 rounded-lg bg-gray-50">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                      ${index === 0 ? 'bg-yellow-400 text-yellow-900' :
                        index === 1 ? 'bg-gray-300 text-gray-700' :
                        index === 2 ? 'bg-orange-300 text-orange-900' : 'bg-gray-100 text-gray-600'}`}>
                      {index + 1}
                    </span>
                    <span className="text-gray-800">{entry.guest_name || 'User'}</span>
                  </div>
                  <span className="font-medium text-gray-600">{entry.score}/{entry.total_questions} ({entry.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => {
                setStarted(false);
                setCurrentIndex(0);
                setScore(0);
                setSelectedAnswer(null);
                setShowResult(false);
                setCompleted(false);
                setAnswers({});
                setMustSignup(false);
              }}
              className="w-full py-3 bg-[#A855F7] text-white rounded-lg font-medium hover:bg-[#9333EA] transition-colors"
            >
              Try Again
            </button>
            {!data.isAuthenticated && (
              <Link
                href="/signup"
                className="block w-full py-3 border border-[#A855F7] text-[#A855F7] rounded-lg font-medium text-center hover:bg-[#A855F7]/10 transition-colors"
              >
                Sign Up for Full Access
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Quiz in progress
  const currentQuestion = data.content[currentIndex];

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Question {currentIndex + 1} of {data.totalQuestions}</span>
            <span>Score: {score}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#A855F7] transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / data.totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          {data.challenge.challengeType === 'mcqs' && (
            <>
              <h2 className="text-lg font-medium text-gray-800 mb-6">
                {(currentQuestion as MCQ).question}
              </h2>
              <div className="space-y-3">
                {(currentQuestion as MCQ).options.map((option) => {
                  const isSelected = selectedAnswer === option.label;
                  const isCorrect = option.label === (currentQuestion as MCQ).correctAnswer;
                  const showCorrect = showResult && isCorrect;
                  const showWrong = showResult && isSelected && !isCorrect;

                  return (
                    <button
                      key={option.label}
                      onClick={() => handleAnswer(option.label)}
                      disabled={showResult}
                      className={`w-full p-4 text-left rounded-lg border-2 transition-all
                        ${showCorrect ? 'border-green-500 bg-green-50' :
                          showWrong ? 'border-red-500 bg-red-50' :
                          isSelected ? 'border-[#A855F7] bg-[#A855F7]/10' : 'border-gray-200 hover:border-[#A855F7]'}`}
                    >
                      <span className="font-medium">{option.label}.</span> {option.text}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {data.challenge.challengeType === 'quiz' && (
            <>
              <h2 className="text-lg font-medium text-gray-800 mb-6">
                {(currentQuestion as TrueFalseQuestion).statement}
              </h2>
              <div className="flex gap-4">
                {[true, false].map((value) => {
                  const isSelected = selectedAnswer === value;
                  const isCorrect = value === (currentQuestion as TrueFalseQuestion).correctAnswer;
                  const showCorrect = showResult && isCorrect;
                  const showWrong = showResult && isSelected && !isCorrect;

                  return (
                    <button
                      key={String(value)}
                      onClick={() => handleAnswer(value)}
                      disabled={showResult}
                      className={`flex-1 p-4 rounded-lg border-2 font-medium transition-all
                        ${showCorrect ? 'border-green-500 bg-green-50' :
                          showWrong ? 'border-red-500 bg-red-50' :
                          isSelected ? 'border-[#A855F7] bg-[#A855F7]/10' : 'border-gray-200 hover:border-[#A855F7]'}`}
                    >
                      {value ? 'True' : 'False'}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Next Button */}
          {!showResult && selectedAnswer !== null && (
            <button
              onClick={handleNext}
              className="w-full mt-6 py-3 bg-[#A855F7] text-white rounded-lg font-medium hover:bg-[#9333EA] transition-colors"
            >
              {currentIndex + 1 >= data.totalQuestions ? 'Finish' : 'Next'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
