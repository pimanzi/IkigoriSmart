import { supabase } from '@/lib/supabase';
import type { Tutorial } from '@/types';

interface TutorialFilters {
  topic?: 'scan' | 'mln' | 'ipm' | 'weather';
  type?: 'video' | 'reading';
}

export async function fetchTutorials(filters?: TutorialFilters): Promise<Tutorial[]> {
  let query = supabase.from('tutorials').select('*').order('created_at', { ascending: false });

  if (filters?.topic) query = query.eq('topic', filters.topic);
  if (filters?.type) query = query.eq('type', filters.type);

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createTutorial(payload: Omit<Tutorial, 'id' | 'created_at'>): Promise<Tutorial> {
  const { data, error } = await supabase.from('tutorials').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateTutorial(id: string, payload: Partial<Tutorial>): Promise<Tutorial> {
  const { data, error } = await supabase.from('tutorials').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteTutorial(id: string): Promise<void> {
  const { error } = await supabase.from('tutorials').delete().eq('id', id);
  if (error) throw error;
}
