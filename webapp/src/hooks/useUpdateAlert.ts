import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateAlert } from '@/services/alerts.service';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';
import type { Alert } from '@/types';

export function useUpdateAlert(onSuccess?: () => void) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation<Alert, Error, { id: string; data: Partial<Alert> }>({
    mutationFn: ({ id, data }) => updateAlert(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success(t('alerts.updateSuccess'));
      onSuccess?.();
    },
    onError: () => toast.error(t('alerts.updateError')),
  });
}
