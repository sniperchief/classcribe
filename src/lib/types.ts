export type LectureStatus =
  | 'uploading'
  | 'transcribing'
  | 'generating'
  | 'completed'
  | 'failed';

export interface Flashcard {
  front: string;
  back: string;
}

export interface Lecture {
  id: string;
  user_id: string;
  title: string;
  audio_url: string;
  audio_duration: number | null;
  transcript: string | null;
  notes: string | null;
  flashcards: Flashcard[] | null;
  status: LectureStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  country: string | null;
  university: string | null;
  course_of_study: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}
