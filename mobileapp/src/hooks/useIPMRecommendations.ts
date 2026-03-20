import { useQuery } from '@tanstack/react-query';
import { fetchIPMRecommendations } from '../services/ipm.service';
import { IPMRecommendation } from '../types';

export const useIPMRecommendations = (
  severity: string | null,
  riskLevel: string | null
) => {
  const query = useQuery<IPMRecommendation[]>({
    queryKey: ['ipm', severity, riskLevel],
    queryFn: () => fetchIPMRecommendations(severity!, riskLevel!),
    enabled: severity !== null && riskLevel !== null,
    staleTime: 1000 * 60 * 30, // IPM data rarely changes — cache for 30 minutes
  });

  return {
    recommendations: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
