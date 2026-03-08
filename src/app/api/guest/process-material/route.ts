import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  generateDocumentSummary,
  generateDocumentFlashcards,
  generateMCQs,
  generateQuiz
} from '@/lib/anthropic';
import type { OutputType, MCQ, TrueFalseQuestion, DifficultyLevel } from '@/lib/types';
import { randomUUID } from 'crypto';
import { rateLimit } from '@/lib/ratelimit';

// POST /api/guest/process-material - Process a document for guest users
export async function POST(request: NextRequest) {
  // Rate limit check (3 requests per hour for guest endpoints)
  const rateLimitResult = await rateLimit(undefined, 'guest');
  if (!rateLimitResult.success) return rateLimitResult.response!;

  let adminClient;

  try {
    adminClient = createAdminClient();
  } catch (error) {
    console.error('Admin client creation error:', error);
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string || 'Untitled Document';
    const outputType = (formData.get('outputType') as OutputType) || 'summary';
    const difficulty = (formData.get('difficulty') as DifficultyLevel) || 'medium';
    const quantityStr = formData.get('quantity') as string;
    const quantity = quantityStr ? parseInt(quantityStr, 10) : undefined;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate output type
    if (!['summary', 'flashcards', 'mcqs', 'quiz'].includes(outputType)) {
      return NextResponse.json({ error: 'Invalid output type' }, { status: 400 });
    }

    // Determine file type
    const documentTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];
    const imageTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const isDocument = documentTypes.includes(file.type) || ['pdf', 'doc', 'docx', 'ppt', 'pptx'].includes(fileExtension || '');
    const isImage = imageTypes.includes(file.type) || ['png', 'jpg', 'jpeg', 'webp'].includes(fileExtension || '');

    if (!isDocument && !isImage) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload PDF, DOC, DOCX, PPT, PPTX, or image.' },
        { status: 400 }
      );
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 50MB' }, { status: 400 });
    }

    // Generate unique token for this guest session
    const token = randomUUID();

    // Determine storage file type
    let fileType: 'pdf' | 'docx' | 'pptx' | 'image' = 'pdf';
    if (fileExtension === 'docx' || fileExtension === 'doc') {
      fileType = 'docx';
    } else if (fileExtension === 'pptx' || fileExtension === 'ppt') {
      fileType = 'pptx';
    } else if (isImage) {
      fileType = 'image';
    }

    // Upload to Supabase Storage
    const fileName = `guest/${token}/${Date.now()}.${fileExtension || 'pdf'}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await adminClient.storage
      .from('documents')
      .upload(fileName, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Get public URL
    const { data: { publicUrl } } = adminClient.storage
      .from('documents')
      .getPublicUrl(fileName);

    // Create guest material record
    const { error: insertError } = await adminClient
      .from('guest_materials')
      .insert({
        token,
        title,
        file_url: publicUrl,
        file_type: fileType,
        output_type: outputType,
        difficulty,
        quantity,
        status: 'processing',
      });

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json({ error: 'Failed to create material record' }, { status: 500 });
    }

    // Process in background (don't await)
    processGuestMaterial(token, buffer, fileType, outputType, difficulty, quantity, adminClient);

    return NextResponse.json({ token, message: 'Processing started' });
  } catch (error) {
    console.error('Guest process-material error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process' },
      { status: 500 }
    );
  }
}

async function processGuestMaterial(
  token: string,
  fileBuffer: Buffer,
  fileType: 'pdf' | 'docx' | 'pptx' | 'image',
  outputType: OutputType,
  difficulty: DifficultyLevel,
  quantity: number | undefined,
  adminClient: ReturnType<typeof createAdminClient>
) {
  try {
    // Extract text from document
    console.log(`[Guest Material] Extracting text for token ${token}...`);
    let extractedText = '';

    switch (fileType) {
      case 'pdf': {
        const { extractTextFromPDF } = await import('@/lib/pdf');
        const pdfResult = await extractTextFromPDF(fileBuffer);
        extractedText = pdfResult.text;
        console.log(`[Guest Material] PDF extracted: ${pdfResult.numPages} pages`);
        break;
      }
      case 'docx': {
        const { extractTextFromDocx } = await import('@/lib/docx');
        const docxResult = await extractTextFromDocx(fileBuffer);
        extractedText = docxResult.text;
        console.log(`[Guest Material] DOCX extracted: ${extractedText.length} chars`);
        break;
      }
      case 'pptx': {
        const { extractTextFromPptx } = await import('@/lib/pptx');
        const pptxResult = await extractTextFromPptx(fileBuffer);
        extractedText = pptxResult.text;
        console.log(`[Guest Material] PPTX extracted: ${pptxResult.slideCount} slides`);
        break;
      }
      case 'image': {
        // For images, we'd need OCR - for now, return an error
        await adminClient
          .from('guest_materials')
          .update({
            status: 'failed',
            error_message: 'Image processing is not yet supported. Please upload a PDF, DOC, or PPT file.',
          })
          .eq('token', token);
        return;
      }
    }

    // Validate extracted text
    if (extractedText.length < 50) {
      await adminClient
        .from('guest_materials')
        .update({
          status: 'failed',
          error_message: 'Could not extract enough text from the document. Please ensure it contains readable text.',
        })
        .eq('token', token);
      return;
    }

    // Update with extracted content
    await adminClient
      .from('guest_materials')
      .update({
        content: extractedText,
        status: 'generating',
      })
      .eq('token', token);

    // Generate content based on output type
    console.log(`[Guest Material] Generating ${outputType} for token ${token}...`);

    let generatedContent: string | null = null;
    let flashcardsData: { front: string; back: string }[] | null = null;
    let mcqsData: MCQ[] | null = null;
    let quizData: TrueFalseQuestion[] | null = null;

    switch (outputType) {
      case 'summary':
        generatedContent = await generateDocumentSummary(extractedText);
        console.log(`[Guest Material] Summary generated: ${generatedContent.length} chars`);
        break;

      case 'flashcards':
        flashcardsData = await generateDocumentFlashcards(extractedText, difficulty, quantity || 15);
        console.log(`[Guest Material] Flashcards generated: ${flashcardsData.length} cards`);
        break;

      case 'mcqs':
        mcqsData = await generateMCQs(extractedText, difficulty, quantity || 25);
        console.log(`[Guest Material] MCQs generated: ${mcqsData.length} questions`);
        break;

      case 'quiz':
        quizData = await generateQuiz(extractedText, difficulty, quantity || 25);
        console.log(`[Guest Material] Quiz generated: ${quizData.length} questions`);
        break;
    }

    // Mark as completed
    await adminClient
      .from('guest_materials')
      .update({
        generated_content: generatedContent,
        flashcards: flashcardsData,
        mcqs: mcqsData,
        quiz: quizData,
        status: 'completed',
      })
      .eq('token', token);

    console.log(`[Guest Material] Processing completed for token ${token}`);
  } catch (error) {
    console.error(`[Guest Material] Processing failed for token ${token}:`, error);
    await adminClient
      .from('guest_materials')
      .update({
        status: 'failed',
        error_message: error instanceof Error ? error.message : 'Processing failed',
      })
      .eq('token', token);
  }
}
