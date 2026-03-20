import { supabase } from '@/lib/supabase';
import type { Feedback } from '@/types';

interface FeedbackFilters {
  rating?: number;
  district?: 'Musanze' | 'Nyabihu';
}

export async function fetchFeedbacks(filters?: FeedbackFilters): Promise<Feedback[]> {
  let query = supabase.from('feedback').select(`*, profile:profiles!user_id(first_name, last_name, avatar, email, phone_number), prediction:predictions!prediction_id(image_url, severity, risk_level, temperature_c, humidity_pct, rainfall_mm, district)`).order('created_at', { ascending: false });

  if (filters?.rating) query = query.eq('rating', filters.rating);

  const { data, error } = await query;
  if (error) throw error;

  let result = (data as Feedback[]) || [];

  if (filters?.district) {
    result = result.filter(f => f.prediction?.district === filters.district);
  }

  return result;
}
