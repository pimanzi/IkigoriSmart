import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createIPMRecommendation } from '@/services/ipm.service';
import { toast } from 'sonner';
import type { IPMRecommendation } from '@/types';

export function useCreateIPM() {
  const queryClient = useQueryClient();
  return useMutation<IPMRecommendation, Error, Omit<IPMRecommendation, 'id' | 'created_at'>>({
    mutationFn: createIPMRecommendation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ipm'] });
      toast.success('Recommendation created');
    },
    onError: () => toast.error('Failed to create recommendation'),
  });
}
