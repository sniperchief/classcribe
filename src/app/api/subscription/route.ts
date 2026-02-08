import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Plan limits
const PLAN_LIMITS = {
  free: 2,
  student: 15,
};

// GET /api/subscription - Get current user's subscription status and usage
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user's profile with subscription info
  const { data: profile } = await supabase
    .from('profiles')
    .select('subscription_plan, subscription_end_date')
    .eq('id', user.id)
    .single();

  // Determine active plan
  let activePlan = 'free';
  if (profile?.subscription_plan === 'student') {
    const endDate = profile.subscription_end_date ? new Date(profile.subscription_end_date) : null;
    if (endDate && endDate > new Date()) {
      activePlan = 'student';
    }
  }

  // Get lectures created this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const { count: lecturesThisMonth } = await supabase
    .from('lectures')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', startOfMonth.toISOString());

  const lectureLimit = PLAN_LIMITS[activePlan as keyof typeof PLAN_LIMITS];
  const lecturesUsed = lecturesThisMonth || 0;
  const lecturesRemaining = Math.max(0, lectureLimit - lecturesUsed);
  const canUpload = lecturesUsed < lectureLimit;

  return NextResponse.json({
    plan: activePlan,
    lectureLimit,
    lecturesUsed,
    lecturesRemaining,
    canUpload,
    subscriptionEndDate: profile?.subscription_end_date || null,
  });
}
