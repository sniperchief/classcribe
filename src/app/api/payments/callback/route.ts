import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET /api/payments/callback - Handle Paystack callback after payment
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const reference = searchParams.get('reference');

  if (!reference) {
    return NextResponse.redirect(new URL('/pricing?error=missing_reference', request.url));
  }

  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!paystackSecretKey) {
    return NextResponse.redirect(new URL('/pricing?error=payment_not_configured', request.url));
  }

  try {
    // Verify the transaction
    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
      },
    });

    const data = await response.json();

    if (!data.status || data.data.status !== 'success') {
      return NextResponse.redirect(new URL('/pricing?error=payment_failed', request.url));
    }

    // Extract metadata
    const { user_id, plan, billing_cycle } = data.data.metadata;

    // Calculate subscription end date
    const now = new Date();
    let endDate: Date;

    if (billing_cycle === 'yearly') {
      endDate = new Date(now.setFullYear(now.getFullYear() + 1));
    } else {
      endDate = new Date(now.setMonth(now.getMonth() + 1));
    }

    // Update user's subscription in database
    const adminClient = createAdminClient();

    const { error: updateError } = await adminClient
      .from('profiles')
      .update({
        subscription_plan: plan,
        subscription_start_date: new Date().toISOString(),
        subscription_end_date: endDate.toISOString(),
        paystack_customer_code: data.data.customer.customer_code,
      })
      .eq('id', user_id);

    if (updateError) {
      console.error('Failed to update subscription:', updateError);
      return NextResponse.redirect(new URL('/pricing?error=update_failed', request.url));
    }

    // Redirect to dashboard with success message
    return NextResponse.redirect(new URL('/dashboard?subscription=success', request.url));
  } catch (error) {
    console.error('Payment callback error:', error);
    return NextResponse.redirect(new URL('/pricing?error=verification_failed', request.url));
  }
}
