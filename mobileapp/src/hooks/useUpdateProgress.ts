import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { updateTutorialProgress } from '../services/tutorials.service';
import { UpdateProgressPayload } from '../types';

export const useUpdateProgress = (profileId: string | null) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (payload: UpdateProgressPayload) => updateTutorialProgress(payload),
    onSuccess: () => {
      if (profileId) {
        queryClient.invalidateQueries({ queryKey: ['savedTutorials', profileId] });
      }
      Toast.show({
        type: 'success',
        text1: t('learning.progressSuccess'),
      });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: t('learning.progressError'),
      });
    },
  });

  return {
    updateProgress: mutation.mutate,
    isPending: mutation.isPending,
  };
};
