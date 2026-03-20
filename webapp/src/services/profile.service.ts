import { supabase } from '@/lib/supabase';
import type { Profile } from '@/types';

export async function fetchAdminProfile(authId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('auth_id', authId).single();
  if (error) throw error;
  return data;
}

export async function updateAdminProfile(profileId: string, payload: Partial<Profile>): Promise<Profile> {
  const { data, error } = await supabase.from('profiles').update(payload).eq('id', profileId).select().single();
  if (error) throw error;

  if (payload.first_name || payload.last_name) {
    await supabase.auth.updateUser({
      data: {
        first_name: payload.first_name,
        last_name: payload.last_name,
      },
    });
  }

  return data;
}

export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}
