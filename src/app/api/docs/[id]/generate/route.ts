import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
// Dynamic imports for document extractors (to avoid loading browser-only libs on server)
import {
  generateDocumentSummary,
  generateDocumentFlashcards,
  generateMCQs,
  generateQuiz
} from '@/lib/anthropic';
import type { OutputType, MCQ, TrueFalseQuestion } from '@/lib/types';

// Retry helper for external API calls
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000,
  stepName: string = 'operation'
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`[${stepName}] Attempt ${attempt + 1}/${maxRetries}...`);
      }
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      const isNetworkError =
        lastError.message.includes('fetch failed') ||
        lastError.message.includes('ECONNRESET') ||
        lastError.message.includes('ETIMEDOUT') ||
        lastError.message.includes('ENOTFOUND') ||
        lastError.message.includes('EAI_AGAIN') ||
        lastError.message.includes('Connect Timeout') ||
        lastError.message.includes('socket hang up');

      console.error(`[${stepName}] Attempt ${attempt + 1} failed:`, lastError.message);

      if (!isNetworkError || attempt === maxRetries - 1) {
        throw lastError;
      }

      const delay = Math.min(baseDelay * Math.pow(2, attempt), 30000);
      console.log(`[${stepName}] Retrying after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

// POST /api/materials/[id]/process - Process a material (extract text + generate based on output type)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const adminClient = createAdminClient();

  // Get options from request body
  let outputType: OutputType = 'summary';
  let difficulty: 'easy' | 'medium' | 'hard' = 'medium';
  let quantity: number | undefined;

  try {
    const body = await request.json();
    if (body.outputType && ['summary', 'flashcards', 'mcqs', 'quiz'].includes(body.outputType)) {
      outputType = body.outputType;
    }
    if (body.difficulty && ['easy', 'medium', 'hard'].includes(body.difficulty)) {
      difficulty = body.difficulty;
    }
    if (body.quantity && typeof body.quantity === 'number') {
      // Enforce max limits
      if (outputType === 'flashcards') {
        quantity = Math.min(Math.max(body.quantity, 5), 30);
      } else {
        quantity = Math.min(Math.max(body.quantity, 10), 100);
      }
    }
  } catch {
    // Default values if no body provided
  }

  console.log(`[Process] Output type: ${outputType}, Difficulty: ${difficulty}, Quantity: ${quantity || 'default'}`);

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get the material
  console.log(`[Process] Starting processing for material ${id}`);
  const { data: material, error: fetchError } = await supabase
    .from('materials')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !material) {
    return NextResponse.json({ error: 'Material not found' }, { status: 404 });
  }

  if (material.status === 'completed') {
    return NextResponse.json({ error: 'Material already processed' }, { status: 400 });
  }

  // Get user's subscription plan
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_plan, subscription_end_date, lectures_used_this_month, usage_reset_date')
    .eq('id', user.id)
    .single();

  let userPlan: 'free' | 'student' = 'free';
  if (profile?.subscription_plan === 'student') {
    const endDate = profile.subscription_end_date ? new Date(profile.subscription_end_date) : null;
    if (endDate && endDate > new Date()) {
      userPlan = 'student';
    }
  }

  try {
    // Update status to processing
    console.log('[Process] Step 1: Setting status to processing...');
    await supabase
      .from('materials')
      .update({ status: 'processing', updated_at: new Date().toISOString() })
      .eq('id', id);

    // Download file from Supabase Storage
    console.log('[Process] Step 2: Downloading file...');
    const filePath = material.file_url.split('/storage/v1/object/public/documents/')[1];
    const { data: fileData, error: downloadError } = await adminClient.storage
      .from('documents')
      .download(filePath);

    if (downloadError || !fileData) {
      throw new Error('Failed to download file: ' + (downloadError?.message || 'No data'));
    }

    // Convert to buffer
    const arrayBuffer = await fileData.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);
    console.log(`[Process] File downloaded: ${fileBuffer.length} bytes`);

    // Extract text based on file type
    let extractedText = '';

    console.log(`[Process] Step 3: Extracting text from ${material.file_type.toUpperCase()}...`);

    switch (material.file_type) {
      case 'pdf': {
        const { extractTextFromPDF } = await import('@/lib/pdf');
        const pdfResult = await extractTextFromPDF(fileBuffer);
        extractedText = pdfResult.text;
        console.log(`[Process] PDF extracted: ${pdfResult.numPages} pages, ${extractedText.length} chars`);
        break;
      }
      case 'docx': {
        const { extractTextFromDocx } = await import('@/lib/docx');
        const docxResult = await extractTextFromDocx(fileBuffer);
        extractedText = docxResult.text;
        console.log(`[Process] Word document extracted: ${extractedText.length} chars`);
        break;
      }
      case 'pptx': {
        const { extractTextFromPptx } = await import('@/lib/pptx');
        const pptxResult = await extractTextFromPptx(fileBuffer);
        extractedText = pptxResult.text;
        console.log(`[Process] PowerPoint extracted: ${pptxResult.slideCount} slides, ${extractedText.length} chars`);
        break;
      }
      default:
        throw new Error(`Unsupported file type: ${material.file_type}`);
    }

    // Validate extracted text
    const minTextLength = 50;
    if (extractedText.length < minTextLength) {
      throw new Error(
        'Could not extract enough text from the document. Please ensure the file contains readable text.'
      );
    }

    // Save extracted content and update status
    console.log('[Process] Step 4: Saving extracted content...');
    await supabase
      .from('materials')
      .update({
        content: extractedText,
        output_type: outputType,
        status: 'generating',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    // Generate content based on output type
    console.log(`[Process] Step 5: Generating ${outputType} with Claude...`);

    let generatedContent: string | null = null;
    let flashcardsData: { front: string; back: string }[] | null = null;
    let mcqsData: MCQ[] | null = null;
    let quizData: TrueFalseQuestion[] | null = null;

    switch (outputType) {
      case 'summary':
        generatedContent = await withRetry(
          () => generateDocumentSummary(extractedText),
          5,
          3000,
          'Generate summary'
        );
        console.log(`[Process] Summary generated: ${generatedContent.length} chars`);
        break;

      case 'flashcards':
        flashcardsData = await withRetry(
          () => generateDocumentFlashcards(extractedText, difficulty, quantity || 15),
          5,
          3000,
          'Generate flashcards'
        );
        console.log(`[Process] Flashcards generated: ${flashcardsData.length} cards`);
        break;

      case 'mcqs':
        mcqsData = await withRetry(
          () => generateMCQs(extractedText, difficulty, quantity || 25),
          5,
          3000,
          'Generate MCQs'
        );
        console.log(`[Process] MCQs generated: ${mcqsData.length} questions`);
        break;

      case 'quiz':
        quizData = await withRetry(
          () => generateQuiz(extractedText, difficulty, quantity || 25),
          5,
          3000,
          'Generate quiz'
        );
        console.log(`[Process] Quiz generated: ${quizData.length} questions`);
        break;
    }

    // Save generated content and mark as completed
    console.log('[Process] Step 6: Saving generated content and marking as completed...');
    await supabase
      .from('materials')
      .update({
        generated_content: generatedContent,
        flashcards: flashcardsData,
        mcqs: mcqsData,
        quiz: quizData,
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', id);

    // Increment usage counter for free users
    if (userPlan === 'free') {
      console.log('[Process] Step 7: Updating usage counter...');
      const today = new Date();
      const resetDate = profile?.usage_reset_date ? new Date(profile.usage_reset_date) : null;

      let newUsageCount = (profile?.lectures_used_this_month || 0) + 1;

      if (resetDate) {
        const resetMonth = resetDate.getMonth();
        const resetYear = resetDate.getFullYear();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();

        if (currentYear > resetYear || (currentYear === resetYear && currentMonth > resetMonth)) {
          newUsageCount = 1;
        }
      }

      await supabase
        .from('profiles')
        .update({
          lectures_used_this_month: newUsageCount,
          usage_reset_date: today.toISOString().split('T')[0],
        })
        .eq('id', user.id);
    }

    console.log('[Process] Processing completed successfully!');

    return NextResponse.json({
      success: true,
      material: {
        id,
        content: extractedText,
        output_type: outputType,
        generated_content: generatedContent,
        flashcards: flashcardsData,
        status: 'completed',
      },
    });
  } catch (error) {
    console.error('Processing error:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    let userMessage = errorMessage;
    if (errorMessage.includes('fetch failed') ||
        errorMessage.includes('ECONNRESET') ||
        errorMessage.includes('ETIMEDOUT')) {
      userMessage = 'Network connection error. Please try again.';
    } else if (errorMessage.includes('extract')) {
      userMessage = 'Failed to extract text from document. Please ensure it contains readable text.';
    } else if (errorMessage.includes('Claude') || errorMessage.includes('Anthropic')) {
      userMessage = 'Summary generation failed. Please try again.';
    }

    try {
      await supabase
        .from('materials')
        .update({
          status: 'failed',
          error_message: userMessage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
    } catch (updateError) {
      console.error('Failed to update material status:', updateError);
    }

    return NextResponse.json({ error: userMessage }, { status: 500 });
  }
}
