import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import Toast from 'react-native-toast-message';
import { updatePassword } from '../services/profile.service';

export const useUpdatePassword = () => {
  const { t } = useTranslation();

  const mutation = useMutation({
    mutationFn: (newPassword: string) => updatePassword(newPassword),
    onSuccess: () => {
      Toast.show({
        type: 'success',
        text1: t('profile.passwordSuccess'),
      });
    },
    onError: () => {
      Toast.show({
        type: 'error',
        text1: t('profile.passwordError'),
      });
    },
  });

  return {
    updatePassword: mutation.mutate,
    isPending:      mutation.isPending,
    isError:        mutation.isError,
    isSuccess:      mutation.isSuccess,
  };
};
