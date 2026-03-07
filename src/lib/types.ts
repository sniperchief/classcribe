export type LectureStatus =
  | 'uploading'
  | 'transcribing'
  | 'generating'
  | 'completed'
  | 'failed';

export type MaterialStatus =
  | 'uploading'
  | 'processing'
  | 'generating'
  | 'completed'
  | 'failed';

export type MaterialType = 'pdf' | 'docx' | 'pptx' | 'image';

export type OutputType = 'summary' | 'flashcards' | 'mcqs' | 'quiz';

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export interface MCQOption {
  label: string;
  text: string;
}

export interface MCQ {
  question: string;
  options: MCQOption[];
  correctAnswer: string;
  explanation: string;
}

export interface TrueFalseQuestion {
  statement: string;
  correctAnswer: boolean;
  explanation: string;
}

export interface Lecture {
  id: string;
  user_id: string;
  title: string;
  audio_url: string;
  audio_duration: number | null;
  transcript: string | null;
  notes: string | null;
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

export interface Material {
  id: string;
  user_id: string;
  title: string;
  file_url: string;
  file_type: MaterialType;
  output_type: OutputType | null;
  content: string | null;
  generated_content: string | null;
  flashcards: { front: string; back: string }[] | null;
  mcqs: MCQ[] | null;
  quiz: TrueFalseQuestion[] | null;
  status: MaterialStatus;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}
