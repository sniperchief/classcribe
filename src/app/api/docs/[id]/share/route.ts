import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Generate a short unique share code
function generateShareCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// POST /api/docs/[id]/share - Create a share link for a material
export async function POST(
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

  // Verify the material belongs to the user and is completed
  const { data: material, error: materialError } = await supabase
    .from('materials')
    .select('id, status, title, output_type')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (materialError || !material) {
    return NextResponse.json({ error: 'Material not found' }, { status: 404 });
  }

  if (material.status !== 'completed') {
    return NextResponse.json(
      { error: 'Material must be completed before sharing' },
      { status: 400 }
    );
  }

  // Check if a share link already exists for this material
  const { data: existingLink } = await supabase
    .from('share_links')
    .select('share_code')
    .eq('material_id', id)
    .eq('user_id', user.id)
    .single();

  if (existingLink) {
    // Return existing share link
    const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/${existingLink.share_code}`;
    return NextResponse.json({
      shareCode: existingLink.share_code,
      shareUrl,
      isExisting: true,
    });
  }

  // Create new share link
  const shareCode = generateShareCode();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

  const { error: insertError } = await supabase
    .from('share_links')
    .insert({
      material_id: id,
      user_id: user.id,
      share_code: shareCode,
      expires_at: expiresAt.toISOString(),
    });

  if (insertError) {
    console.error('Error creating share link:', insertError);
    return NextResponse.json(
      { error: 'Failed to create share link' },
      { status: 500 }
    );
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/${shareCode}`;

  return NextResponse.json({
    shareCode,
    shareUrl,
    isExisting: false,
  });
}

// GET /api/docs/[id]/share - Get share link for a material
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

  const { data: shareLink } = await supabase
    .from('share_links')
    .select('share_code, view_count, created_at, expires_at')
    .eq('material_id', id)
    .eq('user_id', user.id)
    .single();

  if (!shareLink) {
    return NextResponse.json({ shareLink: null });
  }

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL}/share/${shareLink.share_code}`;

  return NextResponse.json({
    shareLink: {
      ...shareLink,
      shareUrl,
    },
  });
}

// DELETE /api/docs/[id]/share - Delete share link
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

  const { error: deleteError } = await supabase
    .from('share_links')
    .delete()
    .eq('material_id', id)
    .eq('user_id', user.id);

  if (deleteError) {
    return NextResponse.json(
      { error: 'Failed to delete share link' },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
