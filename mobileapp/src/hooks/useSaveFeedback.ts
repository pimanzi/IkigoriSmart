import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { saveFeedback } from '../services/feedback.service';
import { FeedbackPayload } from '../types';

export const useSaveFeedback = () => {
  const { t } = useTranslation();

  const mutation = useMutation<void, Error, FeedbackPayload>({
    mutationFn: saveFeedback,
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: t('scan.feedback.submitSuccess'),
      });
    },
    onError: (error) => {
      const key =
        error.message === 'scan.feedback.alreadySubmitted'
          ? 'scan.feedback.alreadySubmitted'
          : 'scan.feedback.submitError';
      Toast.show({
        type: 'error',
        text1: t(key),
      });
    },
  });

  return {
    submitFeedback: mutation.mutate,
    isPending: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
  };
};
