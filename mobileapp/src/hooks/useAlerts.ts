import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchUnreadAlerts, markAlertAsRead } from '../services/alerts.service';
import { AlertRecord } from '../types';

export const useAlerts = (profileId: string | null) => {
  const query = useQuery<AlertRecord[]>({
    queryKey: ['alerts', profileId],
    queryFn: () => fetchUnreadAlerts(profileId!),
    enabled: profileId !== null,
    staleTime: 1000 * 60 * 2,
  });

  return {
    alerts: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};

export const useMarkAlertAsRead = (profileId: string | null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (alertId: string) => markAlertAsRead(alertId, profileId!),
    onSuccess: (_, alertId) => {
      // Remove the alert immediately from the cache without refetching
      queryClient.setQueryData(
        ['alerts', profileId],
        (old: AlertRecord[] | undefined) => (old ? old.filter((a) => a.id !== alertId) : []),
      );
    },
  });
};
