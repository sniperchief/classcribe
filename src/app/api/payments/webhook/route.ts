import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import crypto from 'crypto';

// POST /api/payments/webhook - Handle Paystack webhooks
export async function POST(request: NextRequest) {
  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!paystackSecretKey) {
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });
  }

  // Verify webhook signature
  const signature = request.headers.get('x-paystack-signature');
  const body = await request.text();

  const hash = crypto
    .createHmac('sha512', paystackSecretKey)
    .update(body)
    .digest('hex');

  if (hash !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const event = JSON.parse(body);

  const adminClient = createAdminClient();

  try {
    switch (event.event) {
      case 'charge.success': {
        // Handle successful charge (for recurring payments)
        const { metadata, customer } = event.data;

        if (metadata?.user_id && metadata?.billing_cycle) {
          const startDate = new Date();
          const endDate = new Date(startDate);

          if (metadata.billing_cycle === 'yearly') {
            endDate.setFullYear(endDate.getFullYear() + 1);
          } else {
            endDate.setMonth(endDate.getMonth() + 1);
          }

          await adminClient
            .from('profiles')
            .update({
              subscription_plan: metadata.plan || 'student',
              subscription_end_date: endDate.toISOString(),
              paystack_customer_code: customer.customer_code,
            })
            .eq('id', metadata.user_id);
        }
        break;
      }

      case 'subscription.disable': {
        // Handle subscription cancellation
        const customerCode = event.data.customer.customer_code;

        await adminClient
          .from('profiles')
          .update({
            subscription_plan: 'free',
          })
          .eq('paystack_customer_code', customerCode);
        break;
      }

      case 'invoice.payment_failed': {
        // Handle failed payment - could send notification or downgrade
        const customerCode = event.data.customer.customer_code;

        // Optionally downgrade or notify user
        console.log('Payment failed for customer:', customerCode);
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
