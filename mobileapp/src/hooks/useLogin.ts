import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { loginUser } from '../services/auth.service';
import { LoginFormData } from '../types/auth.types';

export const useLogin = () => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginFormData) => loginUser(data),
    onSuccess: (response) => {
      if (response.user) {
        queryClient.setQueryData(['currentUser'], response.user);
        navigation.navigate('MainTabs' as never);
      }
    },
  });
};
