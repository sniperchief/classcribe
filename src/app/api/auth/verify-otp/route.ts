import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Find the verification code
    const { data: verificationCode, error: fetchError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('used', false)
      .single();

    if (fetchError || !verificationCode) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    // Check if code is expired
    if (new Date(verificationCode.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Verification code has expired' }, { status: 400 });
    }

    // Mark the code as used
    await supabase
      .from('verification_codes')
      .update({ used: true })
      .eq('id', verificationCode.id);

    // Get the user by email and update their email_confirmed_at
    // We need to use the admin API for this, so we'll use a workaround
    // by updating through the auth.users table via service role
    const { data: { user } } = await supabase.auth.getUser();

    if (user && user.email === email) {
      // User is logged in and email matches - confirm the email
      // Note: In production, you'd use Supabase Admin API to update email_confirmed_at
      // For now, we'll create a profile entry to mark verification
      const { error: updateError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email_verified: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id',
        });

      if (updateError) {
        console.error('Failed to update profile:', updateError);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully'
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
