import { supabase } from '@/lib/supabase';
import type { IPMRecommendation } from '@/types';

interface IPMFilters {
  severity?: string;
  risk_level?: string;
  action_type?: 'immediate' | 'monitor' | 'preventive';
}

export async function fetchIPMRecommendations(filters?: IPMFilters): Promise<IPMRecommendation[]> {
  let query = supabase.from('ipm_recommendations').select('*').order('created_at', { ascending: false });

  if (filters?.severity) query = query.eq('severity', filters.severity);
  if (filters?.risk_level) query = query.eq('risk_level', filters.risk_level);
  if (filters?.action_type) query = query.eq('action_type', filters.action_type);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createIPMRecommendation(payload: Omit<IPMRecommendation, 'id' | 'created_at'>): Promise<IPMRecommendation> {
  const { data, error } = await supabase.from('ipm_recommendations').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateIPMRecommendation(id: string, payload: Partial<IPMRecommendation>): Promise<IPMRecommendation> {
  const { data, error } = await supabase.from('ipm_recommendations').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteIPMRecommendation(id: string): Promise<void> {
  const { error } = await supabase.from('ipm_recommendations').delete().eq('id', id);
  if (error) throw error;
}
