'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useNewsStore } from '@/store/newsStore';
import { AppAuthProvider } from '@/context/AuthContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const loadViewedArticles = useNewsStore((state) => state.loadViewedArticles);

  useEffect(() => {
    loadViewedArticles();
  }, [loadViewedArticles]);

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
        {children}
      </AppAuthProvider>
    </QueryClientProvider>
  );
}

