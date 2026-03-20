import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { saveTutorial } from '../services/tutorials.service';
import { SaveTutorialPayload } from '../types';

export const useSaveTutorial = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: SaveTutorialPayload) => saveTutorial(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedTutorials'] });
      Toast.show({
        type: 'success',
        text1: t('tutorials.saveSuccess'),
      });
    },
    onError: (error: Error) => {
      const message = error.message === 'tutorials.alreadySaved'
        ? t('tutorials.alreadySaved')
        : t('tutorials.saveError');
      Toast.show({
        type: 'error',
        text1: message,
      });
    },
  });

  return {
    saveTutorial: mutation.mutate,
    isPending: mutation.isPending,
  };
};
