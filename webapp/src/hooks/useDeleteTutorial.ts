import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { deleteTutorial } from '@/services/tutorials.service';
import { toast } from 'sonner';

export function useDeleteTutorial() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteTutorial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutorials'] });
      toast.success(t('tutorials.deleteSuccess'));
    },
    onError: () => toast.error(t('tutorials.deleteError')),
  });
}
