import { supabase } from '../lib/supabase';
import { TutorialNote, AddNotePayload } from '../types';

export class NoteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NoteError';
  }
}

export async function fetchNotes(tutorialId: string, profileId: string): Promise<TutorialNote[]> {
  const { data, error } = await supabase
    .from('tutorial_notes')
    .select('*')
    .eq('tutorial_id', tutorialId)
    .eq('user_id', profileId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new NoteError(error.message);
  }

  return data || [];
}

export async function addNote(payload: AddNotePayload): Promise<TutorialNote> {
  const { data, error } = await supabase
    .from('tutorial_notes')
    .insert({
      user_id: payload.user_id,
      tutorial_id: payload.tutorial_id,
      content: payload.content,
    })
    .select()
    .single();

  if (error) {
    throw new NoteError(error.message);
  }

  return data;
}

export async function deleteNote(noteId: string): Promise<void> {
  const { error } = await supabase
    .from('tutorial_notes')
    .delete()
    .eq('id', noteId);

  if (error) {
    throw new NoteError(error.message);
  }
}
