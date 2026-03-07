'use client';

import { useState, useEffect } from 'react';
import type { OutputType, DifficultyLevel } from '@/lib/types';

export type { DifficultyLevel };

export interface GenerationOptions {
  outputType: OutputType;
  difficulty?: DifficultyLevel;
  quantity?: number;
}

interface OutputOption {
  id: OutputType;
  title: string;
  description: string;
  icon: React.ReactNode;
  hasOptions: boolean;
}

const outputOptions: OutputOption[] = [
  {
    id: 'summary',
    title: 'Summary',
    description: 'A comprehensive study summary with key concepts',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    hasOptions: false,
  },
  {
    id: 'flashcards',
    title: 'Flashcards',
    description: 'Study flashcards to help you memorize key concepts',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    hasOptions: true,
  },
  {
    id: 'mcqs',
    title: 'MCQs',
    description: 'Multiple choice questions with answers & explanations',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
    hasOptions: true,
  },
  {
    id: 'quiz',
    title: 'Practice Quiz',
    description: 'True or false practice questions',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    hasOptions: true,
  },
];

const flashcardQuantities = [10, 15, 20, 30];
const questionQuantities = [25, 50, 75, 100];

interface OutputSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (options: GenerationOptions) => void;
  isProcessing: boolean;
  materialTitle?: string;
}

export default function OutputSelectionModal({
  isOpen,
  onClose,
  onSelect,
  isProcessing,
  materialTitle,
}: OutputSelectionModalProps) {
  const [selectedType, setSelectedType] = useState<OutputType | null>(null);
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [quantity, setQuantity] = useState<number>(15);

  // Reset options when type changes
  useEffect(() => {
    if (selectedType === 'flashcards') {
      setQuantity(15);
    } else if (selectedType === 'mcqs' || selectedType === 'quiz') {
      setQuantity(25);
    }
    setDifficulty('medium');
  }, [selectedType]);

  if (!isOpen) return null;

  const handleGenerate = () => {
    if (selectedType) {
      const options: GenerationOptions = { outputType: selectedType };

      // Only include difficulty and quantity for non-summary types
      if (selectedType !== 'summary') {
        options.difficulty = difficulty;
        options.quantity = quantity;
      }

      onSelect(options);
    }
  };

  const selectedOption = outputOptions.find(o => o.id === selectedType);
  const showOptions = selectedOption?.hasOptions;
  const quantityOptions = selectedType === 'flashcards' ? flashcardQuantities : questionQuantities;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!isProcessing ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-xl w-full sm:max-w-lg sm:mx-4 flex flex-col max-h-[90vh] sm:max-h-[85vh]">
        {/* Header - Fixed */}
        <div className="flex-shrink-0 px-4 py-4 sm:px-6 sm:py-5 border-b border-gray-100">
          <h2 className="text-lg sm:text-xl font-semibold text-[#0F172A]">
            What would you like to generate?
          </h2>
          {materialTitle && (
            <p className="text-sm text-gray-500 mt-1 truncate">
              From: {materialTitle}
            </p>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Output Type Options */}
          <div className="p-4 sm:p-6 space-y-2 sm:space-y-3">
          {outputOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSelectedType(option.id)}
              disabled={isProcessing}
              className={`w-full p-3 sm:p-4 rounded-xl border-2 text-left transition-all flex items-start gap-3 sm:gap-4
                ${selectedType === option.id
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }
                ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center flex-shrink-0
                ${selectedType === option.id ? 'bg-emerald-500 text-white' : 'bg-gray-100 text-gray-600'}
              `}>
                {option.icon}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-[#0F172A]">{option.title}</h3>
                <p className="text-sm text-gray-500">{option.description}</p>
              </div>
              {selectedType === option.id && (
                <div className="flex-shrink-0">
                  <svg className="w-6 h-6 text-emerald-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Difficulty & Quantity Options */}
        {showOptions && (
          <div className="px-4 pb-4 sm:px-6 sm:pb-6 space-y-4 sm:space-y-5 border-t border-gray-100 pt-4 sm:pt-5">
            {/* Difficulty Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                Difficulty Level
              </label>
              <div className="flex gap-2">
                {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    disabled={isProcessing}
                    className={`flex-1 py-2 px-3 sm:py-2.5 sm:px-4 rounded-lg font-medium text-sm transition-all capitalize
                      ${difficulty === level
                        ? level === 'easy'
                          ? 'bg-green-500 text-white'
                          : level === 'medium'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                      ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 sm:mb-3">
                Number of {selectedType === 'flashcards' ? 'Cards' : 'Questions'}
              </label>
              <div className="flex gap-2">
                {quantityOptions.map((num) => (
                  <button
                    key={num}
                    onClick={() => setQuantity(num)}
                    disabled={isProcessing}
                    className={`flex-1 py-2 px-3 sm:py-2.5 sm:px-4 rounded-lg font-medium text-sm transition-all
                      ${quantity === num
                        ? 'bg-emerald-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                      ${isProcessing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                    `}
                  >
                    {num}
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-1.5 sm:mt-2">
                * If the document is short, fewer items may be generated
              </p>
            </div>
          </div>
        )}
        </div>

        {/* Footer - Fixed */}
        <div className="flex-shrink-0 px-4 py-3 sm:px-6 sm:py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="px-3 py-2 sm:px-4 text-gray-600 hover:text-gray-800 font-medium transition-colors disabled:opacity-50 text-sm sm:text-base"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={!selectedType || isProcessing}
            className={`px-4 py-2 sm:px-6 rounded-lg font-medium transition-all flex items-center gap-2 text-sm sm:text-base
              ${selectedType && !isProcessing
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            {isProcessing ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              'Generate'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
