import { useQuery } from '@tanstack/react-query';
import { fetchFeedbacks } from '@/services/feedback.service';
import type { Feedback } from '@/types';

interface FeedbackFilters {
  rating?: number;
  district?: 'Musanze' | 'Nyabihu';
}

export function useFeedbacks(filters?: FeedbackFilters) {
  const { data: feedbacks = [], isLoading, isError, refetch } = useQuery<Feedback[], Error>({
    queryKey: ['feedbacks', filters],
    queryFn: () => fetchFeedbacks(filters),
    staleTime: 1000 * 60 * 5,
  });
  return { feedbacks, isLoading, isError, refetch };
}
