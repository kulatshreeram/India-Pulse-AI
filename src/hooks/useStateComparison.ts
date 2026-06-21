import { useQuery } from '@tanstack/react-query';
import type { IndianState, NewsCategory } from '@/types';

export interface StateMetrics {
  state: IndianState;
  articleCount: number;
  topCategory: NewsCategory;
  sentimentScore: number;
  sentimentBreakdown: { positive: number; negative: number; neutral: number };
  breakingCount: number;
  categoryBreakdown: Array<{ category: string; count: number }>;
  timelineData: Array<{ date: string; count: number }>;
  topSources: Array<{ name: string; count: number }>;
  avgImpact: number;
}

async function fetchStateMetrics(state: IndianState): Promise<StateMetrics> {
  const [newsRes, analyticsRes] = await Promise.all([
    fetch(`/api/news?state=${encodeURIComponent(state)}&limit=100`),
    fetch(`/api/states`),
  ]);

  const newsData = await newsRes.json();
  const statesData: any[] = analyticsRes.ok ? await analyticsRes.json() : [];
  const articles: any[] = newsData.articles || [];

  // Sentiment breakdown
  const pos = articles.filter((a) => a.sentiment === 'positive').length;
  const neg = articles.filter((a) => a.sentiment === 'negative').length;
  const neu = articles.filter((a) => a.sentiment === 'neutral').length;
  const total = articles.length || 1;

  // Category breakdown
  const catMap: Record<string, number> = {};
  articles.forEach((a) => { catMap[a.category] = (catMap[a.category] || 0) + 1; });
  const categoryBreakdown = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([category, count]) => ({ category, count }));

  // Breaking count
  const breakingCount = articles.filter((a) => a.isBreaking).length;

  // Top sources
  const sourceMap: Record<string, number> = {};
  articles.forEach((a) => {
    const name = a.source?.name || 'Unknown';
    sourceMap[name] = (sourceMap[name] || 0) + 1;
  });
  const topSources = Object.entries(sourceMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));

  // Timeline (last 7 days)
  const now = Date.now();
  const timelineData = Array.from({ length: 7 }, (_, i) => {
    const day = new Date(now - (6 - i) * 86_400_000);
    const dayStr = day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const count = articles.filter((a) => {
      const d = new Date(a.publishedAt);
      return d.getFullYear() === day.getFullYear() &&
             d.getMonth() === day.getMonth() &&
             d.getDate() === day.getDate();
    }).length;
    return { date: dayStr, count };
  });

  // Avg impact
  const avgImpact = articles.length > 0
    ? Math.round(articles.reduce((sum, a) => sum + (a.impactScore?.national || 0), 0) / articles.length)
    : 0;

  // From states API
  const stateInfo = statesData.find((s) => s.name === state);
  const sentimentScore = stateInfo?.sentimentScore ?? (articles.reduce((s, a) => s + (a.sentimentScore || 0), 0) / total);
  const topCategory = (categoryBreakdown[0]?.category as NewsCategory) ?? 'politics';

  return {
    state,
    articleCount: total,
    topCategory,
    sentimentScore,
    sentimentBreakdown: {
      positive: Math.round((pos / total) * 100),
      negative: Math.round((neg / total) * 100),
      neutral:  Math.round((neu / total) * 100),
    },
    breakingCount,
    categoryBreakdown,
    timelineData,
    topSources,
    avgImpact,
  };
}

export function useStateMetrics(state: IndianState | null) {
  return useQuery<StateMetrics>({
    queryKey: ['state-metrics', state],
    queryFn: () => fetchStateMetrics(state!),
    enabled: !!state,
    staleTime: 5 * 60 * 1000,
  });
}
