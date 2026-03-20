import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { deleteNote as deleteNoteService } from '../services/notes.service';

export const useDeleteNote = (tutorialId: string | null, profileId: string | null) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (noteId: string) => deleteNoteService(noteId),
    onSuccess: () => {
      if (tutorialId && profileId) {
        queryClient.invalidateQueries({ queryKey: ['notes', tutorialId, profileId] });
      }
      Toast.show({
        type: 'success',
        text1: t('learning.noteDeleteSuccess'),
      });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: t('learning.noteDeleteError'),
      });
    },
  });

  return {
    deleteNote: mutation.mutate,
    isPending: mutation.isPending,
  };
};
