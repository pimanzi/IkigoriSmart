import { supabase } from '../lib/supabase';
import { AlertRecord } from '../types';

export class AlertServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AlertServiceError';
  }
}

/**
 * Fetches all active alerts NOT yet read by the given profile.
 */
export async function fetchUnreadAlerts(profileId: string): Promise<AlertRecord[]> {
  // Step 1: get IDs of alerts already read by this user
  const { data: readData, error: readError } = await supabase
    .from('alert_reads')
    .select('alert_id')
    .eq('user_id', profileId);

  if (readError) throw new AlertServiceError(readError.message);

  const readIds = (readData ?? []).map((r) => r.alert_id as string);

  // Step 2: fetch active alerts, excluding already-read ones
  let query = supabase
    .from('alerts')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (readIds.length > 0) {
    query = query.not('id', 'in', `(${readIds.join(',')})`);
  }

  const { data, error } = await query;
  if (error) throw new AlertServiceError(error.message);
  return data ?? [];
}

/**
 * Marks an alert as read by inserting a row into alert_reads.
 */
export async function markAlertAsRead(alertId: string, profileId: string): Promise<void> {
  const { error } = await supabase
    .from('alert_reads')
    .insert({ alert_id: alertId, user_id: profileId });

  if (error) throw new AlertServiceError(error.message);
}
