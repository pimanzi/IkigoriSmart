import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { updateTutorial } from '@/services/tutorials.service';
import { toast } from 'sonner';
import type { Tutorial } from '@/types';

interface UpdateTutorialVars {
  id: string;
  data: Partial<Tutorial>;
}

export function useUpdateTutorial(onSuccess?: () => void) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation<Tutorial, Error, UpdateTutorialVars>({
    mutationFn: ({ id, data }) => updateTutorial(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tutorials'] });
      toast.success(t('tutorials.updateSuccess'));
      onSuccess?.();
    },
    onError: () => toast.error(t('tutorials.updateError')),
  });
}
