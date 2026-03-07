'use client';

import { useState } from 'react';
import type { MCQ } from '@/lib/types';

interface MCQViewerProps {
  mcqs: MCQ[];
}

export default function MCQViewer({ mcqs }: MCQViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState(false);

  const currentQuestion = mcqs[currentIndex];
  const isAnswered = selectedAnswer !== null;
  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  const handleSelectAnswer = (label: string) => {
    if (isAnswered) return;
    setSelectedAnswer(label);
    setAnswers((prev) => ({ ...prev, [currentIndex]: label }));
  };

  const handleNext = () => {
    if (currentIndex < mcqs.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(answers[currentIndex + 1] || null);
      setShowExplanation(false);
    } else {
      setShowResults(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedAnswer(answers[currentIndex - 1] || null);
      setShowExplanation(false);
    }
  };

  const handleJumpTo = (index: number) => {
    setCurrentIndex(index);
    setSelectedAnswer(answers[index] || null);
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
      if (mcqs[parseInt(index)].correctAnswer === answer) {
        correct++;
      }
    });
    return correct;
  };

  // Results screen with emotional feedback
  if (showResults) {
    const score = getScore();
    const percentage = Math.round((score / mcqs.length) * 100);

    // Determine tier
    const isSuccess = percentage >= 70;
    const isNeedsWork = percentage < 50;

    return (
      <div className="max-w-2xl mx-auto">
        <div className={`rounded-3xl shadow-xl p-8 text-center ${
          isSuccess
            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
            : isNeedsWork
            ? 'bg-gradient-to-br from-orange-500 to-red-500'
            : 'bg-gradient-to-br from-yellow-500 to-orange-500'
        }`}>
          {/* Emoji/Icon */}
          <div className="text-7xl mb-6">
            {isSuccess ? '🎉' : isNeedsWork ? '😤' : '💪'}
          </div>

          {/* Heading */}
          <h2 className="text-3xl font-bold text-white mb-2">
            {isSuccess
              ? 'Congratulations!'
              : isNeedsWork
              ? 'Keep Practicing!'
              : 'Good Effort!'}
          </h2>

          {/* Message */}
          <p className="text-white/90 text-lg mb-6">
            {isSuccess
              ? "You've mastered this material!"
              : isNeedsWork
              ? "Don't give up! Review the material and try again."
              : "You're almost there! Review and try again."}
          </p>

          {/* Score */}
          <div className="bg-white/20 rounded-2xl p-6 mb-6">
            <div className="text-5xl font-bold text-white mb-2">{percentage}%</div>
            <p className="text-white/80">{score} out of {mcqs.length} correct</p>
          </div>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-white text-gray-800 rounded-xl hover:bg-gray-100 transition-colors font-semibold shadow-lg"
            >
              Try Again
            </button>
            <button
              onClick={() => setShowResults(false)}
              className="px-6 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors font-semibold"
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
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">
            Question {currentIndex + 1} of {mcqs.length}
          </span>
          <span className="text-sm text-gray-500">
            Score: {getScore()}/{Object.keys(answers).length}
          </span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-2">
          <div
            className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / mcqs.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question navigation dots */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        {mcqs.map((_, index) => {
          const wasAnswered = answers[index] !== undefined;
          const wasCorrect = wasAnswered && mcqs[index].correctAnswer === answers[index];

          return (
            <button
              key={index}
              onClick={() => handleJumpTo(index)}
              className={`w-8 h-8 rounded-full text-xs font-medium transition-all ${
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
      <div className={`rounded-3xl shadow-xl p-8 mb-6 transition-all duration-300 ${
        isAnswered
          ? isCorrect
            ? 'bg-gradient-to-br from-emerald-500 to-emerald-600'
            : 'bg-gradient-to-br from-red-500 to-red-600'
          : 'bg-gradient-to-br from-emerald-500 to-emerald-600'
      }`}>
        {/* Question */}
        <p className="text-xl sm:text-2xl text-white font-medium text-center mb-8 leading-relaxed">
          {currentQuestion.question}
        </p>

        {/* Options */}
        <div className="space-y-3">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedAnswer === option.label;
            const isCorrectOption = option.label === currentQuestion.correctAnswer;

            return (
              <button
                key={option.label}
                onClick={() => handleSelectAnswer(option.label)}
                disabled={isAnswered}
                className={`w-full p-4 rounded-2xl text-left transition-all ${
                  isAnswered
                    ? isSelected
                      ? isCorrectOption
                        ? 'bg-white text-emerald-600 ring-4 ring-white'
                        : 'bg-white/30 text-white ring-4 ring-red-300'
                      : isCorrectOption
                        ? 'bg-emerald-500 text-white ring-4 ring-emerald-300'
                        : 'bg-white/20 text-white/60'
                    : 'bg-white/20 text-white hover:bg-white/30 border-2 border-white/50'
                } ${!isAnswered ? 'cursor-pointer' : 'cursor-default'}`}
              >
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                    isAnswered
                      ? isCorrectOption
                        ? isSelected
                          ? 'bg-white text-emerald-600'
                          : 'bg-white text-emerald-600'
                        : isSelected
                          ? 'bg-white/50 text-white'
                          : 'bg-white/30 text-white/80'
                      : 'bg-white/30 text-white'
                  }`}>
                    {isAnswered && isCorrectOption ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      option.label
                    )}
                  </span>
                  <span className="font-medium">{option.text}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Feedback after answering */}
        {isAnswered && (
          <div className="mt-6 text-center">
            <div className="flex items-center justify-center gap-2 mb-3">
              {isCorrect ? (
                <>
                  <span className="text-2xl">✓</span>
                  <span className="font-bold text-white text-lg">Correct!</span>
                </>
              ) : (
                <>
                  <span className="text-2xl">✗</span>
                  <span className="font-bold text-white text-lg">
                    The answer is {currentQuestion.correctAnswer}
                  </span>
                </>
              )}
            </div>

            {/* Show/Hide Explanation */}
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-white/80 hover:text-white underline text-sm"
            >
              {showExplanation ? 'Hide' : 'Show'} explanation
            </button>

            {showExplanation && (
              <p className="mt-3 text-white/90 text-sm bg-white/10 rounded-xl p-4">
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
          {currentIndex === mcqs.length - 1 ? 'Finish' : 'Next'}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
