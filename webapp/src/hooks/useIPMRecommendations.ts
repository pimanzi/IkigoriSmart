import { useQuery } from '@tanstack/react-query';
import { fetchIPMRecommendations } from '@/services/ipm.service';
import type { IPMRecommendation } from '@/types';

interface IPMFilters {
  severity?: string;
  risk_level?: string;
  action_type?: 'immediate' | 'monitor' | 'preventive';
}

export function useIPMRecommendations(filters?: IPMFilters) {
  const { data: recommendations = [], isLoading, isError, refetch } = useQuery<IPMRecommendation[], Error>({
    queryKey: ['ipm', filters],
    queryFn: () => fetchIPMRecommendations(filters),
    staleTime: 1000 * 60 * 10,
  });
  return { recommendations, isLoading, isError, refetch };
}
