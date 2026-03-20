import { useMutation } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { registerUser } from '../services/auth.service';
import { RegisterFormData } from '../types/auth.types';

export const useRegister = () => {
  const navigation = useNavigation();

  return useMutation({
    mutationFn: (data: RegisterFormData) => registerUser(data),
    onSuccess: () => {
      navigation.navigate('Login' as never);
    },
  });
};
