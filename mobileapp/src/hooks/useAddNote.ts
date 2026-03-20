import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { addNote as addNoteService } from '../services/notes.service';
import { AddNotePayload } from '../types';

export const useAddNote = (tutorialId: string | null, profileId: string | null) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: AddNotePayload) => addNoteService(payload),
    onSuccess: (note) => {
      if (tutorialId && profileId) {
        queryClient.invalidateQueries({ queryKey: ['notes', tutorialId, profileId] });
      }
      Toast.show({
        type: 'success',
        text1: t('learning.noteAddSuccess'),
      });
      return note;
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: t('learning.noteAddError'),
      });
    },
  });

  return {
    addNote: mutation.mutate,
    isPending: mutation.isPending,
  };
};
