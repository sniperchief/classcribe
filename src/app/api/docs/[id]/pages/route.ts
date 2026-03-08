import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export interface PageInfo {
  pageNumber: number;
  preview: string; // First ~100 chars of the page
}

// GET /api/docs/[id]/pages - Get page/slide info for a material
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get the material
  const { data: material, error: fetchError } = await supabase
    .from('materials')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (fetchError || !material) {
    return NextResponse.json({ error: 'Material not found' }, { status: 404 });
  }

  try {
    // Download file from Supabase Storage
    const filePath = material.file_url.split('/storage/v1/object/public/documents/')[1];
    const { data: fileData, error: downloadError } = await adminClient.storage
      .from('documents')
      .download(filePath);

    if (downloadError || !fileData) {
      throw new Error('Failed to download file');
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    let pages: PageInfo[] = [];
    let totalPages = 0;
    let pageLabel = 'page'; // 'page', 'slide', or 'section'

    switch (material.file_type) {
      case 'pdf': {
        const { extractTextFromPDF } = await import('@/lib/pdf');
        const pdfResult = await extractTextFromPDF(fileBuffer);
        totalPages = pdfResult.numPages;
        pageLabel = 'page';
        pages = pdfResult.pages.map(p => ({
          pageNumber: p.pageNumber,
          preview: p.text.slice(0, 150) + (p.text.length > 150 ? '...' : '')
        }));
        break;
      }
      case 'docx': {
        const { extractTextFromDocx } = await import('@/lib/docx');
        const docxResult = await extractTextFromDocx(fileBuffer);
        totalPages = docxResult.sectionCount;
        pageLabel = 'section';
        pages = docxResult.sections.map(s => ({
          pageNumber: s.sectionNumber,
          preview: s.text.slice(0, 150) + (s.text.length > 150 ? '...' : '')
        }));
        break;
      }
      case 'pptx': {
        const { extractTextFromPptx } = await import('@/lib/pptx');
        const pptxResult = await extractTextFromPptx(fileBuffer);
        totalPages = pptxResult.slideCount;
        pageLabel = 'slide';
        pages = pptxResult.slides.map(s => ({
          pageNumber: s.slideNumber,
          preview: s.text.slice(0, 150) + (s.text.length > 150 ? '...' : '')
        }));
        break;
      }
      default:
        throw new Error(`Unsupported file type: ${material.file_type}`);
    }

    return NextResponse.json({
      totalPages,
      pageLabel,
      pages,
      fileType: material.file_type,
    });
  } catch (error) {
    console.error('Error getting page info:', error);
    return NextResponse.json(
      { error: 'Failed to get page information' },
      { status: 500 }
    );
  }
}
