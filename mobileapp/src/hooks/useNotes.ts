import { useQuery } from '@tanstack/react-query';
import { fetchNotes } from '../services/notes.service';

export const useNotes = (tutorialId: string | null, profileId: string | null) => {
  const query = useQuery({
    queryKey: ['notes', tutorialId, profileId],
    queryFn: () => fetchNotes(tutorialId!, profileId!),
    enabled: !!tutorialId && !!profileId,
    staleTime: 0,
  });

  return {
    notes: query.data || [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
};
