'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useNewsStore } from '@/store/newsStore';
import { useNotificationStore } from '@/store/notificationStore';
import { AppAuthProvider } from '@/context/AuthContext';
import { NotificationToast } from '@/components/notifications/NotificationToast';
import { useBreakingNewsWatcher } from '@/hooks/useBreakingNewsWatcher';

function BreakingNewsWatcher() {
  useBreakingNewsWatcher();
  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const loadViewedArticles = useNewsStore((state) => state.loadViewedArticles);
  const loadFromStorage = useNotificationStore((state) => state.loadFromStorage);

  useEffect(() => {
    loadViewedArticles();
    loadFromStorage();
  }, [loadViewedArticles, loadFromStorage]);

  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AppAuthProvider>
        <BreakingNewsWatcher />
        <NotificationToast />
        {children}
      </AppAuthProvider>
    </QueryClientProvider>
  );
}
