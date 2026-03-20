import { useQuery } from '@tanstack/react-query';
import { fetchSavedPredictions } from '../services/prediction.service';
import { SavedPrediction } from '../types';

export const useSavedPredictions = (profileId: string | null) => {
  const query = useQuery<SavedPrediction[]>({
    queryKey: ['savedPredictions', profileId],
    queryFn: () => fetchSavedPredictions(profileId!),
    enabled: profileId !== null,
    staleTime: 1000 * 60 * 5,
  });

  return {
    savedPredictions: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
