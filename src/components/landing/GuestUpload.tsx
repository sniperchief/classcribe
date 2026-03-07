'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import OutputSelectionModal, { GenerationOptions } from '@/components/OutputSelectionModal';

type UploadStatus = 'idle' | 'uploading' | 'transcribing' | 'generating' | 'processing' | 'completed' | 'error';
type FileCategory = 'audio' | 'document' | 'image';

// Helper to determine file category
const getFileCategory = (file: File): FileCategory | null => {
  const audioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/mp4', 'audio/x-m4a'];
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ];
  const imageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

  if (audioTypes.includes(file.type) || file.name.match(/\.(mp3|wav|m4a|mp4)$/i)) {
    return 'audio';
  }
  if (documentTypes.includes(file.type) || file.name.match(/\.(pdf|doc|docx|ppt|pptx)$/i)) {
    return 'document';
  }
  if (imageTypes.includes(file.type) || file.name.match(/\.(png|jpg|jpeg|webp)$/i)) {
    return 'image';
  }
  return null;
};

export default function GuestUpload() {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [showOutputModal, setShowOutputModal] = useState(false);
  const [isProcessingModal, setIsProcessingModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Process audio files (existing flow)
  const processAudioFile = async (file: File) => {
    setFileName(file.name);
    setError(null);
    setStatus('uploading');
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('title', file.name.replace(/\.[^/.]+$/, ''));

      setProgress(30);
      const response = await fetch('/api/guest/process', {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Upload failed');
      }

      const { token } = responseData;
      setStatus('transcribing');
      setProgress(50);

      // Poll for completion
      let attempts = 0;
      const maxAttempts = 120;

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000));

        const statusResponse = await fetch(`/api/guest/status?token=${token}`);
        const statusData = await statusResponse.json();

        if (statusData.status === 'transcribing') {
          setStatus('transcribing');
          setProgress(50 + Math.min(attempts, 20));
        } else if (statusData.status === 'generating') {
          setStatus('generating');
          setProgress(70 + Math.min(attempts - 20, 20));
        } else if (statusData.status === 'completed') {
          setStatus('completed');
          setProgress(100);
          setTimeout(() => {
            router.push(`/signup?token=${token}`);
          }, 1500);
          return;
        } else if (statusData.status === 'failed') {
          throw new Error(statusData.error || 'Processing failed');
        }

        attempts++;
      }

      throw new Error('Processing timed out. Please try again.');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  // Process document/image files with selected output type
  const processDocumentFile = async (file: File, options: GenerationOptions) => {
    setShowOutputModal(false);
    setIsProcessingModal(false);
    setPendingFile(null);
    setFileName(file.name);
    setError(null);
    setStatus('uploading');
    setProgress(10);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', file.name.replace(/\.[^/.]+$/, ''));
      formData.append('outputType', options.outputType);
      if (options.difficulty) {
        formData.append('difficulty', options.difficulty);
      }
      if (options.quantity) {
        formData.append('quantity', options.quantity.toString());
      }

      setProgress(30);
      const response = await fetch('/api/guest/process-material', {
        method: 'POST',
        body: formData,
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Upload failed');
      }

      const { token } = responseData;
      setStatus('processing');
      setProgress(50);

      // Poll for completion
      let attempts = 0;
      const maxAttempts = 120;

      while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000));

        const statusResponse = await fetch(`/api/guest/material-status?token=${token}`);
        const statusData = await statusResponse.json();

        if (statusData.status === 'processing') {
          setStatus('processing');
          setProgress(50 + Math.min(attempts * 2, 40));
        } else if (statusData.status === 'completed') {
          setStatus('completed');
          setProgress(100);
          setTimeout(() => {
            router.push(`/signup?material_token=${token}`);
          }, 1500);
          return;
        } else if (statusData.status === 'failed') {
          throw new Error(statusData.error || 'Processing failed');
        }

        attempts++;
      }

      throw new Error('Processing timed out. Please try again.');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Determine file category
    const category = getFileCategory(file);

    if (!category) {
      setError('Please upload a supported file type (PDF, DOC, PPT, audio, or image)');
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    setError(null);

    if (category === 'audio') {
      // Audio files: auto-generate notes (existing flow)
      await processAudioFile(file);
    } else {
      // Documents and images: show output selection modal
      setPendingFile(file);
      setFileName(file.name);
      setShowOutputModal(true);
    }
  };

  const handleOutputSelect = async (options: GenerationOptions) => {
    if (!pendingFile) return;
    setIsProcessingModal(true);
    await processDocumentFile(pendingFile, options);
  };

  const handleModalClose = () => {
    setShowOutputModal(false);
    setPendingFile(null);
    setFileName(null);
    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && fileInputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      fileInputRef.current.files = dataTransfer.files;
      handleFileSelect({ target: { files: dataTransfer.files } } as React.ChangeEvent<HTMLInputElement>);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const getStatusText = () => {
    switch (status) {
      case 'uploading':
        return 'Uploading your file...';
      case 'transcribing':
        return 'Transcribing audio...';
      case 'generating':
        return 'Generating your notes...';
      case 'processing':
        return 'Processing your document...';
      case 'completed':
        return 'Done! Redirecting to signup...';
      default:
        return null;
    }
  };

  return (
    <>
    <OutputSelectionModal
      isOpen={showOutputModal}
      onClose={handleModalClose}
      onSelect={handleOutputSelect}
      isProcessing={isProcessingModal}
      materialTitle={fileName || undefined}
    />
    <div className="w-full max-w-2xl mx-auto">
      {status === 'idle' || status === 'error' ? (
        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#A855F7] transition-colors cursor-pointer bg-white/50 backdrop-blur-sm"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.wav,.m4a,.mp4,.pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,audio/*,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#A855F7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-lg font-medium text-[#0F172A] mb-2">
            Drag your file here or click to upload
          </p>

          {/* File type icons */}
          <div className="flex items-center justify-center gap-4 sm:gap-6 mt-4">
            {/* PDF */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM8.5 13H10v3.5a.5.5 0 01-1 0V15H8.5a.5.5 0 010-1zm2.5 0h1.5a.5.5 0 01.5.5v1a.5.5 0 01-.5.5H12v1.5a.5.5 0 01-1 0v-3a.5.5 0 01.5-.5h.5zm4 0h1a.5.5 0 010 1h-.5v.5h.5a.5.5 0 010 1h-.5v1a.5.5 0 01-1 0v-3a.5.5 0 01.5-.5z"/>
                </svg>
              </div>
              <span className="text-xs text-gray-500">pdf</span>
            </div>

            {/* DOC */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM7 13h2v1H8v3h1v1H7v-5zm3 0h2l1 3 1-3h2v5h-1v-3l-1 2h-1l-1-2v3h-1v-5h-.5.5z"/>
                </svg>
              </div>
              <span className="text-xs text-gray-500">doc</span>
            </div>

            {/* PPT */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-600" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM9 13h1.5a1.5 1.5 0 010 3H10v1.5a.5.5 0 01-1 0V13zm4 0h1.5a1.5 1.5 0 010 3H14v1.5a.5.5 0 01-1 0V13z"/>
                </svg>
              </div>
              <span className="text-xs text-gray-500">ppt</span>
            </div>

            {/* Audio */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <span className="text-xs text-gray-500">audio</span>
            </div>

            {/* Images */}
            <div className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs text-gray-500">images</span>
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 mt-4">{error}</p>
          )}
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl p-8 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-violet-50 rounded-full flex items-center justify-center flex-shrink-0">
              {status === 'completed' ? (
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-[#A855F7] animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[#0F172A] truncate">{fileName}</p>
              <p className="text-sm text-gray-500">{getStatusText()}</p>
            </div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-[#A855F7] h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
    </>
  );
}
