import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteIPMRecommendation } from '@/services/ipm.service';
import { toast } from 'sonner';

export function useDeleteIPM() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: deleteIPMRecommendation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ipm'] });
      toast.success('Recommendation deleted');
    },
    onError: () => toast.error('Failed to delete recommendation'),
  });
}
