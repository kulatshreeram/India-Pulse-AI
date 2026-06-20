'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { NewsPanel } from '@/components/news/NewsPanel';
import { StateNewsPanel } from '@/components/news/StateNewsPanel';
import { BreakingNewsTicker } from '@/components/layout/BreakingNewsTicker';
import { MapControls } from '@/components/map/MapControls';
import { SearchBar } from '@/components/map/SearchBar';
import { useNews } from '@/hooks/useNews';
import { useNewsStore } from '@/store/newsStore';
import { Providers } from '@/components/Providers';
import { Layers, RefreshCw } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

const MapWrapper = dynamic(() => import('@/components/map/MapWrapper'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 bg-slate-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-12 h-12 rounded-full border-2 border-orange-400/30 border-t-orange-400 animate-spin" />
        <p className="text-slate-500 text-sm">Initializing Map...</p>
      </div>
    </div>
  ),
});

function MapStats() {
  const { filters } = useNewsStore();
  const { data, isLoading, refetch } = useNews(filters);
  const { t } = useTranslation();

  return (
    <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
      <SearchBar />
      <div
        className="flex items-center gap-3 px-3 py-2 rounded-xl"
        style={{
          background: 'rgba(9, 14, 28, 0.92)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-semibold text-slate-200">
            {isLoading ? '...' : data?.totalResults ?? 0} {t("Articles")}
          </span>
        </div>
        <div className="w-px h-4 bg-white/10" />
        <button
          onClick={() => refetch()}
          className="text-slate-500 hover:text-orange-400 transition-colors"
          title={t("Refresh News")}
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function DashboardPageInner() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
      <Navbar />
      <div className="flex-1 relative mt-14 mb-8">
        <div className="absolute inset-0">
          <MapWrapper />
        </div>
        <MapControls />
        <MapStats />
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-3 left-3 z-30"
        >
          <div
            className="px-3 py-2 rounded-xl flex items-center gap-2"
            style={{
              background: 'rgba(9, 14, 28, 0.85)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-xs text-slate-500 font-medium">{t("Click marker to read news")}</span>
          </div>
        </motion.div>
        <div
          className="absolute bottom-0 left-0 right-0 h-12 pointer-events-none"
          style={{ background: 'linear-gradient(to top, rgba(2,6,23,0.8), transparent)' }}
        />
      </div>
      <BreakingNewsTicker />
      <NewsPanel />
      <StateNewsPanel />
    </div>
  );
}

function SearchParamInitializer() {
  const searchParams = useSearchParams();
  const { setFilters } = useNewsStore();
  
  useEffect(() => {
    const searchVal = searchParams.get('search');
    if (searchVal) {
      setFilters({ search: searchVal });
    }
  }, [searchParams, setFilters]);
  
  return null;
}

export function DashboardPageClient() {
  return (
    <Providers>
      <Suspense fallback={null}>
        <SearchParamInitializer />
      </Suspense>
      <DashboardPageInner />
    </Providers>
  );
}
