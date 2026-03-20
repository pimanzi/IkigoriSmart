import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { deleteSavedTutorial } from '../services/tutorials.service';

export const useDeleteSavedTutorial = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (savedTutorialId: string) => deleteSavedTutorial(savedTutorialId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedTutorials'] });
      Toast.show({
        type: 'success',
        text1: t('tutorials.deleteSuccess'),
      });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: t('tutorials.deleteError'),
      });
    },
  });

  return {
    deleteTutorial: mutation.mutate,
    isPending: mutation.isPending,
  };
};
