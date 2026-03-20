import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { updateProfile } from '../services/profile.service';
import { ProfileUpdatePayload } from '../types';

export const useUpdateProfile = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ profileId, payload }: { profileId: string; payload: ProfileUpdatePayload }) =>
      updateProfile(profileId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      Toast.show({
        type: 'success',
        text1: t('profile.updateSuccess'),
      });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: t('profile.updateError'),
      });
    },
  });

  return {
    updateProfile: mutation.mutate,
    isPending:     mutation.isPending,
    isError:       mutation.isError,
    isSuccess:     mutation.isSuccess,
  };
};
