import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateIPMRecommendation } from '@/services/ipm.service';
import { toast } from 'sonner';
import type { IPMRecommendation } from '@/types';

interface UpdateIPMVars {
  id: string;
  data: Partial<IPMRecommendation>;
}

export function useUpdateIPM() {
  const queryClient = useQueryClient();
  return useMutation<IPMRecommendation, Error, UpdateIPMVars>({
    mutationFn: ({ id, data }) => updateIPMRecommendation(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ipm'] });
      toast.success('Recommendation updated');
    },
    onError: () => toast.error('Failed to update recommendation'),
  });
}
