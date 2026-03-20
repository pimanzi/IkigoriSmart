import { supabase } from '@/lib/supabase';
import type { DashboardStats, RecentIPMEntry, RecentTutorialEntry, RecentFeedbackEntry, RecentPredictionEntry } from '@/types';

export async function fetchDashboardStats(): Promise<DashboardStats> {
  // ── fetch raw rows ────────────────────────────────────────────────────────

  const { data: allPredictions, error: predictionsError } = await supabase
    .from('predictions')
    .select('id, severity, risk_level, district, created_at, user_id')
    .order('created_at', { ascending: false });
  if (predictionsError) throw predictionsError;

  const { data: allProfiles, error: profilesError } = await supabase
    .from('profiles')
    .select('id, role, first_name, last_name, avatar, district');
  if (profilesError) throw profilesError;

  const { data: allFeedbacks, error: feedbacksError } = await supabase
    .from('feedback')
    .select('id, rating, comment, prediction_id, user_id, created_at')
    .order('created_at', { ascending: false });
  if (feedbacksError) throw feedbacksError;

  const { data: allIPM, error: ipmError } = await supabase
    .from('ipm_recommendations')
    .select('id, title_en, action_type, severity, risk_level, created_at')
    .order('created_at', { ascending: false });
  if (ipmError) throw ipmError;

  // ── KPI counts (JS, no count:exact) ──────────────────────────────────────

  const totalPredictions = allPredictions?.length ?? 0;
  const totalUsers       = allProfiles?.filter(p => p.role === 'Farmer').length ?? 0;
  const totalFeedbacks   = allFeedbacks?.length ?? 0;
  const totalIPM         = allIPM?.length ?? 0;

  // ── recent predictions with profile ──────────────────────────────────────

  const { data: recentPredictions, error: recentPredError } = await supabase
    .from('predictions')
    .select(`
      id,
      severity,
      risk_level,
      district,
      image_url,
      created_at,
      user_id,
      profile:profiles!user_id (
        id,
        first_name,
        last_name,
        avatar,
        district
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5);
  if (recentPredError) throw recentPredError;

  // ── recent feedbacks with profile + prediction ────────────────────────────

  const { data: recentFeedbacks, error: recentFeedError } = await supabase
    .from('feedback')
    .select(`
      id,
      comment,
      rating,
      created_at,
      user_id,
      prediction_id,
      profile:profiles!user_id (
        id,
        first_name,
        last_name,
        avatar
      ),
      prediction:predictions!prediction_id (
        id,
        severity,
        risk_level,
        district,
        image_url
      )
    `)
    .order('created_at', { ascending: false })
    .limit(5);
  if (recentFeedError) throw recentFeedError;

  // ── recent IPM — slice from already-fetched list ──────────────────────────

  const recentIPM: RecentIPMEntry[] = (allIPM?.slice(0, 3) ?? []) as RecentIPMEntry[];

  // ── recent tutorials ──────────────────────────────────────────────────────

  const { data: recentTutorials, error: tutorialsError } = await supabase
    .from('tutorials')
    .select('id, title, type, topic, duration, created_at')
    .order('created_at', { ascending: false })
    .limit(3);
  if (tutorialsError) throw tutorialsError;

  // ── aggregations from allPredictions ─────────────────────────────────────

  const severityBreakdown = ['Healthy', 'Early', 'Moderate', 'Severe'].map(severity => ({
    severity,
    count: allPredictions?.filter(p => p.severity === severity).length ?? 0,
  }));

  const riskBreakdown = ['Low', 'Medium', 'High'].map(risk_level => ({
    risk_level,
    count: allPredictions?.filter(p => p.risk_level === risk_level).length ?? 0,
  }));

  const severityByDistrict = ['Healthy', 'Early', 'Moderate', 'Severe'].map(severity => ({
    severity,
    musanze: allPredictions?.filter(p => p.severity === severity && p.district === 'Musanze').length ?? 0,
    nyabihu: allPredictions?.filter(p => p.severity === severity && p.district === 'Nyabihu').length ?? 0,
  }));

  // ── predictions over time (last 30 days) ─────────────────────────────────

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 30);

  const last30Days = allPredictions?.filter(p => new Date(p.created_at) >= cutoff) ?? [];

  const dateMap: Record<string, { musanze: number; nyabihu: number }> = {};
  last30Days.forEach(p => {
    const date = new Date(p.created_at).toISOString().split('T')[0];
    if (!dateMap[date]) dateMap[date] = { musanze: 0, nyabihu: 0 };
    if (p.district === 'Musanze') dateMap[date].musanze++;
    if (p.district === 'Nyabihu')  dateMap[date].nyabihu++;
  });

  const predictionsOverTime = Object.entries(dateMap)
    .map(([date, counts]) => ({ date, ...counts }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    totalPredictions,
    totalUsers,
    totalFeedbacks,
    totalIPM,
    severityBreakdown,
    riskBreakdown,
    severityByDistrict,
    predictionsOverTime,
    recentPredictions: (recentPredictions ?? []) as unknown as RecentPredictionEntry[],
    recentFeedbacks:   (recentFeedbacks  ?? []) as unknown as RecentFeedbackEntry[],
    recentIPM,
    recentTutorials:   (recentTutorials  ?? []) as RecentTutorialEntry[],
  };
}
