import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

const PREVIEW_LIMIT = 5; // Number of items to show without signup

// GET /api/share/[code] - Get shared content (public endpoint)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  const { code } = await params;
  const adminClient = createAdminClient();

  // Check if user is authenticated
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = !!user;

  // Get share link
  const { data: shareLink, error: linkError } = await adminClient
    .from('share_links')
    .select('*, materials(*)')
    .eq('share_code', code)
    .single();

  if (linkError || !shareLink) {
    return NextResponse.json({ error: 'Share link not found' }, { status: 404 });
  }

  // Check if expired
  if (new Date(shareLink.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Share link has expired' }, { status: 410 });
  }

  const material = shareLink.materials;

  if (!material || material.status !== 'completed') {
    return NextResponse.json({ error: 'Content not available' }, { status: 404 });
  }

  // Increment view count
  await adminClient
    .from('share_links')
    .update({ view_count: (shareLink.view_count || 0) + 1 })
    .eq('id', shareLink.id);

  // Prepare response based on authentication status
  const response: {
    title: string;
    outputType: string;
    createdAt: string;
    isAuthenticated: boolean;
    isPreview: boolean;
    totalCount: number;
    previewCount: number;
    flashcards?: { front: string; back: string }[];
    mcqs?: Array<{
      question: string;
      options: { label: string; text: string }[];
      correctAnswer: string;
      explanation: string;
    }>;
    quiz?: Array<{
      statement: string;
      correctAnswer: boolean;
      explanation: string;
    }>;
    summary?: string;
    sharedBy?: string;
  } = {
    title: material.title,
    outputType: material.output_type,
    createdAt: material.created_at,
    isAuthenticated,
    isPreview: !isAuthenticated,
    totalCount: 0,
    previewCount: PREVIEW_LIMIT,
  };

  // Return content based on output type
  switch (material.output_type) {
    case 'flashcards':
      const flashcards = material.flashcards || [];
      response.totalCount = flashcards.length;
      response.flashcards = isAuthenticated
        ? flashcards
        : flashcards.slice(0, PREVIEW_LIMIT);
      break;

    case 'mcqs':
      const mcqs = material.mcqs || [];
      response.totalCount = mcqs.length;
      response.mcqs = isAuthenticated
        ? mcqs
        : mcqs.slice(0, PREVIEW_LIMIT);
      break;

    case 'quiz':
      const quiz = material.quiz || [];
      response.totalCount = quiz.length;
      response.quiz = isAuthenticated
        ? quiz
        : quiz.slice(0, PREVIEW_LIMIT);
      break;

    case 'summary':
      const summary = material.generated_content || '';
      response.totalCount = 1;
      response.summary = isAuthenticated
        ? summary
        : summary.slice(0, 500) + (summary.length > 500 ? '...' : '');
      break;
  }

  return NextResponse.json(response);
}
