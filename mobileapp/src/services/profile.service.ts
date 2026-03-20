import { supabase } from '../lib/supabase';
import { ProfileUpdatePayload } from '../types';

export class ProfileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ProfileError';
  }
}

export async function updateProfile(
  profileId: string,
  payload: ProfileUpdatePayload
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({
      first_name:   payload.first_name,
      last_name:    payload.last_name,
      phone_number: payload.phone_number,
      district:     payload.district,
      updated_at:   new Date().toISOString(),
    })
    .eq('id', profileId);

  if (error) {
    throw new ProfileError(error.message);
  }

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      first_name: payload.first_name,
      last_name:  payload.last_name,
    },
  });

  if (authError) {
    throw new ProfileError(authError.message);
  }
}

export async function updateAvatar(
  profileId: string,
  avatarUrl: string
): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .update({ avatar: avatarUrl })
    .eq('id', profileId);

  if (error) {
    throw new ProfileError(error.message);
  }
}

export async function updatePassword(newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    throw new ProfileError(error.message);
  }
}

export async function fetchProfile(authId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('auth_id', authId)
    .single();

  if (error || !data) {
    throw new ProfileError('Profile not found');
  }

  return data;
}
