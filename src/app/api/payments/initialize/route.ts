import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { rateLimit } from '@/lib/ratelimit';

// POST /api/payments/initialize - Initialize a Paystack payment
export async function POST(request: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit check (7 requests per minute)
  const rateLimitResult = await rateLimit(user.id, 'standard');
  if (!rateLimitResult.success) return rateLimitResult.response!;

  const body = await request.json();
  const { plan, billingCycle } = body;

  if (!plan || !billingCycle) {
    return NextResponse.json({ error: 'Missing plan or billing cycle' }, { status: 400 });
  }

  // Determine amount based on plan and currency
  // Currency detection would be done on frontend, passed here
  const currency = body.currency || 'NGN';

  let amount: number;
  if (billingCycle === 'yearly') {
    amount = currency === 'NGN' ? 2200000 : 7000; // In kobo/cents (₦22,000 or $70)
  } else {
    amount = currency === 'NGN' ? 220000 : 700; // In kobo/cents (₦2,200 or $7)
  }

  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!paystackSecretKey) {
    return NextResponse.json({ error: 'Payment not configured' }, { status: 500 });
  }

  try {
    const response = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: user.email,
        amount,
        currency,
        callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/payments/callback`,
        metadata: {
          user_id: user.id,
          plan,
          billing_cycle: billingCycle,
        },
      }),
    });

    const data = await response.json();

    if (!data.status) {
      throw new Error(data.message || 'Failed to initialize payment');
    }

    return NextResponse.json({
      authorization_url: data.data.authorization_url,
      reference: data.data.reference,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Payment initialization failed';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
