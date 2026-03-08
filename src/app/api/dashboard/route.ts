import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Lifetime limits for free users
const FREE_MATERIALS_LIMIT = 3;
const FREE_LECTURES_LIMIT = 1;

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
  const [lecturesResult, profileResult, materialsCountResult, lecturesCountResult] = await Promise.all([
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
    // Count total materials (lifetime)
    supabase
      .from('materials')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),
    // Count total lectures (lifetime)
    supabase
      .from('lectures')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id),
  ]);

  const lectures = lecturesResult.data || [];
  const profile = profileResult.data;
  const totalMaterials = materialsCountResult.count || 0;
  const totalLectures = lecturesCountResult.count || 0;

  // Calculate subscription info
  let plan: 'free' | 'student' = 'free';
  if (profile?.subscription_plan === 'student') {
    const endDate = profile.subscription_end_date ? new Date(profile.subscription_end_date) : null;
    if (endDate && endDate > new Date()) {
      plan = 'student';
    }
  }

  // Materials limits (lifetime for free users)
  const materialsUsed = totalMaterials;
  const materialsLimit = plan === 'free' ? FREE_MATERIALS_LIMIT : 999;
  const materialsRemaining = plan === 'free' ? Math.max(0, FREE_MATERIALS_LIMIT - materialsUsed) : 999;
  const canUploadMaterial = plan === 'student' || materialsUsed < FREE_MATERIALS_LIMIT;

  // Lectures limits (lifetime for free users)
  const lecturesUsed = totalLectures;
  const lecturesLimit = plan === 'free' ? FREE_LECTURES_LIMIT : 999;
  const lecturesRemaining = plan === 'free' ? Math.max(0, FREE_LECTURES_LIMIT - lecturesUsed) : 999;
  const canUploadLecture = plan === 'student' || lecturesUsed < FREE_LECTURES_LIMIT;

  return NextResponse.json({
    lectures,
    profile,
    email: user.email,
    subscription: {
      plan,
      // Materials (lifetime limits)
      materialsLimit,
      materialsUsed,
      materialsRemaining,
      canUploadMaterial,
      // Lectures (lifetime limits)
      lecturesLimit,
      lecturesUsed,
      lecturesRemaining,
      canUploadLecture,
    },
  });
}
