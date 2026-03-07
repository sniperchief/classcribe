import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/materials/[id] - Get a single material
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: material, error } = await supabase
    .from('materials')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (error || !material) {
    return NextResponse.json({ error: 'Material not found' }, { status: 404 });
  }

  return NextResponse.json({ material });
}

// DELETE /api/materials/[id] - Delete a material
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get the material first to delete the file
  const { data: material } = await supabase
    .from('materials')
    .select('file_url')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (material?.file_url) {
    // Extract file path and delete from storage
    const filePath = material.file_url.split('/storage/v1/object/public/documents/')[1];
    if (filePath) {
      await supabase.storage.from('documents').remove([filePath]);
    }
  }

  // Delete the material record
  const { error } = await supabase
    .from('materials')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
