import { useQuery } from '@tanstack/react-query';
import { fetchTutorials } from '../services/tutorials.service';

export const useTutorials = () => {
  const query = useQuery({
    queryKey: ['tutorials'],
    queryFn: fetchTutorials,
    staleTime: 1000 * 60 * 30,
  });

  return {
    tutorials: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
