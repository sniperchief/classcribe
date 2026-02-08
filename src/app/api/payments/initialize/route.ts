import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
    amount = currency === 'NGN' ? 6500000 : 6000; // In kobo/cents (₦65,000 or $60)
  } else {
    amount = currency === 'NGN' ? 650000 : 600; // In kobo/cents (₦6,500 or $6)
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
