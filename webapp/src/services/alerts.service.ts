import { supabase } from '@/lib/supabase';
import type { Alert } from '@/types';

export async function fetchAlerts(): Promise<Alert[]> {
  const { data, error } = await supabase
    .from('alerts')
    .select(`
      *,
      profile:profiles(id, first_name, last_name, email, avatar)
    `)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function fetchAlertById(id: string): Promise<Alert> {
  const { data, error } = await supabase
    .from('alerts')
    .select(`
      *,
      profile:profiles(id, first_name, last_name, email, avatar)
    `)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function createAlert(payload: Omit<Alert, 'id' | 'created_at'>): Promise<Alert> {
  const { data, error } = await supabase.from('alerts').insert(payload).select().single();
  if (error) throw error;
  return data;
}

export async function updateAlert(id: string, payload: Partial<Alert>): Promise<Alert> {
  const { data, error } = await supabase.from('alerts').update(payload).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function toggleAlertActive(id: string, is_active: boolean): Promise<Alert> {
  const { data, error } = await supabase.from('alerts').update({ is_active }).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteAlert(id: string): Promise<void> {
  const { error } = await supabase.from('alerts').delete().eq('id', id);
  if (error) throw error;
}
