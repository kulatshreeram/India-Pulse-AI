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

export function useNewsGrowth(state?: string, category?: string) {
  return useQuery<{ status: string; data: Array<{ date: string; count: number; cumulative: number }> }>({
    queryKey: ['news-growth', state, category],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (state) params.append('state', state);
      if (category) params.append('category', category);
      
      const res = await fetch(`/api/news/growth?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch news growth data');
      }
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

