import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Plan limits
const FREE_MATERIALS_LIMIT = 3; // Lifetime limit for free users
const FREE_LECTURES_LIMIT = 1; // Lifetime limit for free users

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

  // Get total materials ever uploaded (lifetime for free users)
  const { count: totalMaterials } = await supabase
    .from('materials')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  // Get total lectures ever uploaded (lifetime for free users)
  const { count: totalLectures } = await supabase
    .from('lectures')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id);

  const materialsUsed = totalMaterials || 0;
  const materialsLimit = activePlan === 'free' ? FREE_MATERIALS_LIMIT : 999;
  const materialsRemaining = activePlan === 'free' ? Math.max(0, FREE_MATERIALS_LIMIT - materialsUsed) : 999;
  const canUploadMaterial = activePlan === 'student' || materialsUsed < FREE_MATERIALS_LIMIT;

  const lecturesUsed = totalLectures || 0;
  const lecturesLimit = activePlan === 'free' ? FREE_LECTURES_LIMIT : 999;
  const lecturesRemaining = activePlan === 'free' ? Math.max(0, FREE_LECTURES_LIMIT - lecturesUsed) : 999;
  const canUploadLecture = activePlan === 'student' || lecturesUsed < FREE_LECTURES_LIMIT;

  return NextResponse.json({
    plan: activePlan,
    // Material info (lifetime for free, unlimited for paid)
    materialsLimit,
    materialsUsed,
    materialsRemaining,
    canUploadMaterial,
    // Lecture info (lifetime for free, unlimited for paid)
    lecturesLimit,
    lecturesUsed,
    lecturesRemaining,
    canUploadLecture,
    subscriptionEndDate: profile?.subscription_end_date || null,
  });
}
