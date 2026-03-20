import { supabase } from '../lib/supabase';
import { PredictionPayload, SavedPrediction } from '../types';

export class PredictionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PredictionError';
  }
}

/**
 * Saves a prediction record to Supabase public.predictions.
 *
 * @param payload  PredictionPayload where user_id is public.profiles.id — NOT auth.uid().
 *                 The predictions table has a FK referencing public.profiles(id).
 * @returns        The inserted row id as a string.
 */
export async function savePrediction(payload: PredictionPayload): Promise<string> {
  const { data, error } = await supabase
    .from('predictions')
    .insert(payload)
    .select('id')
    .single();

  if (error) {
    throw new PredictionError(error.message);
  }

  return data.id as string;
}

export async function fetchSavedPredictions(profileId: string): Promise<SavedPrediction[]> {
  const { data, error } = await supabase
    .from('predictions')
    .select('*')
    .eq('user_id', profileId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new PredictionError(error.message);
  }

  return data || [];
}

export async function deletePrediction(id: string): Promise<void> {
  const { error } = await supabase
    .from('predictions')
    .delete()
    .eq('id', id);

  if (error) {
    throw new PredictionError(error.message);
  }
}
