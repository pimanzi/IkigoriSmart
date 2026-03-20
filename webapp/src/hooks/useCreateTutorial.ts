import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { createTutorial } from '@/services/tutorials.service';
import { toast } from 'sonner';
import type { Tutorial } from '@/types';

export function useCreateTutorial(onSuccess?: (tutorial: Tutorial) => void) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  return useMutation<Tutorial, Error, Omit<Tutorial, 'id' | 'created_at'>>({
    mutationFn: createTutorial,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tutorials'] });
      toast.success(t('tutorials.createSuccess'));
      onSuccess?.(data);
    },
    onError: () => toast.error(t('tutorials.createError')),
  });
}
