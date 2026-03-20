import { supabase } from '../lib/supabase';
import { IPMRecommendation } from '../types';

/**
 * Fetches IPM recommendations from Supabase.
 * Returns rows where (severity = severity OR severity = 'All')
 * AND (risk_level = riskLevel OR risk_level = 'All').
 * Ordered by action_type ascending: immediate → monitor → preventive.
 */
export async function fetchIPMRecommendations(
  severity: string,
  riskLevel: string
): Promise<IPMRecommendation[]> {
  const { data, error } = await supabase
    .from('ipm_recommendations')
    .select('*')
    .in('severity', [severity, 'All'])
    .in('risk_level', [riskLevel, 'All'])
    .order('action_type');

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as IPMRecommendation[];
}
