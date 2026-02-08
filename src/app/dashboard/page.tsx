'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import type { Lecture, Profile } from '@/lib/types';
import DashboardSkeleton from '@/components/DashboardSkeleton';

// Lazy load modals - they're not needed on initial render
const ProgressModal = dynamic(() => import('@/components/ProgressModal'), {
  ssr: false,
});
const UpgradeModal = dynamic(() => import('@/components/UpgradeModal'), {
  ssr: false,
});

type SubscriptionInfo = {
  plan: string;
  lectureLimit: number;
  lecturesUsed: number;
  lecturesRemaining: number;
  canUpload: boolean;
};

export default function DashboardPage() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userEmail, setUserEmail] = useState<string>('');
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [profileForm, setProfileForm] = useState({
    full_name: '',
    country: '',
    university: '',
    course_of_study: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [processingLectureId, setProcessingLectureId] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const isProfileComplete = profile?.full_name && profile?.country && profile?.university && profile?.course_of_study;

  // Poll for lecture status updates
  const pollLectureStatus = useCallback(async (lectureId: string) => {
    try {
      const response = await fetch(`/api/lectures/${lectureId}`);
      const data = await response.json();

      if (data.lecture) {
        const status = data.lecture.status;
        setProcessingStatus(status);

        // Update the lecture in the list
        setLectures((prev) =>
          prev.map((l) => (l.id === lectureId ? { ...l, status } : l))
        );

        // Stop polling if completed or failed
        if (status === 'completed' || status === 'failed') {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }

          // If completed, keep modal open briefly to show success
          if (status === 'completed') {
            setTimeout(() => {
              setShowProgressModal(false);
              setProcessingLectureId(null);
              fetchLectures();
            }, 2000);
          }
        }
      }
    } catch (err) {
      console.error('Error polling lecture status:', err);
    }
  }, []);

  // Start polling for a lecture
  const startPolling = useCallback((lectureId: string) => {
    // Clear any existing polling
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    // Poll immediately
    pollLectureStatus(lectureId);

    // Then poll every 2 seconds
    pollingRef.current = setInterval(() => {
      pollLectureStatus(lectureId);
    }, 2000);
  }, [pollLectureStatus]);


  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscription');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (err) {
      console.error('Failed to fetch subscription:', err);
    }
  };

  // Fetch all initial data in a single request for faster loading
  const fetchInitialData = useCallback(async () => {
    try {
      // Single API call gets all dashboard data
      const response = await fetch('/api/dashboard');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load dashboard');
      }

      // Update all state at once
      if (data.lectures) {
        setLectures(data.lectures);

        // Check for in-progress lectures
        const processingLecture = data.lectures.find((l: Lecture) =>
          ['uploading', 'transcribing', 'generating', 'finalizing'].includes(l.status)
        );

        if (processingLecture) {
          setProcessingLectureId(processingLecture.id);
          setProcessingStatus(processingLecture.status);
          setShowProgressModal(true);
          startPolling(processingLecture.id);
        }
      }

      if (data.profile) {
        setProfile(data.profile);
        setProfileForm({
          full_name: data.profile.full_name || '',
          country: data.profile.country || '',
          university: data.profile.university || '',
          course_of_study: data.profile.course_of_study || '',
        });
      }

      if (data.subscription) {
        setSubscription(data.subscription);
      }

      if (data.email) {
        setUserEmail(data.email);
      }
    } catch (err) {
      console.error('Failed to fetch initial data:', err);
    } finally {
      setLoading(false);
    }
  }, [startPolling]);

  useEffect(() => {
    fetchInitialData();

    // Cleanup polling on unmount
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [fetchInitialData]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileForm),
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data.profile);
        setShowProfileDropdown(false);
      }
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setSavingProfile(false);
    }
  };

  const fetchLectures = async () => {
    try {
      const response = await fetch('/api/lectures');
      const data = await response.json();
      if (data.lectures) {
        setLectures(data.lectures);
      }
    } catch (err) {
      console.error('Failed to fetch lectures:', err);
    }
  };

  const handleLogout = () => {
    // Navigate immediately for responsive UI, sign out in background
    router.push('/login');
    supabase.auth.signOut();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if user can upload
    if (subscription && !subscription.canUpload) {
      setShowUpgradeModal(true);
      e.target.value = '';
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError('');
    setProcessingStatus('uploading');
    setShowProgressModal(true);

    const formData = new FormData();
    formData.append('file', file);

    // Use XMLHttpRequest for upload progress tracking
    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        // Cap at 90% - remaining 10% is for server processing (upload to Supabase)
        const percent = Math.round((event.loaded / event.total) * 90);
        setUploadProgress(percent);
      }
    });

    xhr.addEventListener('load', async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        // Server confirmed success - now show 100%
        setUploadProgress(100);
        try {
          const data = JSON.parse(xhr.responseText);
          // Set the processing lecture and refresh list
          setProcessingLectureId(data.lecture.id);
          await fetchLectures();
          await fetchSubscription(); // Refresh usage count
          // Auto-process the lecture
          processLecture(data.lecture.id);
        } catch (err) {
          setError('Failed to process server response');
          setProcessingStatus('failed');
        }
      } else {
        try {
          const data = JSON.parse(xhr.responseText);
          setError(data.error || 'Upload failed');
        } catch {
          setError('Upload failed');
        }
        setProcessingStatus('failed');
      }
      setUploading(false);
      e.target.value = '';
    });

    xhr.addEventListener('error', () => {
      setError('Network error during upload. Please try again.');
      setProcessingStatus('failed');
      setUploading(false);
      e.target.value = '';
    });

    xhr.open('POST', '/api/upload');
    xhr.send(formData);
  };

  const processLecture = async (lectureId: string) => {
    // Start polling for status updates
    startPolling(lectureId);

    try {
      const response = await fetch(`/api/lectures/${lectureId}/process`, {
        method: 'POST',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
      // Polling will pick up the failed status
    }
  };

  const handleRetry = async () => {
    if (!processingLectureId) return;

    setProcessingStatus('transcribing');
    setError('');
    processLecture(processingLectureId);
  };

  const handleCloseProgressModal = () => {
    // Store values before resetting
    const wasCompleted = processingStatus === 'completed';
    const lectureId = processingLectureId;

    setShowProgressModal(false);
    setProcessingLectureId(null);
    setProcessingStatus('');

    // Stop polling
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }

    // Refresh lectures
    fetchLectures();

    // If completed, navigate to the lecture
    if (wasCompleted && lectureId) {
      router.push(`/lectures/${lectureId}`);
    }
  };

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      uploading: 'bg-yellow-100 text-yellow-800',
      transcribing: 'bg-blue-100 text-blue-800',
      generating: 'bg-indigo-100 text-indigo-800',
      finalizing: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };
    const style = styles[status] || styles.uploading;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${style}`}>
        {status}
      </span>
    );
  };

  // Show skeleton while loading initial data
  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <main className="min-h-screen bg-[#F8FAFC]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#2563EB] rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <span className="text-xl font-semibold text-[#0F172A] hidden sm:block">Classcribe</span>
            </Link>

            {/* Right Side */}
            <div className="flex items-center gap-3">
              {/* Profile Dropdown */}
              <div ref={dropdownRef} className="relative">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                    ${isProfileComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {userEmail ? userEmail[0].toUpperCase() : '?'}
                  </span>
                  <span className="text-sm text-gray-600 hidden sm:block">
                    {isProfileComplete ? 'Profile' : 'Incomplete'}
                  </span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {showProfileDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-[#E5E7EB] z-50 overflow-hidden">
                    {/* Header */}
                    <div className="p-4 border-b border-[#E5E7EB] bg-[#F8FAFC]">
                      <p className="font-semibold text-[#0F172A] truncate">{userEmail}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium
                        ${isProfileComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {isProfileComplete ? 'Profile Complete' : 'Profile Incomplete'}
                      </span>
                    </div>

                    {/* Form */}
                    <div className="p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                          type="text"
                          value={profileForm.full_name}
                          onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                          placeholder="e.g. Sandra Johnson"
                          className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm
                                   focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent
                                   placeholder:text-gray-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                        <input
                          type="text"
                          value={profileForm.country}
                          onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                          placeholder="e.g. Nigeria"
                          className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm
                                   focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent
                                   placeholder:text-gray-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                        <input
                          type="text"
                          value={profileForm.university}
                          onChange={(e) => setProfileForm({ ...profileForm, university: e.target.value })}
                          placeholder="e.g. University of Lagos"
                          className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm
                                   focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent
                                   placeholder:text-gray-400"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Course of Study</label>
                        <input
                          type="text"
                          value={profileForm.course_of_study}
                          onChange={(e) => setProfileForm({ ...profileForm, course_of_study: e.target.value })}
                          placeholder="e.g. Computer Science"
                          className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg text-sm
                                   focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent
                                   placeholder:text-gray-400"
                        />
                      </div>

                      <button
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors
                          ${savingProfile
                            ? 'bg-blue-300 text-white cursor-not-allowed'
                            : 'bg-[#2563EB] text-white hover:bg-[#1d4ed8]'
                          }`}
                      >
                        {savingProfile ? 'Saving...' : 'Save Profile'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm text-gray-600 border border-[#E5E7EB] rounded-lg hover:bg-gray-50 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Greeting */}
        <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-6">
          Hi {profile?.full_name ? profile.full_name.split(' ')[0] : 'there'}!
        </h2>

        {/* Usage Indicator */}
        {subscription && (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-[#0F172A]">
                    {subscription.lecturesRemaining} of {subscription.lectureLimit} lectures remaining
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize
                    ${subscription.plan === 'student' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                    {subscription.plan}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Resets at the start of each month</p>
              </div>
              {subscription.plan === 'free' && (
                <Link
                  href="/pricing"
                  className="text-sm font-medium text-[#2563EB] hover:underline"
                >
                  Upgrade for more
                </Link>
              )}
            </div>
            <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  subscription.lecturesRemaining === 0 ? 'bg-yellow-500' : 'bg-[#2563EB]'
                }`}
                style={{
                  width: `${((subscription.lectureLimit - subscription.lecturesRemaining) / subscription.lectureLimit) * 100}%`
                }}
              />
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white rounded-xl border-2 border-dashed border-[#E5E7EB] p-6 sm:p-8 mb-6 text-center hover:border-[#2563EB] transition-colors">
          <div className="w-12 h-12 bg-[#2563EB]/10 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-[#2563EB]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-[#0F172A] mb-1">
            Upload Lecture Recording
          </h3>
          <p className="text-gray-500 text-sm mb-4">
            MP3, WAV, M4A, or MP4 (max 50MB)
          </p>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-4 max-w-md mx-auto">
              {error}
            </div>
          )}

          <label
            className={`inline-flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-colors cursor-pointer
              ${uploading ? 'bg-blue-300 cursor-not-allowed' : 'bg-[#2563EB] hover:bg-[#1d4ed8]'}`}
          >
            {uploading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Uploading...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Choose File
              </>
            )}
            <input
              type="file"
              accept=".mp3,.wav,.m4a,.mp4,audio/mpeg,audio/wav,audio/x-m4a,video/mp4"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>

        {/* Lectures List */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-lg font-semibold text-[#0F172A]">Your Lectures</h3>
          </div>

          {lectures.length === 0 ? (
            <div className="p-8 sm:p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <p className="text-gray-500 mb-1">No lectures yet</p>
              <p className="text-sm text-gray-400">Upload your first recording to get started!</p>
            </div>
          ) : (
            <div className="divide-y divide-[#E5E7EB]">
              {lectures.map((lecture) => (
                <div
                  key={lecture.id}
                  onClick={() => lecture.status === 'completed' && router.push(`/lectures/${lecture.id}`)}
                  className={`px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3
                    ${lecture.status === 'completed' ? 'cursor-pointer hover:bg-gray-50' : ''} transition-colors`}
                >
                  <div className="min-w-0">
                    <h4 className="font-medium text-[#0F172A] truncate">{lecture.title}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(lecture.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(lecture.status)}
                    {lecture.status === 'completed' && (
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* How It Works Section */}
        <div className="mt-8 bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          <div className="px-4 sm:px-6 py-4 border-b border-[#E5E7EB]">
            <h3 className="text-lg font-semibold text-[#0F172A]">How It Works</h3>
          </div>

          <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 bg-[#2563EB]/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-[#2563EB] font-bold text-lg">1</span>
                </div>
                <h4 className="font-semibold text-[#0F172A] mb-2">Upload Recording</h4>
                <p className="text-sm text-gray-500">
                  Upload your lecture audio file (MP3, WAV, M4A, or MP4 up to 50MB)
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 bg-[#2563EB]/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-[#2563EB] font-bold text-lg">2</span>
                </div>
                <h4 className="font-semibold text-[#0F172A] mb-2">AI Processing</h4>
                <p className="text-sm text-gray-500">
                  Our AI transcribes your audio and generates structured, detailed notes
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 bg-[#2563EB]/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-[#2563EB] font-bold text-lg">3</span>
                </div>
                <h4 className="font-semibold text-[#0F172A] mb-2">Review & Study</h4>
                <p className="text-sm text-gray-500">
                  Access your notes anytime, review key concepts, and ace your exams
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Modal */}
      <ProgressModal
        isOpen={showProgressModal}
        currentStatus={processingStatus}
        uploadProgress={uploadProgress}
        onRetry={handleRetry}
        onClose={handleCloseProgressModal}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        lecturesUsed={subscription?.lecturesUsed || 0}
        lectureLimit={subscription?.lectureLimit || 2}
      />
    </main>
  );
}
