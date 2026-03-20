import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deletePrediction } from '../services/prediction.service';

export const useDeletePrediction = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePrediction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedPredictions'] });
    },
  });
};
