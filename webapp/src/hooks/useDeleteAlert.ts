import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAlert } from '@/services/alerts.service';
import { toast } from 'sonner';
import { useTranslation } from 'react-i18next';

export function useDeleteAlert() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success(t('alerts.deleteSuccess'));
    },
    onError: () => toast.error(t('alerts.deleteError')),
  });
}
