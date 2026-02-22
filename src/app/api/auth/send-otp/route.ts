import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const supabase = await createClient();

    // Generate a 6-digit OTP
    const otp = generateOTP();

    // Set expiration to 30 minutes from now
    const expiresAt = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    // Delete any existing unused codes for this email
    await supabase
      .from('verification_codes')
      .delete()
      .eq('email', email)
      .eq('used', false);

    // Insert new verification code
    const { error: insertError } = await supabase
      .from('verification_codes')
      .insert({
        email,
        code: otp,
        expires_at: expiresAt,
      });

    if (insertError) {
      console.error('Failed to store OTP:', insertError);
      return NextResponse.json({ error: 'Failed to generate code' }, { status: 500 });
    }

    // Send email with OTP
    const { error: emailError } = await resend.emails.send({
      from: 'Classcribe <noreply@classcribe.app>',
      to: email,
      subject: 'Your Classcribe Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #0F172A; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #A855F7; margin: 0; font-size: 28px;">Classcribe</h1>
            </div>

            <div style="background: #F8FAFC; border-radius: 12px; padding: 30px; text-align: center;">
              <h2 style="margin: 0 0 10px 0; font-size: 24px;">Verify your email</h2>
              <p style="color: #64748B; margin: 0 0 25px 0;">Enter this code to complete your registration:</p>

              <div style="background: #FFFFFF; border: 2px solid #E5E7EB; border-radius: 8px; padding: 20px; margin: 20px 0;">
                <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #A855F7;">${otp}</span>
              </div>

              <p style="color: #64748B; font-size: 14px; margin: 20px 0 0 0;">
                This code expires in <strong>30 minutes</strong>.
              </p>
            </div>

            <div style="text-align: center; margin-top: 30px; color: #94A3B8; font-size: 12px;">
              <p>If you didn't request this code, you can safely ignore this email.</p>
              <p>&copy; ${new Date().getFullYear()} Classcribe. All rights reserved.</p>
            </div>
          </body>
        </html>
      `,
    });

    if (emailError) {
      console.error('Failed to send email:', emailError);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Send OTP error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
