'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { createClient } from '@/lib/supabase/client';
import type { Lecture, Profile, Material, OutputType } from '@/lib/types';
import type { GenerationOptions, DifficultyLevel } from '@/components/OutputSelectionModal';
import DashboardSkeleton from '@/components/DashboardSkeleton';
import MobileMenu from '@/components/MobileMenu';

// Lazy load modals - they're not needed on initial render
const ProgressModal = dynamic(() => import('@/components/ProgressModal'), {
  ssr: false,
});
const UpgradeModal = dynamic(() => import('@/components/UpgradeModal'), {
  ssr: false,
});
const OutputSelectionModal = dynamic(() => import('@/components/OutputSelectionModal'), {
  ssr: false,
});

type SubscriptionInfo = {
  plan: string;
  materialsLimit: number;
  materialsUsed: number;
  materialsRemaining: number;
  canUploadMaterial: boolean;
  lecturesLimit: number;
  lecturesUsed: number;
  lecturesRemaining: number;
  canUploadLecture: boolean;
};

export default function DashboardPage() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadingDocument, setUploadingDocument] = useState(false);
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
  const [processingMaterialId, setProcessingMaterialId] = useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = useState<string>('');
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showUpgradeSuccess, setShowUpgradeSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'recordings' | 'materials'>('materials');
  const [showOutputModal, setShowOutputModal] = useState(false);
  const [pendingMaterial, setPendingMaterial] = useState<{ id: string; title: string } | null>(null);
  const [progressType, setProgressType] = useState<'audio' | 'document'>('audio');
  const [materialSearch, setMaterialSearch] = useState('');
  const [materialFilter, setMaterialFilter] = useState<OutputType | 'all'>('all');
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
          ['uploading', 'transcribing', 'generating'].includes(l.status)
        );

        if (processingLecture) {
          setProcessingLectureId(processingLecture.id);
          setProcessingStatus(processingLecture.status);
          setProgressType('audio');
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
    fetchMaterials(); // Also fetch materials on initial load

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

  // Check for subscription success
  useEffect(() => {
    // Small delay to ensure URL is available after redirect
    const checkSubscriptionSuccess = () => {
      const params = new URLSearchParams(window.location.search);
      if (params.get('subscription') === 'success') {
        setShowUpgradeSuccess(true);
        // Remove query param from URL
        window.history.replaceState({}, '', '/dashboard');
        // Auto-hide after 5 seconds
        setTimeout(() => {
          setShowUpgradeSuccess(false);
        }, 5000);
      }
    };

    // Check immediately and also after a brief delay
    checkSubscriptionSuccess();
    const timer = setTimeout(checkSubscriptionSuccess, 100);
    return () => clearTimeout(timer);
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

  const fetchMaterials = async () => {
    try {
      const response = await fetch('/api/docs');
      const data = await response.json();
      if (data.materials) {
        setMaterials(data.materials);
      }
    } catch (err) {
      console.error('Failed to fetch materials:', err);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if user can upload audio
    if (subscription && !subscription.canUploadLecture) {
      setShowUpgradeModal(true);
      e.target.value = '';
      return;
    }

    // Validate file type
    const allowedTypes = [
      'audio/mpeg',      // MP3
      'audio/wav',       // WAV
      'audio/x-m4a',     // M4A
      'audio/mp4',       // M4A variant
      'video/mp4',       // MP4
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload MP3, WAV, M4A, or MP4.');
      e.target.value = '';
      return;
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 50MB.');
      e.target.value = '';
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setError('');
    setProcessingStatus('uploading');
    setProgressType('audio');
    setShowProgressModal(true);

    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Generate unique filename
      const timestamp = Date.now();
      const extension = file.name.split('.').pop() || 'mp3';
      const fileName = `${user.id}/${timestamp}.${extension}`;

      // Upload directly to Supabase Storage with progress tracking
      // Using XMLHttpRequest for progress tracking with signed URL
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('audio')
        .createSignedUploadUrl(fileName);

      if (signedUrlError || !signedUrlData) {
        // Fallback: try direct upload without progress tracking
        console.log('Signed URL not available, using direct upload');

        const { error: uploadError } = await supabase.storage
          .from('audio')
          .upload(fileName, file, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          throw new Error(uploadError.message);
        }

        setUploadProgress(90);
      } else {
        // Upload using signed URL with progress tracking
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 90);
              setUploadProgress(percent);
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error('Upload failed'));
            }
          });

          xhr.addEventListener('error', () => {
            reject(new Error('Network error during upload'));
          });

          xhr.open('PUT', signedUrlData.signedUrl);
          xhr.setRequestHeader('Content-Type', file.type);
          xhr.send(file);
        });
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from('audio').getPublicUrl(fileName);

      setUploadProgress(95);

      // Create lecture record via API
      const lectureTitle = file.name.replace(/\.[^/.]+$/, '');
      const response = await fetch('/api/lectures', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: lectureTitle,
          audio_url: urlData.publicUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        // If lecture creation fails, clean up the uploaded file
        await supabase.storage.from('audio').remove([fileName]);
        throw new Error(data.error || 'Failed to create lecture');
      }

      const data = await response.json();
      setUploadProgress(100);

      // Set the processing lecture and refresh list
      setProcessingLectureId(data.lecture.id);
      await fetchLectures();
      await fetchSubscription(); // Refresh usage count

      // Auto-process the lecture
      processLecture(data.lecture.id);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setProcessingStatus('failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if user can upload materials
    if (subscription && !subscription.canUploadMaterial) {
      setShowUpgradeModal(true);
      e.target.value = '';
      return;
    }

    // Validate file type - PDF, Word, PowerPoint
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
    ];
    const allowedExtensions = ['pdf', 'docx', 'pptx'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();

    if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension || '')) {
      setError('Invalid file type. Supported: PDF, Word (.docx), PowerPoint (.pptx)');
      e.target.value = '';
      return;
    }

    // Validate file size (20MB max for documents)
    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 20MB.');
      e.target.value = '';
      return;
    }

    setUploadingDocument(true);
    setUploadProgress(0);
    setError('');

    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Generate unique filename
      const timestamp = Date.now();
      const extension = file.name.split('.').pop() || 'pdf';
      const fileName = `${user.id}/${timestamp}.${extension}`;

      // Upload to Supabase Storage (documents bucket)
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('documents')
        .createSignedUploadUrl(fileName);

      if (signedUrlError || !signedUrlData) {
        // Fallback: direct upload
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(fileName, file, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) {
          throw new Error(uploadError.message);
        }
        setUploadProgress(90);
      } else {
        // Upload using signed URL with progress
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const percent = Math.round((event.loaded / event.total) * 90);
              setUploadProgress(percent);
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error('Upload failed'));
            }
          });

          xhr.addEventListener('error', () => {
            reject(new Error('Network error during upload'));
          });

          xhr.open('PUT', signedUrlData.signedUrl);
          xhr.setRequestHeader('Content-Type', file.type);
          xhr.send(file);
        });
      }

      // Get public URL
      const { data: urlData } = supabase.storage.from('documents').getPublicUrl(fileName);

      setUploadProgress(95);

      // Create material record via API
      const materialTitle = file.name.replace(/\.[^/.]+$/, '');
      const detectedFileType = file.name.split('.').pop()?.toLowerCase() || 'pdf';
      const response = await fetch('/api/docs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: materialTitle,
          file_url: urlData.publicUrl,
          file_type: detectedFileType,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        await supabase.storage.from('documents').remove([fileName]);
        throw new Error(data.error || 'Failed to create material');
      }

      const data = await response.json();
      setUploadProgress(100);

      // Refresh materials list
      await fetchMaterials();
      await fetchSubscription();

      // Show output selection modal
      setPendingMaterial({ id: data.material.id, title: data.material.title });
      setShowOutputModal(true);
    } catch (err) {
      console.error('Document upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingDocument(false);
      e.target.value = '';
    }
  };

  const processMaterial = async (
    materialId: string,
    outputType: OutputType,
    difficulty?: DifficultyLevel,
    quantity?: number
  ) => {
    setProcessingMaterialId(materialId);
    setProcessingStatus('processing');
    setProgressType('document');
    setShowProgressModal(true);

    try {
      const response = await fetch(`/api/docs/${materialId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ outputType, difficulty, quantity }),
      });

      if (!response.ok) {
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          throw new Error(data.error || 'Processing failed');
        } catch {
          console.error('Server returned non-JSON response:', text.substring(0, 200));
          throw new Error('Server error. Check terminal for details.');
        }
      }

      // Successfully processed
      setProcessingStatus('completed');
      await fetchMaterials();

      // Auto-close modal after delay and navigate to material
      setTimeout(() => {
        setShowProgressModal(false);
        setProcessingMaterialId(null);
        setProcessingStatus('');
        // Switch to materials tab to show result
        setActiveTab('materials');
        // Navigate to the material
        router.push(`/docs/${materialId}`);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Processing failed');
      setProcessingStatus('failed');
    }
  };

  const handleOutputSelection = (options: GenerationOptions) => {
    if (pendingMaterial) {
      setShowOutputModal(false);
      processMaterial(
        pendingMaterial.id,
        options.outputType,
        options.difficulty,
        options.quantity
      );
      setPendingMaterial(null);
    }
  };

  const handleCancelOutputSelection = () => {
    setShowOutputModal(false);
    setPendingMaterial(null);
    // Switch to materials tab to show the uploaded file
    setActiveTab('materials');
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

  const getOutputTypeBadge = (outputType: OutputType | null) => {
    if (!outputType) return null;

    const styles: Record<string, { bg: string; label: string }> = {
      summary: { bg: 'bg-blue-100 text-blue-800', label: 'Summary' },
      flashcards: { bg: 'bg-purple-100 text-purple-800', label: 'Flashcards' },
      mcqs: { bg: 'bg-orange-100 text-orange-800', label: 'MCQs' },
      quiz: { bg: 'bg-emerald-100 text-emerald-800', label: 'Quiz' },
    };

    const style = styles[outputType];
    if (!style) return null;

    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${style.bg}`}>
        {style.label}
      </span>
    );
  };

  // Filter materials based on search query and output type filter
  const filteredMaterials = materials.filter((material) => {
    // Search filter - match title
    const matchesSearch = materialSearch === '' ||
      material.title.toLowerCase().includes(materialSearch.toLowerCase());

    // Output type filter
    const matchesFilter = materialFilter === 'all' ||
      material.output_type === materialFilter;

    return matchesSearch && matchesFilter;
  });

  // Get count of materials by output type
  const getFilterCount = (filter: OutputType | 'all') => {
    if (filter === 'all') return materials.length;
    return materials.filter(m => m.output_type === filter).length;
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
              <div className="w-8 h-8 bg-[#A855F7] rounded-lg flex items-center justify-center">
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
              {/* Profile Dropdown - Desktop only */}
              <div ref={dropdownRef} className="relative hidden md:block">
                <button
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-2 px-3 py-2 bg-white border border-[#E5E7EB] rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold
                    ${isProfileComplete ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {userEmail ? userEmail[0].toUpperCase() : '?'}
                  </span>
                  <span className="text-sm text-gray-600">
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
                                   focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent
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
                                   focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent
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
                                   focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent
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
                                   focus:outline-none focus:ring-2 focus:ring-[#A855F7] focus:border-transparent
                                   placeholder:text-gray-400"
                        />
                      </div>

                      <button
                        onClick={handleSaveProfile}
                        disabled={savingProfile}
                        className={`w-full py-2.5 rounded-lg text-sm font-medium transition-colors
                          ${savingProfile
                            ? 'bg-violet-300 text-white cursor-not-allowed'
                            : 'bg-[#A855F7] text-white hover:bg-[#9333EA]'
                          }`}
                      >
                        {savingProfile ? 'Saving...' : 'Save Profile'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Logout Button - Desktop only */}
              <button
                onClick={handleLogout}
                className="hidden md:block px-4 py-2 text-sm text-gray-600 border border-[#E5E7EB] rounded-lg hover:bg-gray-50 transition-colors"
              >
                Logout
              </button>

              {/* Mobile Hamburger Menu */}
              <MobileMenu isPremium={subscription?.plan !== 'free'} />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Upgrade Success Notification */}
        {showUpgradeSuccess && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-green-800">Welcome to Student Plan!</h3>
              <p className="text-sm text-green-700">Your upgrade was successful. You now have access to 15 lectures per month and all premium features.</p>
            </div>
            <button
              onClick={() => setShowUpgradeSuccess(false)}
              className="p-1 text-green-400 hover:text-green-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Greeting & Tagline */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0F172A] mb-2">
            Hi {profile?.full_name ? profile.full_name.split(' ')[0] : 'there'}!
          </h2>
          <p className="text-gray-500">Your AI-powered exam prep engine.</p>
        </div>

        {/* Free Trial Exhausted Banner */}
        {subscription?.plan === 'free' && !subscription?.canUploadMaterial && (
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-[#0F172A] mb-1">
                  You&apos;ve used all {subscription?.materialsLimit ?? 3} free materials
                </h3>
                <p className="text-gray-600 text-sm">
                  Upgrade to continue uploading and generating study materials.
                </p>
              </div>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-white bg-[#A855F7] hover:bg-[#9333EA] transition-colors whitespace-nowrap"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                Upgrade Now
              </Link>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm mb-6">
            {error}
          </div>
        )}

        {/* Two Entry Points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Upload Material Card */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 hover:shadow-lg hover:border-emerald-300 transition-all">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#0F172A] mb-1">Upload Material</h3>
                <p className="text-gray-500 text-sm">Upload documents and images to generate study resources</p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>PDF, Word, PowerPoint</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>AI-powered text extraction</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Summaries, flashcards, MCQs & quizzes</span>
              </div>
            </div>

            <label
              className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-medium transition-all cursor-pointer
                ${uploadingDocument || (subscription?.plan === 'free' && !subscription?.canUploadMaterial)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-emerald-500 text-white hover:bg-emerald-600'}`}
            >
              {uploadingDocument ? (
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload Document
                </>
              )}
              <input
                type="file"
                accept=".pdf,.docx,.pptx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation"
                onChange={handleDocumentUpload}
                disabled={uploadingDocument || (subscription?.plan === 'free' && !subscription?.canUploadMaterial)}
                className="hidden"
              />
            </label>
          </div>

          {/* Record Lecture Card */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 hover:shadow-lg hover:border-[#A855F7]/30 transition-all">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-14 h-14 bg-gradient-to-br from-[#A855F7] to-[#9333EA] rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#0F172A] mb-1">Record Lecture</h3>
                <p className="text-gray-500 text-sm">Upload audio recordings and convert them to study materials</p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-[#A855F7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>MP3, WAV, M4A, MP4 supported</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-[#A855F7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>AI transcription & note generation</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <svg className="w-4 h-4 text-[#A855F7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Up to 50MB per file</span>
              </div>
            </div>

            <label
              className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-medium transition-all cursor-pointer
                ${uploading || (subscription?.plan === 'free' && !subscription?.canUploadLecture)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-[#A855F7] text-white hover:bg-[#9333EA]'}`}
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
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload Audio
                </>
              )}
              <input
                type="file"
                accept=".mp3,.wav,.m4a,.mp4,audio/mpeg,audio/wav,audio/x-m4a,video/mp4"
                onChange={handleUpload}
                disabled={uploading || (subscription?.plan === 'free' && !subscription?.canUploadLecture)}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Your Study Materials */}
        <div className="bg-white rounded-xl border border-[#E5E7EB] overflow-hidden">
          {/* Header with Tabs */}
          <div className="px-4 sm:px-6 py-4 border-b border-[#E5E7EB]">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <h3 className="text-lg font-semibold text-[#0F172A]">Your Study Materials</h3>
              {/* Quota Display for Free Users */}
              {subscription?.plan === 'free' && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          subscription.materialsRemaining === 0
                            ? 'bg-red-500'
                            : subscription.materialsRemaining === 1
                            ? 'bg-yellow-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${(subscription.materialsUsed / subscription.materialsLimit) * 100}%` }}
                      />
                    </div>
                    <span className={`text-sm font-medium ${
                      subscription.materialsRemaining === 0
                        ? 'text-red-600'
                        : subscription.materialsRemaining === 1
                        ? 'text-yellow-600'
                        : 'text-gray-600'
                    }`}>
                      {subscription.materialsUsed}/{subscription.materialsLimit} used
                    </span>
                  </div>
                  {subscription.materialsRemaining === 0 && (
                    <Link
                      href="/pricing"
                      className="text-xs px-2.5 py-1 bg-[#A855F7] text-white rounded-full font-medium hover:bg-[#9333EA] transition-colors"
                    >
                      Upgrade
                    </Link>
                  )}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('materials')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${activeTab === 'materials'
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Materials
              </button>
              <button
                onClick={() => setActiveTab('recordings')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
                  ${activeTab === 'recordings'
                    ? 'bg-[#A855F7] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Recordings
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'materials' ? (
            /* Materials Tab */
            <>
              {/* Search and Filter Section */}
              {materials.length > 0 && (
                <div className="px-4 sm:px-6 py-4 border-b border-[#E5E7EB] space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search materials..."
                      value={materialSearch}
                      onChange={(e) => setMaterialSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-[#E5E7EB] rounded-lg text-sm
                               focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent
                               placeholder:text-gray-400"
                    />
                    {materialSearch && (
                      <button
                        onClick={() => setMaterialSearch('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Filter Chips */}
                  <div className="flex flex-wrap gap-2">
                    {([
                      { id: 'all' as const, label: 'All' },
                      { id: 'summary' as const, label: 'Summary' },
                      { id: 'flashcards' as const, label: 'Flashcards' },
                      { id: 'mcqs' as const, label: 'MCQs' },
                      { id: 'quiz' as const, label: 'Quiz' },
                    ]).map((filter) => {
                      const count = getFilterCount(filter.id);
                      const isActive = materialFilter === filter.id;

                      return (
                        <button
                          key={filter.id}
                          onClick={() => setMaterialFilter(filter.id)}
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5
                            ${isActive
                              ? 'bg-emerald-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                          {filter.label}
                          <span className={`text-xs ${isActive ? 'text-emerald-100' : 'text-gray-400'}`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Materials List */}
              {materials.length === 0 ? (
                <div className="p-8 sm:p-12 text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 mb-1">No materials yet</p>
                  <p className="text-sm text-gray-400">Upload your first PDF to get started!</p>
                </div>
              ) : filteredMaterials.length === 0 ? (
                <div className="p-8 sm:p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 mb-1">No materials found</p>
                  <p className="text-sm text-gray-400">
                    Try a different search term or filter
                  </p>
                  <button
                    onClick={() => {
                      setMaterialSearch('');
                      setMaterialFilter('all');
                    }}
                    className="mt-4 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Clear filters
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[#E5E7EB]">
                  {filteredMaterials.map((material) => (
                  <div
                    key={material.id}
                    onClick={() => material.status === 'completed' && router.push(`/docs/${material.id}`)}
                    className={`px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3
                      ${material.status === 'completed' ? 'cursor-pointer hover:bg-gray-50' : ''} transition-colors`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-[#0F172A] truncate">{material.title}</h4>
                          {material.status === 'completed' && getOutputTypeBadge(material.output_type)}
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(material.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {getStatusBadge(material.status)}
                      {material.status === 'completed' && (
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      )}
                    </div>
                  </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Recordings Tab */
            lectures.length === 0 ? (
              <div className="p-8 sm:p-12 text-center">
                <div className="w-16 h-16 bg-[#A855F7]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-[#A855F7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <p className="text-gray-500 mb-1">No recordings yet</p>
                <p className="text-sm text-gray-400">Upload your first audio file to get started!</p>
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
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-[#A855F7]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-[#A855F7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        </svg>
                      </div>
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
            )
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
                <div className="w-12 h-12 bg-[#A855F7]/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-[#A855F7] font-bold text-lg">1</span>
                </div>
                <h4 className="font-semibold text-[#0F172A] mb-2">Upload Content</h4>
                <p className="text-sm text-gray-500">
                  Upload lecture recordings, PDFs, slides, or images from your course
                </p>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 bg-[#A855F7]/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-[#A855F7] font-bold text-lg">2</span>
                </div>
                <h4 className="font-semibold text-[#0F172A] mb-2">AI Processing</h4>
                <p className="text-sm text-gray-500">
                  Our AI analyzes your content and generates notes, flashcards & quizzes
                </p>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center text-center p-4">
                <div className="w-12 h-12 bg-[#A855F7]/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-[#A855F7] font-bold text-lg">3</span>
                </div>
                <h4 className="font-semibold text-[#0F172A] mb-2">Ace Your Exams</h4>
                <p className="text-sm text-gray-500">
                  Study with AI-generated materials and test yourself with practice quizzes
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
        type={progressType}
      />

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        materialsUsed={subscription?.materialsUsed || 0}
        materialsLimit={subscription?.materialsLimit || 3}
      />

      {/* Output Selection Modal */}
      <OutputSelectionModal
        isOpen={showOutputModal}
        onClose={handleCancelOutputSelection}
        onSelect={handleOutputSelection}
        isProcessing={!!processingMaterialId}
        materialTitle={pendingMaterial?.title}
      />
    </main>
  );
}
