import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateLastAccessed } from '../services/tutorials.service';

export const useUpdateLastAccessed = (profileId: string | null) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (savedTutorialId: string) => updateLastAccessed(savedTutorialId),
    onSuccess: () => {
      if (profileId) {
        queryClient.invalidateQueries({ queryKey: ['savedTutorials', profileId] });
      }
    },
  });

  return {
    markAccessed: mutation.mutate,
    isPending: mutation.isPending,
  };
};
