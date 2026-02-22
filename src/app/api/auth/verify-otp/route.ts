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

    // Get the user by email and update their email_verified status
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.email !== email) {
      return NextResponse.json({ error: 'User not found or email mismatch' }, { status: 400 });
    }

    // Update profile to mark email as verified
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
      return NextResponse.json({ error: 'Failed to verify email. Please try again.' }, { status: 500 });
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
