# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev      # Start development server (Next.js)
npm run build    # Production build
npm run start    # Run production build
npm run lint     # ESLint checks
```

## Architecture Overview

Classcribe is an AI-powered study notes generator built with Next.js 16 (App Router), TypeScript, Tailwind CSS, and Supabase.

### Core Processing Flows

**Lecture Processing:**
1. User uploads audio (MP3, WAV, M4A, MP4)
2. Deepgram transcribes using `nova-2-meeting` model (optimized for classroom audio with diarization)
3. Claude generates structured notes from transcript
4. Results stored in Supabase `lectures` table

**Material Processing:**
1. User uploads document (PDF, DOCX, PPTX)
2. Text extracted via mammoth (DOCX), pdf-parse (PDF), or pptx-parser (PPTX)
3. Claude generates output based on selected type (summary, flashcards, MCQs, quiz)
4. Results stored in Supabase `materials` table

### Key Directories

- `src/app/api/` - API routes (lectures, materials, auth, payments, uploads)
- `src/lib/` - Core utilities (anthropic.ts for AI generation, deepgram.ts for transcription, pdf.ts/docx.ts/pptx.ts for document parsing)
- `src/lib/supabase/` - Supabase clients (client.ts, server.ts, admin.ts)
- `src/components/` - React components (landing/, modals, providers)

### Authentication Flow

Middleware (`src/middleware.ts`) enforces:
1. Unauthenticated users redirected to `/login` from protected routes
2. Unverified email users redirected to `/verify-email` (OTP verification)
3. Users without onboarding redirected to `/onboarding`
4. Protected paths: `/dashboard`, `/lectures`, `/settings`

### Database Tables

- `lectures` - Audio lectures with transcript, notes, status
- `materials` - Documents with extracted content, generated output
- `profiles` - User profile, onboarding status, subscription info
- `verification_codes` - OTP codes for email verification

### Status States

Lectures: `uploading` → `transcribing` → `generating` → `completed` | `failed`
Materials: `uploading` → `processing` → `generating` → `completed` | `failed`

### External Services

- **Supabase** - Database, auth, storage
- **Anthropic Claude** - Note generation, summaries, flashcards, quizzes
- **Deepgram** - Audio transcription
- **Paystack** - Payment processing
- **Resend** - Transactional emails (OTP)

### Configuration Notes

- Server actions have 50MB body size limit (next.config.js)
- TypeScript strict mode enabled
- Path alias: `@/` maps to `src/`
- API routes use retry logic (3 retries with exponential backoff) for external service calls

### Subscription Tiers

- Free: 2 lectures/month, notes only
- Student: 15 lectures/month, notes + flashcards + practice questions

### Environment Variables Required

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
ANTHROPIC_API_KEY
DEEPGRAM_API_KEY
PAYSTACK_SECRET_KEY
RESEND_API_KEY
NEXT_PUBLIC_APP_URL
```
