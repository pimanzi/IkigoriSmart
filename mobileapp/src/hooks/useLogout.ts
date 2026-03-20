import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { logoutUser } from '../services/auth.service';

export const useLogout = () => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logoutUser,
    onSuccess: () => {
      queryClient.setQueryData(['currentUser'], null);
      queryClient.clear();
      navigation.navigate('Welcome' as never);
    },
  });
};
