'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Radio } from 'lucide-react';
import { useNewsStore } from '@/store/newsStore';
import { useNews } from '@/hooks/useNews';
import { NewsCard } from '@/components/news/NewsCard';
import { getStateByName } from '@/lib/india-states';
import { SkeletonCard } from '@/components/ui/Skeleton';

export function StateNewsPanel() {
  const { filters, setFilters, setSelectedArticle } = useNewsStore();
  const stateName = filters.state;

  const close = () => {
    setFilters({ state: undefined });
  };

  const { data, isLoading } = useNews({ state: stateName });
  const articles = data?.articles ?? [];
  const stateInfo = stateName ? getStateByName(stateName) : undefined;

  return (
    <AnimatePresence>
      {stateName && (
        <>
          {/* Backdrop (mobile) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-40 md:hidden"
            onClick={close}
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="fixed left-0 top-14 bottom-8 w-full md:w-[380px] z-40 overflow-y-auto flex flex-col"
            style={{
              background: 'rgba(9, 14, 28, 0.95)',
              backdropFilter: 'blur(20px)',
              borderRight: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '20px 0 60px rgba(0,0,0,0.5)',
            }}
            id="state-news-panel"
          >
            {/* Header */}
            <div
              className="sticky top-0 z-10 p-4 flex items-center justify-between"
              style={{
                background: 'rgba(9, 14, 28, 0.95)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-saffron-400" />
                <h2 className="text-base font-bold text-white leading-none">
                  {stateName}
                </h2>
              </div>
              <button
                onClick={close}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all"
                title="Clear state filter"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 space-y-4">
              {/* State Info card */}
              {stateInfo && (
                <div
                  className="p-3.5 rounded-xl"
                  style={{
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-slate-500 mb-0.5 font-medium">Capital</p>
                      <p className="font-semibold text-slate-200">{stateInfo.capital}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-0.5 font-medium">Population</p>
                      <p className="font-semibold text-slate-200">
                        {(stateInfo.population / 1000000).toFixed(1)}M
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Feed Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <Radio className="w-3.5 h-3.5 text-saffron-400" />
                  <span>State Feed ({articles.length})</span>
                </div>
              </div>

              {/* News cards list */}
              <div className="space-y-3 pb-8">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))
                ) : articles.length > 0 ? (
                  articles.map((article, i) => (
                    <NewsCard
                      key={article.id}
                      article={article}
                      compact={true}
                      index={i}
                      onClick={() => setSelectedArticle(article)}
                    />
                  ))
                ) : (
                  <div className="p-8 text-center rounded-2xl border border-dashed border-white/10 bg-white/[0.01]">
                    <p className="text-slate-400 text-sm font-medium mb-1">
                      No News Found
                    </p>
                    <p className="text-slate-600 text-xs leading-normal">
                      No recent news available for this state.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
