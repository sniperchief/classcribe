'use client';

import { useState, useEffect } from 'react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  materialId: string;
  materialTitle: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  materialId,
  materialTitle,
}: ShareModalProps) {
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [viewCount, setViewCount] = useState(0);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && materialId) {
      // First check if share link exists
      fetch(`/api/docs/${materialId}/share`)
        .then(res => res.json())
        .then(data => {
          if (data.shareLink) {
            setShareUrl(data.shareLink.shareUrl);
            setViewCount(data.shareLink.view_count || 0);
          }
        })
        .catch(console.error);
    }
  }, [isOpen, materialId]);

  const handleCreateLink = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/docs/${materialId}/share`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setShareUrl(data.shareUrl);
      }
    } catch {
      setError('Failed to create share link');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDeleteLink = async () => {
    try {
      await fetch(`/api/docs/${materialId}/share`, {
        method: 'DELETE',
      });
      setShareUrl('');
      setViewCount(0);
    } catch {
      console.error('Failed to delete share link');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-[#0F172A]">Share Material</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Material Title */}
        <div className="bg-gray-50 rounded-lg p-3 mb-6">
          <p className="text-sm text-gray-500">Sharing:</p>
          <p className="font-medium text-[#0F172A] truncate">{materialTitle}</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        {!shareUrl ? (
          /* Create Link Section */
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
            <h3 className="font-medium text-[#0F172A] mb-2">Create a Share Link</h3>
            <p className="text-sm text-gray-500 mb-6">
              Anyone with the link can view this material. They&apos;ll see a preview and can sign up to see more.
            </p>
            <button
              onClick={handleCreateLink}
              disabled={loading}
              className="w-full py-3 bg-emerald-500 text-white rounded-lg font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                  </svg>
                  Create Share Link
                </>
              )}
            </button>
          </div>
        ) : (
          /* Share Link Created */
          <div>
            {/* Link Display */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Share Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm bg-gray-50"
                />
                <button
                  onClick={handleCopy}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2
                    ${copied
                      ? 'bg-green-500 text-white'
                      : 'bg-emerald-500 text-white hover:bg-emerald-600'
                    }`}
                >
                  {copied ? (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <span>{viewCount} views</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Expires in 30 days</span>
              </div>
            </div>

            {/* Social Share */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Share via
              </label>
              <div className="flex gap-2">
                <a
                  href={`https://wa.me/?text=Check out these study materials: ${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-4 bg-green-500 text-white rounded-lg font-medium text-center hover:bg-green-600 transition-colors text-sm"
                >
                  WhatsApp
                </a>
                <a
                  href={`https://twitter.com/intent/tweet?text=Check out these study materials&url=${encodeURIComponent(shareUrl)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-4 bg-black text-white rounded-lg font-medium text-center hover:bg-gray-800 transition-colors text-sm"
                >
                  X (Twitter)
                </a>
              </div>
            </div>

            {/* Delete Link */}
            <button
              onClick={handleDeleteLink}
              className="w-full py-2 text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
            >
              Delete Share Link
            </button>
          </div>
        )}

        {/* Info */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 text-center">
            Viewers will see a preview ({shareUrl ? '5 items' : 'limited content'}). They need to sign up to see everything.
          </p>
        </div>
      </div>
    </div>
  );
}
