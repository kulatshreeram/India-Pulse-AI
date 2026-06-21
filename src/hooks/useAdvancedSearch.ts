import { useQuery } from '@tanstack/react-query';
import { useState, useEffect, useCallback } from 'react';
import type { NewsArticle, NewsCategory, IndianState, Sentiment } from '@/types';

export interface SearchFilters {
  q: string;
  state?: IndianState | '';
  category?: NewsCategory | '';
  sentiment?: Sentiment | '';
  source?: string;
  dateRange?: 'today' | '7days' | '30days' | '';
  sort?: 'relevance' | 'date' | 'views';
}

export interface SearchResults {
  articles: NewsArticle[];
  totalResults: number;
  suggestions: string[];
}

const HISTORY_KEY = 'search_history';
const MAX_HISTORY = 10;

export function useSearchHistory() {
  const [history, setHistory] = useState<string[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(HISTORY_KEY);
      if (stored) setHistory(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  const addToHistory = useCallback((query: string) => {
    if (!query.trim()) return;
    setHistory((prev) => {
      const next = [query, ...prev.filter((h) => h !== query)].slice(0, MAX_HISTORY);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const clearHistory = useCallback(() => {
    localStorage.removeItem(HISTORY_KEY);
    setHistory([]);
  }, []);

  return { history, addToHistory, clearHistory };
}

export function useAdvancedSearch(filters: SearchFilters, enabled = true) {
  const [debouncedQ, setDebouncedQ] = useState(filters.q);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(filters.q), 350);
    return () => clearTimeout(t);
  }, [filters.q]);

  return useQuery<SearchResults>({
    queryKey: ['search', debouncedQ, filters.state, filters.category, filters.sentiment, filters.source, filters.dateRange, filters.sort],
    enabled: enabled && debouncedQ.length >= 2,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (debouncedQ)         params.set('q', debouncedQ);
      if (filters.state)      params.set('state', filters.state);
      if (filters.category)   params.set('category', filters.category);
      if (filters.sentiment)  params.set('sentiment', filters.sentiment);
      if (filters.source)     params.set('source', filters.source);
      if (filters.dateRange)  params.set('dateRange', filters.dateRange);
      params.set('limit', '50');

      const res = await fetch(`/api/news?${params.toString()}`);
      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();

      let articles: NewsArticle[] = data.articles || [];

      // Client-side sort
      if (filters.sort === 'date') {
        articles = articles.sort(
          (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        );
      } else if (filters.sort === 'views') {
        articles = articles.sort((a, b) => (b.viewCount ?? 0) - (a.viewCount ?? 0));
      }

      // Build autocomplete suggestions from current results
      const titleWords = articles
        .flatMap((a) => a.title.split(' '))
        .filter((w) => w.length > 4)
        .slice(0, 20);
      const suggestions = [...new Set(titleWords)].slice(0, 8);

      return {
        articles,
        totalResults: data.totalResults ?? articles.length,
        suggestions,
      };
    },
    staleTime: 30_000,
  });
}
