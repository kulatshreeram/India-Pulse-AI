'use client';

import { useEffect, useRef } from 'react';
import { useNotificationStore } from '@/store/notificationStore';

const POLL_INTERVAL = 60_000; // 60 seconds

export function useBreakingNewsWatcher() {
  const { preferences, seenArticleIds, addNotification, addSeenArticleId } =
    useNotificationStore();
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkForBreaking = async () => {
    if (!preferences.breaking) return;
    try {
      const res = await fetch('/api/news?limit=50');
      if (!res.ok) return;
      const data = await res.json();
      const articles: any[] = data.articles || [];

      for (const article of articles) {
        if (article.isBreaking && !seenArticleIds.has(article.id)) {
          addSeenArticleId(article.id);
          addNotification({
            type: 'breaking',
            title: '🔴 Breaking News',
            body: article.title,
            articleId: article.id,
            state: article.state ?? undefined,
            category: article.category,
            imageUrl: article.imageUrl,
          });
        }
      }
    } catch {
      // Network error — silently ignore
    }
  };

  useEffect(() => {
    // Run immediately on mount
    checkForBreaking();

    timerRef.current = setInterval(checkForBreaking, POLL_INTERVAL);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences.breaking]);

  // Request browser push permission when user enables it
  useEffect(() => {
    if (
      preferences.browserPush &&
      typeof window !== 'undefined' &&
      'Notification' in window &&
      Notification.permission === 'default'
    ) {
      Notification.requestPermission();
    }
  }, [preferences.browserPush]);
}
