import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// POST /api/guest/claim-material - Claim a guest material after signup
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const adminClient = createAdminClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { token } = await request.json();

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 });
  }

  // Get the guest material
  const { data: guestMaterial, error: fetchError } = await adminClient
    .from('guest_materials')
    .select('*')
    .eq('token', token)
    .is('claimed_by', null)
    .single();

  if (fetchError || !guestMaterial) {
    return NextResponse.json({ error: 'Guest material not found or already claimed' }, { status: 404 });
  }

  // Create a new material for the user
  const { data: newMaterial, error: insertError } = await adminClient
    .from('materials')
    .insert({
      user_id: user.id,
      title: guestMaterial.title,
      file_url: guestMaterial.file_url,
      file_type: guestMaterial.file_type,
      output_type: guestMaterial.output_type,
      content: guestMaterial.content,
      generated_content: guestMaterial.generated_content,
      flashcards: guestMaterial.flashcards,
      mcqs: guestMaterial.mcqs,
      quiz: guestMaterial.quiz,
      status: guestMaterial.status,
      error_message: guestMaterial.error_message,
    })
    .select()
    .single();

  if (insertError || !newMaterial) {
    console.error('Failed to create material:', insertError);
    return NextResponse.json({ error: 'Failed to claim material' }, { status: 500 });
  }

  // Mark guest material as claimed
  await adminClient
    .from('guest_materials')
    .update({ claimed_by: user.id })
    .eq('token', token);

  return NextResponse.json({
    success: true,
    materialId: newMaterial.id,
    message: 'Material claimed successfully'
  });
}
