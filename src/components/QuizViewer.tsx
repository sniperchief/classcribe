'use client';

import { useState } from 'react';
import type { TrueFalseQuestion } from '@/lib/types';

interface QuizViewerProps {
  quiz: TrueFalseQuestion[];
}

export default function QuizViewer({ quiz }: QuizViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<Record<number, boolean>>({});
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = quiz[currentIndex];
  const isAnswered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  const handleSelectAnswer = (answer: boolean) => {
    if (isAnswered) return;
    setSelectedAnswer(answer);
    setAnswers((prev) => ({ ...prev, [currentIndex]: answer }));
  };

  const handleNext = () => {
    if (currentIndex < quiz.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(answers[currentIndex + 1] ?? null);
      setShowExplanation(false);
    } else {
      setShowResults(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedAnswer(answers[currentIndex - 1] ?? null);
      setShowExplanation(false);
    }
  };

  const handleJumpTo = (index: number) => {
    setCurrentIndex(index);
    setSelectedAnswer(answers[index] ?? null);
    setShowExplanation(false);
  };

  const handleRetry = () => {
    setCurrentIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAnswers({});
    setShowResults(false);
  };

  const getScore = () => {
    let correct = 0;
    Object.entries(answers).forEach(([index, answer]) => {
      if (quiz[parseInt(index)].correctAnswer === answer) {
        correct++;
      }
    });
    return correct;
  };

  const getPercentage = () => {
    const answered = Object.keys(answers).length;
    if (answered === 0) return 0;
    return Math.round((getScore() / quiz.length) * 100);
  };

  // Results screen with emotional feedback
  if (showResults) {
    const score = getScore();
    const percentage = Math.round((score / quiz.length) * 100);

    // Determine tier
    const isSuccess = percentage >= 70;
    const isNeedsWork = percentage < 50;

    return (
      <div className="max-w-2xl mx-auto">
        <div className={`rounded-2xl sm:rounded-3xl shadow-xl p-5 sm:p-8 text-center ${
          isSuccess
            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
            : isNeedsWork
            ? 'bg-gradient-to-br from-orange-500 to-red-500'
            : 'bg-gradient-to-br from-yellow-500 to-orange-500'
        }`}>
          {/* Emoji/Icon */}
          <div className="text-5xl sm:text-7xl mb-4 sm:mb-6">
            {isSuccess ? '🎉' : isNeedsWork ? '😤' : '💪'}
          </div>

          {/* Heading */}
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1.5 sm:mb-2">
            {isSuccess
              ? 'Congratulations!'
              : isNeedsWork
              ? 'Keep Practicing!'
              : 'Good Effort!'}
          </h2>

          {/* Message */}
          <p className="text-white/90 text-base sm:text-lg mb-4 sm:mb-6">
            {isSuccess
              ? "You've mastered this material!"
              : isNeedsWork
              ? "Don't give up! Review the material and try again."
              : "You're almost there! Review and try again."}
          </p>

          {/* Score */}
          <div className="bg-white/20 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
            <div className="text-4xl sm:text-5xl font-bold text-white mb-1 sm:mb-2">{percentage}%</div>
            <p className="text-white/80 text-sm sm:text-base">{score} out of {quiz.length} correct</p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="px-5 sm:px-6 py-2.5 sm:py-3 bg-white text-gray-800 rounded-lg sm:rounded-xl hover:bg-gray-100 transition-colors font-semibold shadow-lg text-sm sm:text-base"
            >
              Try Again
            </button>
            <button
              onClick={() => setShowResults(false)}
              className="px-5 sm:px-6 py-2.5 sm:py-3 bg-white/20 text-white rounded-lg sm:rounded-xl hover:bg-white/30 transition-colors font-semibold text-sm sm:text-base"
            >
              Review Answers
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress bar */}
      <div className="mb-3 sm:mb-6">
        <div className="flex justify-between items-center mb-1.5 sm:mb-2">
          <span className="text-xs sm:text-sm text-gray-500">
            Question {currentIndex + 1} of {quiz.length}
          </span>
          <span className="text-xs sm:text-sm text-gray-500">
            Score: {getScore()}/{Object.keys(answers).length}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-1.5 sm:h-2">
          <div
            className="bg-emerald-500 h-1.5 sm:h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / quiz.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question navigation dots */}
      <div className="flex flex-wrap justify-center gap-1 sm:gap-2 mb-3 sm:mb-6">
        {quiz.map((_, index) => {
          const wasAnswered = answers[index] !== undefined;
          const wasCorrect = wasAnswered && quiz[index].correctAnswer === answers[index];

          return (
            <button
              key={index}
              onClick={() => handleJumpTo(index)}
              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full text-[10px] sm:text-xs font-medium transition-all ${
                index === currentIndex
                  ? 'bg-emerald-500 text-white scale-110'
                  : wasAnswered
                  ? wasCorrect
                    ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-300'
                    : 'bg-red-100 text-red-700 border-2 border-red-300'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      {/* Question card - Emerald design */}
      <div className={`rounded-2xl sm:rounded-3xl shadow-xl p-4 sm:p-8 mb-4 sm:mb-6 transition-all duration-300 ${
        isAnswered
          ? isCorrect
            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
            : 'bg-gradient-to-br from-red-500 to-red-600'
          : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
      }`}>
        {/* Statement */}
        <p className="text-base sm:text-2xl text-white font-medium text-center mb-4 sm:mb-8 leading-relaxed">
          {currentQuestion.statement}
        </p>

        {/* True/False buttons */}
        <div className="flex gap-3 sm:gap-4 justify-center">
          <button
            onClick={() => handleSelectAnswer(true)}
            disabled={isAnswered}
            className={`flex-1 max-w-[120px] sm:max-w-[140px] py-3 px-4 sm:py-4 sm:px-6 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all ${
              isAnswered
                ? selectedAnswer === true
                  ? currentQuestion.correctAnswer === true
                    ? 'bg-white text-emerald-600 ring-4 ring-white'
                    : 'bg-white/30 text-white ring-4 ring-red-300'
                  : currentQuestion.correctAnswer === true
                    ? 'bg-white/50 text-white'
                    : 'bg-white/20 text-white/60'
                : 'bg-white/20 text-white hover:bg-white/30 border-2 border-white/50'
            }`}
          >
            <span className="flex items-center justify-center gap-1.5 sm:gap-2">
              {isAnswered && currentQuestion.correctAnswer === true && (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
              TRUE
            </span>
          </button>
          <button
            onClick={() => handleSelectAnswer(false)}
            disabled={isAnswered}
            className={`flex-1 max-w-[120px] sm:max-w-[140px] py-3 px-4 sm:py-4 sm:px-6 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all ${
              isAnswered
                ? selectedAnswer === false
                  ? currentQuestion.correctAnswer === false
                    ? 'bg-white text-emerald-600 ring-4 ring-white'
                    : 'bg-white/30 text-white ring-4 ring-red-300'
                  : currentQuestion.correctAnswer === false
                    ? 'bg-white/50 text-white'
                    : 'bg-white/20 text-white/60'
                : 'bg-white/20 text-white hover:bg-white/30 border-2 border-white/50'
            }`}
          >
            <span className="flex items-center justify-center gap-1.5 sm:gap-2">
              {isAnswered && currentQuestion.correctAnswer === false && (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
              FALSE
            </span>
          </button>
        </div>

        {/* Feedback after answering */}
        {isAnswered && (
          <div className="mt-4 sm:mt-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-2 sm:mb-3">
              {isCorrect ? (
                <>
                  <span className="text-xl sm:text-2xl">✓</span>
                  <span className="font-bold text-white text-base sm:text-lg">Correct!</span>
                </>
              ) : (
                <>
                  <span className="text-xl sm:text-2xl">✗</span>
                  <span className="font-bold text-white text-base sm:text-lg">
                    The answer is {currentQuestion.correctAnswer ? 'TRUE' : 'FALSE'}
                  </span>
                </>
              )}
            </div>

            {/* Show/Hide Explanation */}
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-white/80 hover:text-white underline text-xs sm:text-sm"
            >
              {showExplanation ? 'Hide' : 'Show'} explanation
            </button>

            {showExplanation && (
              <p className="mt-2 sm:mt-3 text-white/90 text-xs sm:text-sm bg-white/10 rounded-lg sm:rounded-xl p-3 sm:p-4">
                {currentQuestion.explanation}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
            currentIndex === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Previous
        </button>

        <button
          onClick={handleNext}
          disabled={!isAnswered}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
            !isAnswered
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : 'bg-emerald-500 text-white hover:bg-emerald-600'
          }`}
        >
          {currentIndex === quiz.length - 1 ? 'Finish' : 'Next'}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
