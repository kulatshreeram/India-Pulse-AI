import { useQuery } from '@tanstack/react-query';
import type { AnalyticsData } from '@/types';
import {
  MOCK_ARTICLES,
  getTrendingTopics,
  getSentimentStats,
  getStateStats,
  CATEGORY_LABELS,
} from '@/lib/mock-data';
import { format, subDays } from 'date-fns';

export function useAnalytics() {
  return useQuery<AnalyticsData>({
    queryKey: ['analytics'],
    queryFn: async () => {
      await new Promise((r) => setTimeout(r, 300));

      const trendingTopics = getTrendingTopics().map((t, i) => ({
        id: `topic-${i}`,
        topic: t.topic,
        count: t.count,
        trend: (i < 3 ? 'rising' : i < 8 ? 'stable' : 'falling') as 'rising' | 'falling' | 'stable',
        category: MOCK_ARTICLES.find((a) => a.tags.includes(t.topic))?.category ?? 'politics',
        states: [],
      }));

      const { positive, negative, neutral } = getSentimentStats();

      // Timeline: last 7 days
      const timelineData = Array.from({ length: 7 }, (_, i) => {
        const date = subDays(new Date(), 6 - i);
        const dayStr = format(date, 'yyyy-MM-dd');
        const count = MOCK_ARTICLES.filter((a) => {
          const articleDate = format(new Date(a.publishedAt), 'yyyy-MM-dd');
          return articleDate === dayStr;
        }).length || Math.floor(Math.random() * 8 + 3);
        return { date: format(date, 'MMM d'), count };
      });

      // Category breakdown
      const categoryCounts: Record<string, number> = {};
      MOCK_ARTICLES.forEach((a) => {
        categoryCounts[a.category] = (categoryCounts[a.category] || 0) + 1;
      });
      const categoryBreakdown = Object.entries(categoryCounts).map(([category, count]) => ({
        category: category as any,
        count,
        percentage: Math.round((count / MOCK_ARTICLES.length) * 100),
      }));

      // State activity
      const stateStats = getStateStats();
      const stateActivity = Object.entries(stateStats).map(([state, count]) => ({
        state: state as any,
        articleCount: count!,
        topCategory: MOCK_ARTICLES.find((a) => a.state === state)?.category ?? 'politics',
        sentimentScore:
          MOCK_ARTICLES.filter((a) => a.state === state).reduce((sum, a) => sum + a.sentimentScore, 0) /
          (count! || 1),
      }));

      const sentimentTrend = Array.from({ length: 7 }, (_, i) => ({
        date: format(subDays(new Date(), 6 - i), 'MMM d'),
        positive: Math.floor(Math.random() * 40 + 40),
        negative: Math.floor(Math.random() * 20 + 15),
        neutral: Math.floor(Math.random() * 20 + 20),
      }));

      return {
        totalArticles: MOCK_ARTICLES.length,
        totalStates: Object.keys(stateStats).length,
        totalCategories: Object.keys(categoryCounts).length,
        totalAISummaries: MOCK_ARTICLES.filter((a) => a.aiSummary).length,
        trendingTopics,
        sentimentData: {
          positive,
          negative,
          neutral,
          trend: sentimentTrend,
        },
        stateActivity,
        timelineData,
        categoryBreakdown,
      };
    },
    staleTime: 10 * 60 * 1000,
  });
}
