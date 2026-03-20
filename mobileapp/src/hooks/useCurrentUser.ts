import { useQuery } from '@tanstack/react-query';
import { getCurrentSession } from '../services/auth.service';

export const useCurrentUser = () => {
  return useQuery({
    queryKey: ['currentUser'],
    queryFn: getCurrentSession,
    staleTime: Infinity,
    retry: 1,
  });
};
