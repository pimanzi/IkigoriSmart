import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { uploadAvatar } from '../services/avatarUpload.service';
import { updateAvatar } from '../services/profile.service';
import { AvatarUploadInput } from '../types';

export const useUpdateAvatar = () => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async ({ input, profileId }: { input: AvatarUploadInput; profileId: string }) => {
      const avatarUrl = await uploadAvatar(input.imageUri, input.authId);
      await updateAvatar(profileId, avatarUrl);
      return avatarUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      Toast.show({
        type: 'success',
        text1: t('profile.avatarSuccess'),
      });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: t('profile.avatarError'),
      });
    },
  });

  return {
    updateAvatar: mutation.mutate,
    isPending: mutation.isPending,
  };
};
