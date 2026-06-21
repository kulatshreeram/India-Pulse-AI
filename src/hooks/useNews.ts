import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { NewsFilter, NewsResponse, NewsArticle } from '@/types';
import { MOCK_ARTICLES } from '@/lib/mock-data';
import { useAppAuth } from '@/context/AuthContext';

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
      if (filters.dateRange) params.append('dateRange', filters.dateRange);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
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
    refetchInterval: 5 * 60 * 1000,
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

export function useStates(category?: string, filters: NewsFilter = {}) {
  return useQuery<any[]>({
    queryKey: ['states', category, filters.dateRange, filters.startDate, filters.endDate],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (category) params.append('category', category);
      if (filters.dateRange) params.append('dateRange', filters.dateRange);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      const url = `/api/states${params.toString() ? `?${params.toString()}` : ''}`;
      const res = await fetch(url);
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

export function useStateDetail(slug: string | undefined) {
  return useQuery<any>({
    queryKey: ['state-detail', slug],
    queryFn: async () => {
      if (!slug) throw new Error('No state slug provided');
      const res = await fetch(`/api/states/${slug}`);
      if (!res.ok) {
        throw new Error('Failed to fetch state detail');
      }
      return res.json();
    },
    enabled: !!slug,
    staleTime: 2 * 60 * 1000,
  });
}

export function useNewsRecommendations(viewedIds: string[]) {
  return useQuery<NewsArticle[]>({
    queryKey: ['news-recommendations', viewedIds],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (viewedIds.length > 0) {
        params.append('viewed', viewedIds.join(','));
      }
      const res = await fetch(`/api/news/recommendations?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      return res.json();
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useClusteredNews(filters: NewsFilter = {}) {
  return useQuery<{ clusters: Array<{ lead_article: NewsArticle; related_articles: NewsArticle[]; cluster_size: number }> }>({
    queryKey: ['clustered-news', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.state) params.append('state', filters.state);
      
      const res = await fetch(`/api/news/clustered?${params.toString()}`);
      if (!res.ok) {
        throw new Error('Failed to fetch clustered news');
      }
      return res.json();
    },
    staleTime: 2 * 60 * 1000,
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

export function useSimilarArticles(articleId: string | undefined) {
  return useQuery<NewsArticle[]>({
    queryKey: ['similar-articles', articleId],
    queryFn: async () => {
      if (!articleId) throw new Error('No article ID provided');
      const res = await fetch(`/api/news/${articleId}/similar`);
      if (!res.ok) {
        throw new Error('Failed to fetch similar articles');
      }
      return res.json();
    },
    enabled: !!articleId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTranslationService() {
  return useMutation({
    mutationFn: async (payload: { text: string; targetLang: string }) => {
      const res = await fetch('/api/news/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: payload.text, target_lang: payload.targetLang }),
      });
      if (!res.ok) {
        throw new Error('Failed to translate text');
      }
      return res.json();
    },
  });
}

import { useState, useEffect } from 'react';

export function useTranslatedText(text: string | undefined, targetLang: 'en' | 'hi' | 'mr') {
  const [translatedText, setTranslatedText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!text) {
      setTranslatedText('');
      return;
    }

    if (targetLang === 'en') {
      setTranslatedText(text);
      return;
    }

    let isMounted = true;
    setIsLoading(true);

    fetch('/api/news/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, target_lang: targetLang }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Translation failed');
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setTranslatedText(data.translated_text);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err);
          setTranslatedText(text);
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [text, targetLang]);

  return { translatedText, isLoading, error };
}

export function useUserPreferences() {
  const { user } = useAppAuth();
  return useQuery<string[]>({
    queryKey: ['preferences', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch('/api/preferences', {
        headers: { 'x-user-id': user.id }
      });
      if (!res.ok) throw new Error('Failed to fetch preferences');
      const data = await res.json();
      return data.interests || [];
    },
    enabled: !!user,
  });
}

export function useSavePreferences() {
  const { user, updateProfile } = useAppAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (interests: string[]) => {
      if (!user) return;
      await updateProfile(user.name, interests);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferences', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['personalized-news', user?.id] });
    }
  });
}

export function useUserBookmarks() {
  const { user } = useAppAuth();
  return useQuery<NewsArticle[]>({
    queryKey: ['bookmarks', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch('/api/bookmarks', {
        headers: { 'x-user-id': user.id }
      });
      if (!res.ok) throw new Error('Failed to fetch bookmarks');
      const data = await res.json();
      return data.bookmarks || [];
    },
    enabled: !!user,
  });
}

export function useToggleBookmark() {
  const { user } = useAppAuth();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (articleId: string) => {
      if (!user) return;
      const res = await fetch('/api/bookmarks/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id
        },
        body: JSON.stringify({ article_id: articleId })
      });
      if (!res.ok) throw new Error('Failed to toggle bookmark');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks', user?.id] });
    }
  });
}

export function usePersonalizedNews() {
  const { user } = useAppAuth();
  return useQuery<NewsResponse>({
    queryKey: ['personalized-news', user?.id],
    queryFn: async () => {
      if (!user) return { status: 'ok', totalResults: 0, articles: [] };
      const res = await fetch('/api/news/personalized', {
        headers: { 'x-user-id': user.id }
      });
      if (!res.ok) throw new Error('Failed to fetch personalized news');
      return res.json();
    },
    enabled: !!user,
  });
}




