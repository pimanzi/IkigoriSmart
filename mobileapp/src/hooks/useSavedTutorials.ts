import { useQuery } from '@tanstack/react-query';
import { fetchSavedTutorials } from '../services/tutorials.service';

export const useSavedTutorials = (profileId: string | null) => {
  const query = useQuery({
    queryKey: ['savedTutorials', profileId],
    queryFn: () => fetchSavedTutorials(profileId!),
    enabled: profileId !== null,
    staleTime: 1000 * 60 * 5,
  });

  return {
    savedTutorials: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
