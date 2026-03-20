import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createAlert } from '@/services/alerts.service';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { Alert } from '@/types';

export function useCreateAlert(onSuccess?: (alert: Alert) => void) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation<Alert, Error, Omit<Alert, 'id' | 'created_at'>>({
    mutationFn: createAlert,
    onSuccess: (newAlert) => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success(t('alerts.createSuccess'));
      onSuccess?.(newAlert);
    },
    onError: () => toast.error(t('alerts.createError')),
  });
}
