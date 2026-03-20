import { supabase } from '../lib/supabase';
import { Tutorial, SavedTutorial, SaveTutorialPayload, UpdateProgressPayload } from '../types';

export class TutorialError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TutorialError';
  }
}

export async function fetchTutorials(): Promise<Tutorial[]> {
  const { data, error } = await supabase
    .from('tutorials')
    .select('*')
    .order('topic')
    .order('created_at');

  if (error) {
    throw new TutorialError(error.message);
  }

  return data || [];
}

export async function saveTutorial(payload: SaveTutorialPayload): Promise<void> {
  const { error } = await supabase
    .from('saved_tutorials')
    .insert({
      user_id: payload.profileId,
      tutorial_id: payload.tutorialId,
    });

  if (error) {
    if (error.code === '23505') {
      throw new TutorialError('tutorials.alreadySaved');
    }
    throw new TutorialError(error.message);
  }
}

export async function fetchSavedTutorials(profileId: string): Promise<SavedTutorial[]> {
  const { data, error } = await supabase
    .from('saved_tutorials')
    .select('*, tutorial:tutorials(*)')
    .eq('user_id', profileId)
    .order('last_accessed', { ascending: false, nullsFirst: false })
    .order('saved_at', { ascending: false });

  if (error) {
    throw new TutorialError(error.message);
  }

  return data || [];
}

export async function deleteSavedTutorial(savedTutorialId: string): Promise<void> {
  const { error } = await supabase
    .from('saved_tutorials')
    .delete()
    .eq('id', savedTutorialId);

  if (error) {
    throw new TutorialError(error.message);
  }
}

export async function updateLastAccessed(savedTutorialId: string): Promise<void> {
  const { error } = await supabase
    .from('saved_tutorials')
    .update({ last_accessed: new Date().toISOString() })
    .eq('id', savedTutorialId);

  if (error) {
    throw new TutorialError(error.message);
  }
}

export async function updateTutorialProgress(payload: UpdateProgressPayload): Promise<void> {
  const { error } = await supabase
    .from('saved_tutorials')
    .update({ progress_percent: payload.progress_percent })
    .eq('id', payload.saved_tutorial_id);

  if (error) {
    throw new TutorialError(error.message);
  }
}
