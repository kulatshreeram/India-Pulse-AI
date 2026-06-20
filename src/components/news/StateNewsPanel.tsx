'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Radio, Sparkles } from 'lucide-react';
import { useNewsStore } from '@/store/newsStore';
import { useNews, useStateSummary, useStateDetail, useTranslatedText, useStates } from '@/hooks/useNews';
import { useTranslation } from '@/hooks/useTranslation';
import { NewsCard } from '@/components/news/NewsCard';
import { getStateByName } from '@/lib/india-states';
import { SkeletonCard, Skeleton } from '@/components/ui/Skeleton';

export function StateNewsPanel() {
  const { filters, setFilters, setSelectedArticle } = useNewsStore();
  const stateName = filters.state;
  const [viewMode, setViewMode] = useState<'feed' | 'summary'>('feed');
  const { t, language } = useTranslation();

  useEffect(() => {
    setViewMode('feed');
  }, [stateName]);

  const close = () => {
    setFilters({ state: undefined });
  };

  const { data, isLoading } = useNews({ state: stateName });
  const articles = data?.articles ?? [];
  const stateInfo = stateName ? getStateByName(stateName) : undefined;

  const { data: summaryData, isLoading: isSummaryLoading, error: summaryError } = useStateSummary(
    viewMode === 'summary' ? stateName : undefined
  );

  const rawStateSummary = summaryData?.summary_text || '';
  const { translatedText: translatedStateSummary, isLoading: isTranslatingStateSummary } = useTranslatedText(rawStateSummary, language);

  const { data: statesList, isLoading: isStatesListLoading } = useStates(filters.category);
  const stateDetail = statesList?.find((s) => s.name === stateName);

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
              {/* State Info card (State Intelligence Card) */}
              {stateInfo && stateDetail && (
                <div
                  className="p-4 rounded-xl space-y-3.5"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-slate-500 mb-0.5 font-medium">{t("Capital")}</p>
                      <p className="font-semibold text-slate-200">{stateInfo.capital}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-0.5 font-medium">{t("Population")}</p>
                      <p className="font-semibold text-slate-200">
                        {(stateInfo.population / 1000000).toFixed(1)}M
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-white/05">
                    <div>
                      <p className="text-slate-500 mb-0.5 font-medium">{t("Articles Count")}</p>
                      <p className="font-semibold text-slate-200">{stateDetail.newsCount}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 mb-0.5 font-medium">{t("Top Category")}</p>
                      <p className="font-semibold text-slate-200 capitalize">{t(stateDetail.topCategory)}</p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/05">
                    <p className="text-xs text-slate-500 mb-0.5 font-medium">{t("Trending Topic")}</p>
                    <p className="text-sm font-bold text-saffron-400">{t(stateDetail.trendingTopic)}</p>
                  </div>

                  {/* State Mood Dashboard */}
                  {viewMode === 'feed' && (
                    <div className="pt-3 border-t border-white/05">
                      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-2">🎭 {t("State Mood Dashboard")}</p>
                      {stateDetail.sentimentBreakdown ? (
                        <div className="space-y-2">
                          <div className="h-2 rounded-full overflow-hidden flex bg-slate-800">
                            <div style={{ width: `${stateDetail.sentimentBreakdown.positive}%` }} className="h-full bg-emerald-500" />
                            <div style={{ width: `${stateDetail.sentimentBreakdown.neutral}%` }} className="h-full bg-slate-500" />
                            <div style={{ width: `${stateDetail.sentimentBreakdown.negative}%` }} className="h-full bg-red-500" />
                          </div>
                          <div className="flex justify-between text-xs font-semibold">
                            <span className="text-emerald-400 flex items-center gap-0.5">😊 {stateDetail.sentimentBreakdown.positive}%</span>
                            <span className="text-slate-400 flex items-center gap-0.5">😐 {stateDetail.sentimentBreakdown.neutral}%</span>
                            <span className="text-red-400 flex items-center gap-0.5">😟 {stateDetail.sentimentBreakdown.negative}%</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-600">Sentiment data not available.</p>
                      )}
                    </div>
                  )}

                  {/* Generate Summary Button */}
                  {viewMode === 'feed' && articles.length > 0 && (
                    <button
                      onClick={() => setViewMode('summary')}
                      className="w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-white hover:opacity-90 active:scale-[0.98]"
                      style={{
                        background: 'linear-gradient(135deg, #fb923c, #f97316)',
                        boxShadow: '0 4px 12px rgba(251, 146, 60, 0.2)',
                      }}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {t("Generate State Summary")}
                    </button>
                  )}
                </div>
              )}

              {/* Summary view */}
              {viewMode === 'summary' ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <Sparkles className="w-3.5 h-3.5 text-saffron-400" />
                      <span>{t("AI State Summary")}</span>
                    </div>
                    <button
                      onClick={() => setViewMode('feed')}
                      className="text-xs text-saffron-400 hover:text-saffron-300 font-semibold flex items-center gap-1"
                    >
                      ← {t("Back to Feed")}
                    </button>
                  </div>

                  {isSummaryLoading ? (
                    <div className="space-y-3 p-4 rounded-xl bg-white/[0.02] border border-white/06">
                      <Skeleton className="h-4 w-3/4 rounded" />
                      <Skeleton className="h-4 w-full rounded" />
                      <Skeleton className="h-4 w-5/6 rounded" />
                      <Skeleton className="h-4 w-2/3 rounded" />
                    </div>
                  ) : summaryError ? (
                    <div className="p-4 text-center rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
                      Failed to generate summary. Please try again.
                    </div>
                  ) : (
                    <div
                      className="rounded-xl p-4 text-sm text-slate-300 leading-relaxed space-y-3 whitespace-pre-line"
                      style={{
                        background: 'linear-gradient(135deg, rgba(251,146,60,0.06), rgba(59,130,246,0.06))',
                        border: '1px solid rgba(251,146,60,0.2)',
                      }}
                    >
                      {isTranslatingStateSummary ? (
                        <div className="space-y-2">
                          <div className="h-3 w-full bg-white/10 rounded animate-pulse" />
                          <div className="h-3 w-5/6 bg-white/10 rounded animate-pulse" />
                        </div>
                      ) : (
                        translatedStateSummary
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <>
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
                </>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
