'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

type UploadStatus = 'idle' | 'uploading' | 'transcribing' | 'generating' | 'completed' | 'error';

export default function GuestUpload() {
  const [status, setStatus] = useState<UploadStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 'audio/mp4', 'audio/x-m4a'];
    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(mp3|wav|m4a|mp4)$/i)) {
      setError('Please upload an MP3, WAV, or M4A file');
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      setError('File size must be less than 50MB');
      return;
    }

    setFileName(file.name);
    setError(null);
    setStatus('uploading');
    setProgress(10);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('audio', file);
      formData.append('title', file.name.replace(/\.[^/.]+$/, ''));

      // Upload and process
      setProgress(30);
      const response = await fetch('/api/guest/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Upload failed');
      }

      // Poll for status
      const { token } = await response.json();
      setStatus('transcribing');
      setProgress(50);

      // Poll for completion
      let attempts = 0;
      const maxAttempts = 120; // 4 minutes max

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
          // Redirect to signup with token
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
        return 'Uploading your lecture...';
      case 'transcribing':
        return 'Transcribing audio...';
      case 'generating':
        return 'Generating your notes...';
      case 'completed':
        return 'Done! Redirecting to signup...';
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {status === 'idle' || status === 'error' ? (
        <div
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#2563EB] transition-colors cursor-pointer bg-white/50 backdrop-blur-sm"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.wav,.m4a,.mp4,audio/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <p className="text-lg font-medium text-[#0F172A] mb-2">
            Try it free - Upload a lecture
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Drag & drop or click to select (MP3, WAV, M4A up to 50MB)
          </p>
          {error && (
            <p className="text-sm text-red-500 mt-2">{error}</p>
          )}
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl p-8 bg-white/50 backdrop-blur-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center flex-shrink-0">
              {status === 'completed' ? (
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-[#2563EB] animate-spin" fill="none" viewBox="0 0 24 24">
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
              className="bg-[#2563EB] h-2 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
