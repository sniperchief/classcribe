import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const PLAN_LIMITS = {
  free: 2,
  student: 15,
};

// GET /api/dashboard - Get all dashboard data in one request
export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Fetch all data in parallel
  const [lecturesResult, profileResult] = await Promise.all([
    supabase
      .from('lectures')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single(),
  ]);

  const lectures = lecturesResult.data || [];
  const profile = profileResult.data;

  // Calculate subscription info
  let plan: 'free' | 'student' = 'free';
  if (profile?.subscription_plan === 'student') {
    const endDate = profile.subscription_end_date ? new Date(profile.subscription_end_date) : null;
    if (endDate && endDate > new Date()) {
      plan = 'student';
    }
  }

  // Get usage count from profile (prevents gaming by deleting lectures)
  const now = new Date();
  let lecturesUsedThisMonth = profile?.lectures_used_this_month || 0;
  const usageResetDate = profile?.usage_reset_date ? new Date(profile.usage_reset_date) : null;

  // Check if usage should be reset (new month)
  if (usageResetDate) {
    const resetMonth = usageResetDate.getMonth();
    const resetYear = usageResetDate.getFullYear();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    if (currentYear > resetYear || (currentYear === resetYear && currentMonth > resetMonth)) {
      lecturesUsedThisMonth = 0;
    }
  }

  const lectureLimit = PLAN_LIMITS[plan];
  const lecturesRemaining = Math.max(0, lectureLimit - lecturesUsedThisMonth);

  return NextResponse.json({
    lectures,
    profile,
    email: user.email,
    subscription: {
      plan,
      lectureLimit,
      lecturesUsed: lecturesUsedThisMonth,
      lecturesRemaining,
      canUpload: lecturesRemaining > 0,
    },
  });
}
