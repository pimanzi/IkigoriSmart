import { supabase } from '../lib/supabase';
import { FeedbackPayload } from '../types';

export class FeedbackError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FeedbackError';
  }
}

/**
 * Saves feedback to Supabase public.feedback.
 *
 * @param payload  FeedbackPayload where user_id is public.profiles.id — NOT auth.uid().
 *                 The UNIQUE(prediction_id, user_id) constraint means only one feedback
 *                 per prediction — duplicate inserts throw with i18n key
 *                 'scan.feedback.alreadySubmitted'.
 */
export async function saveFeedback(payload: FeedbackPayload): Promise<void> {
  const { error } = await supabase.from('feedback').insert(payload);

  if (error) {
    if (error.code === '23505') {
      throw new FeedbackError('scan.feedback.alreadySubmitted');
    }
    throw new FeedbackError(error.message);
  }
}
