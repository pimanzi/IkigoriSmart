import { supabase } from '@/lib/supabase';
import type { Prediction } from '@/types';

interface PredictionFilters {
  district?: 'Musanze' | 'Nyabihu';
  severity?: 'Healthy' | 'Early' | 'Moderate' | 'Severe';
  risk_level?: 'Low' | 'Medium' | 'High';
  dateFrom?: string;
  dateTo?: string;
}

export async function fetchPredictions(filters?: PredictionFilters): Promise<Prediction[]> {
  let query = supabase.from('predictions').select('*, profile:profiles!user_id(first_name, last_name, avatar, district)').order('created_at', { ascending: false });

  if (filters?.district) query = query.eq('district', filters.district);
  if (filters?.severity) query = query.eq('severity', filters.severity);
  if (filters?.risk_level) query = query.eq('risk_level', filters.risk_level);
  if (filters?.dateFrom) query = query.gte('created_at', filters.dateFrom);
  if (filters?.dateTo) query = query.lte('created_at', filters.dateTo);

  const { data, error } = await query;
  if (error) throw error;
  return (data as Prediction[]) || [];
}
