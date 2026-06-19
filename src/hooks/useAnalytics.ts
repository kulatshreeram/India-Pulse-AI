import { useQuery } from '@tanstack/react-query';
import type { AnalyticsData } from '@/types';

export function useAnalytics() {
  return useQuery<AnalyticsData>({
    queryKey: ['analytics'],
    queryFn: async () => {
      const res = await fetch('/api/analytics');
      if (!res.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}
