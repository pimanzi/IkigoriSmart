import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats } from '@/services/dashboard.service';
import type { DashboardStats } from '@/types';

export function useDashboardStats() {
  const { data: stats, isLoading, isError, refetch } = useQuery<DashboardStats, Error>({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
  return { stats, isLoading, isError, refetch };
}
