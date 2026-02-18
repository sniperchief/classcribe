'use client';

import { useEffect, useState } from 'react';

type ProgressStep = {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
};

type ProgressModalProps = {
  isOpen: boolean;
  currentStatus: string;
  uploadProgress?: number;
  onRetry?: () => void;
  onClose?: () => void;
};

const STEPS = [
  { id: 'uploading', label: 'Uploading audio' },
  { id: 'transcribing', label: 'Processing lecture' },
  { id: 'generating', label: 'Structuring note' },
  { id: 'completed', label: 'Note ready' },
];

const STATUS_ORDER = ['uploading', 'transcribing', 'generating', 'completed'];

export default function ProgressModal({ isOpen, currentStatus, uploadProgress = 0, onRetry, onClose }: ProgressModalProps) {
  const [steps, setSteps] = useState<ProgressStep[]>([]);
  const isFailed = currentStatus === 'failed';
  const isCompleted = currentStatus === 'completed';
  const isUploading = currentStatus === 'uploading';

  useEffect(() => {
    const currentIndex = STATUS_ORDER.indexOf(currentStatus);

    const updatedSteps = STEPS.map((step, index) => {
      let status: ProgressStep['status'] = 'pending';

      if (isFailed) {
        // Find which step failed (assume the last active step)
        if (index < currentIndex || currentIndex === -1) {
          status = 'completed';
        } else if (index === currentIndex || (currentIndex === -1 && index === 0)) {
          status = 'failed';
        }
      } else if (index < currentIndex) {
        status = 'completed';
      } else if (index === currentIndex) {
        status = isCompleted ? 'completed' : 'active';
      }

      return { ...step, status };
    });

    setSteps(updatedSteps);
  }, [currentStatus, isFailed, isCompleted]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 sm:p-8">
        {/* Top Headline */}
        <div className="text-center mb-8">
          {isFailed ? (
            <>
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
                Something went wrong
              </h2>
              <p className="text-gray-500 mt-2">
                Something went wrong while processing your lecture
              </p>
            </>
          ) : isCompleted ? (
            <>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
                Your notes are ready!
              </h2>
            </>
          ) : (
            <>
              <div className="w-16 h-16 bg-[#A855F7]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-[#A855F7] animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F172A]">
                We&apos;re turning your lecture into study ready notes
              </h2>
            </>
          )}
        </div>

        {/* Progress Steps */}
        <div className="space-y-4 mb-8">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-4">
              {/* Step Indicator */}
              <div className="flex-shrink-0">
                {step.status === 'completed' ? (
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                ) : step.status === 'active' ? (
                  <div className="w-8 h-8 bg-[#A855F7] rounded-full flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : step.status === 'failed' ? (
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                  </div>
                )}
              </div>

              {/* Step Label */}
              <span
                className={`text-sm font-medium ${
                  step.status === 'completed'
                    ? 'text-green-600'
                    : step.status === 'active'
                    ? 'text-[#A855F7]'
                    : step.status === 'failed'
                    ? 'text-red-600'
                    : 'text-gray-400'
                }`}
              >
                {step.id === 'uploading' && step.status === 'active' && uploadProgress > 0
                  ? `${step.label} (${uploadProgress}%)`
                  : step.label}
              </span>

              {/* Connector Line (except for last item) */}
              {index < steps.length - 1 && (
                <div className="flex-1 h-px bg-gray-200"></div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        {isFailed ? (
          <div className="flex flex-col gap-3">
            <button
              onClick={onRetry}
              className="w-full py-3 bg-[#A855F7] text-white rounded-lg font-medium hover:bg-[#9333EA] transition-colors"
            >
              Retry
            </button>
            <button
              onClick={onClose}
              className="w-full py-3 border border-[#E5E7EB] text-gray-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : isCompleted ? (
          <button
            onClick={onClose}
            className="w-full py-3 bg-[#A855F7] text-white rounded-lg font-medium hover:bg-[#9333EA] transition-colors"
          >
            View Notes
          </button>
        ) : (
          <p className="text-center text-gray-500 text-sm">
            This usually takes a few minutes
          </p>
        )}
      </div>
    </div>
  );
}
