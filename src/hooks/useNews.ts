import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { NewsFilter, NewsResponse, NewsArticle } from '@/types';
import { MOCK_ARTICLES } from '@/lib/mock-data';

function filterArticles(articles: NewsArticle[], filters: NewsFilter): NewsArticle[] {
  let result = [...articles];

  if (filters.category) {
    result = result.filter((a) => a.category === filters.category);
  }
  if (filters.state) {
    result = result.filter((a) => a.state === filters.state);
  }
  if (filters.sentiment) {
    result = result.filter((a) => a.sentiment === filters.sentiment);
  }
  if (filters.search) {
    const q = filters.search.toLowerCase();
    result = result.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q)) ||
        a.state?.toLowerCase().includes(q) ||
        a.city?.toLowerCase().includes(q)
    );
  }
  if (filters.dateRange) {
    const now = Date.now();
    const cutoffs: Record<string, number> = {
      today:     24 * 3600000,
      yesterday: 48 * 3600000,
      '7days':   7  * 86400000,
      '30days':  30 * 86400000,
    };
    const cutoff = cutoffs[filters.dateRange];
    if (cutoff) {
      result = result.filter((a) => now - new Date(a.publishedAt).getTime() <= cutoff);
    }
  }

  return result;
}

export function useNews(filters: NewsFilter = {}) {
  return useQuery<NewsResponse>({
    queryKey: ['news', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.state) params.append('state', filters.state);
      if (filters.search) params.append('q', filters.search);
      if (filters.page) params.append('page', String(filters.page));
      if (filters.limit) params.append('limit', String(filters.limit));

      const res = await fetch(`/api/news?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch news');
      }
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
}

export function useArticle(id: string) {
  return useQuery<NewsArticle | null>({
    queryKey: ['article', id],
    queryFn: async () => {
      const res = await fetch(`/api/news/${id}`);
      if (!res.ok) {
        throw new Error('Failed to fetch article');
      }
      return res.json();
    },
    staleTime: 10 * 60 * 1000,
  });
}

export function useBreakingNews() {
  return useQuery<NewsArticle[]>({
    queryKey: ['breaking-news'],
    queryFn: async () => {
      const res = await fetch('/api/news?limit=50');
      if (!res.ok) {
        throw new Error('Failed to fetch breaking news');
      }
      const data = await res.json();
      return (data.articles || []).filter((a: NewsArticle) => a.isBreaking);
    },
    refetchInterval: 5 * 60 * 1000,
    staleTime: 5 * 60 * 1000,
  });
}

export function useStates() {
  return useQuery<any[]>({
    queryKey: ['states'],
    queryFn: async () => {
      const res = await fetch('/api/states');
      if (!res.ok) {
        throw new Error('Failed to fetch states');
      }
      return res.json();
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useSearch(query: string) {
  return useQuery<{ articles: NewsArticle[]; states: any[] }>({
    queryKey: ['search', query],
    queryFn: async () => {
      if (!query || query.length <= 1) return { articles: [], states: [] };
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (!res.ok) {
        throw new Error('Failed to fetch search results');
      }
      return res.json();
    },
    enabled: query.length > 1,
    staleTime: 30 * 1000,
  });
}

export function useArticleSummary(articleId: string | undefined) {
  return useQuery<{ article_id: string; summary_text: string; generated_at: string }>({
    queryKey: ['article-summary', articleId],
    queryFn: async () => {
      if (!articleId) throw new Error('No article ID provided');
      const res = await fetch(`/api/news/${articleId}/summarize`, {
        method: 'POST',
      });
      if (!res.ok) {
        throw new Error('Failed to fetch article summary');
      }
      return res.json();
    },
    enabled: !!articleId,
    staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
  });
}

export function useStateSummary(stateName: string | undefined) {
  return useQuery<{ state_name: string; summary_text: string; generated_at: string }>({
    queryKey: ['state-summary', stateName],
    queryFn: async () => {
      if (!stateName) throw new Error('No state name provided');
      const res = await fetch(`/api/states/${encodeURIComponent(stateName)}/summarize`, {
        method: 'POST',
      });
      if (!res.ok) {
        throw new Error('Failed to fetch state summary');
      }
      return res.json();
    },
    enabled: !!stateName,
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
  });
}

export function useChatHistory() {
  return useQuery<any[]>({
    queryKey: ['chat-history'],
    queryFn: async () => {
      const res = await fetch('/api/chat/history');
      if (!res.ok) {
        throw new Error('Failed to fetch chat history');
      }
      return res.json();
    },
    staleTime: 2 * 60 * 1000,
  });
}

export function useChatMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { question: string; state?: string }) => {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        throw new Error('Failed to send chat message');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-history'] });
    },
  });
}

