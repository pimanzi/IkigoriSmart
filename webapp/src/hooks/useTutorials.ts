import { useQuery } from '@tanstack/react-query';
import { fetchTutorials } from '@/services/tutorials.service';
import type { Tutorial } from '@/types';

export function useTutorials() {
  const { data: tutorials = [], isLoading } = useQuery<Tutorial[], Error>({
    queryKey: ['tutorials'],
    queryFn: () => fetchTutorials(),
  });
  return { tutorials, isLoading };
}
