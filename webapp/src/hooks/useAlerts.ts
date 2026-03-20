import { useQuery } from '@tanstack/react-query';
import { fetchAlerts } from '@/services/alerts.service';
import type { Alert } from '@/types';

export function useAlerts() {
  const { data: alerts = [], isLoading, isError, refetch } = useQuery<Alert[], Error>({
    queryKey: ['alerts'],
    queryFn: fetchAlerts,
    staleTime: 1000 * 60 * 5,
  });
  return { alerts, isLoading, isError, refetch };
}
