'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import {
  X, ExternalLink, Bookmark, BookmarkCheck,
  Share2, Clock, MapPin, Globe, ChevronRight,
  Sparkles, ChevronDown, ChevronUp
} from 'lucide-react';
import { CategoryBadge, SentimentBadge } from '@/components/ui/Badge';
import { ImpactScoreDisplay } from '@/components/ui/ImpactScore';
import { SkeletonPanel } from '@/components/ui/Skeleton';
import { formatDate, truncate } from '@/lib/utils';
import { useNewsStore } from '@/store/newsStore';
import { useArticleSummary, useSimilarArticles, useNewsRecommendations } from '@/hooks/useNews';
import { MOCK_ARTICLES } from '@/lib/mock-data';
import type { NewsArticle } from '@/types';

export function NewsPanel() {
  const { 
    selectedArticle, 
    isPanelOpen, 
    setIsPanelOpen, 
    setSelectedArticle, 
    toggleBookmark, 
    isBookmarked,
    viewedArticles,
    addViewedArticle,
    setFilters
  } = useNewsStore();

  const [clustersExpanded, setClustersExpanded] = useState(false);

  // Track Viewed Article (Smart Recommendations History)
  useEffect(() => {
    if (selectedArticle?.id) {
      addViewedArticle(selectedArticle.id);
    }
  }, [selectedArticle?.id, addViewedArticle]);

  const { data: summaryData, isLoading: isSummaryLoading } = useArticleSummary(selectedArticle?.id);
  const { data: similarArticles = [], isLoading: isSimilarLoading } = useSimilarArticles(selectedArticle?.id);
  const { data: recommendations = [], isLoading: isRecsLoading } = useNewsRecommendations(viewedArticles);

  const close = () => {
    setIsPanelOpen(false);
    setTimeout(() => setSelectedArticle(null), 300);
  };

  return (
    <AnimatePresence>
      {isPanelOpen && selectedArticle && (
        <>
          {/* Backdrop (mobile) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={close}
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 28 }}
            className="fixed right-0 top-14 bottom-8 w-full md:w-[440px] z-40 overflow-y-auto"
            style={{
              background: 'rgba(9, 14, 28, 0.97)',
              backdropFilter: 'blur(24px)',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
            }}
            id="news-panel"
          >
            {/* Header */}
            <div
              className="sticky top-0 z-10 flex items-center justify-between p-4"
              style={{
                background: 'rgba(9, 14, 28, 0.97)',
                backdropFilter: 'blur(20px)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <CategoryBadge category={selectedArticle.category} />
              <div className="flex items-center gap-1">
                <button
                  onClick={() => toggleBookmark(selectedArticle.id)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-saffron-400 hover:bg-white/5 transition-all"
                >
                  {isBookmarked(selectedArticle.id)
                    ? <BookmarkCheck className="w-4 h-4 text-saffron-400" />
                    : <Bookmark className="w-4 h-4" />
                  }
                </button>
                <button
                  onClick={() => { if (navigator.share) { navigator.share({ title: selectedArticle.title, url: window.location.href }); } }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-blue-400 hover:bg-white/5 transition-all"
                >
                  <Share2 className="w-4 h-4" />
                </button>
                <button
                  onClick={close}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-5">
              {/* Image */}
              <div className="relative h-52 rounded-xl overflow-hidden">
                <Image
                  src={selectedArticle.imageUrl}
                  alt={selectedArticle.title}
                  fill
                  className="object-cover"
                  sizes="440px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                {selectedArticle.isBreaking && (
                  <div className="absolute top-3 left-3">
                    <span className="breaking-badge">⚡ Breaking News</span>
                  </div>
                )}
              </div>

              {/* Title */}
              <div>
                <h1 className="text-lg font-bold text-white leading-snug mb-3">
                  {selectedArticle.title}
                </h1>

                {/* Meta row */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span className="font-medium text-saffron-400">{selectedArticle.source.name}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDate(selectedArticle.publishedAt)}
                  </span>
                  {selectedArticle.state && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {selectedArticle.city ? `${selectedArticle.city}, ${selectedArticle.state}` : selectedArticle.state}
                    </span>
                  )}
                </div>
              </div>

              {/* Sentiment + Sentiment bar */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="section-heading">Sentiment Analysis</p>
                  <SentimentBadge sentiment={selectedArticle.sentiment} score={selectedArticle.sentimentScore} />
                </div>
                <div className="h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.abs(selectedArticle.sentimentScore) * 100}%`,
                      background: selectedArticle.sentiment === 'positive'
                        ? 'linear-gradient(90deg, #10b981, #4ade80)'
                        : selectedArticle.sentiment === 'negative'
                        ? 'linear-gradient(90deg, #ef4444, #f87171)'
                        : 'linear-gradient(90deg, #475569, #94a3b8)',
                      marginLeft: selectedArticle.sentiment === 'negative' ? 'auto' : 0,
                    }}
                  />
                </div>
              </div>

              {/* Impact Scores */}
              <div
                className="rounded-xl p-4"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <ImpactScoreDisplay impactScore={selectedArticle.impactScore} />
              </div>

              {/* AI Summary */}
              <div
                className="rounded-xl p-4"
                style={{
                  background: 'linear-gradient(135deg, rgba(251,146,60,0.06), rgba(59,130,246,0.06))',
                  border: '1px solid rgba(251,146,60,0.2)',
                }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-saffron-400 to-orange-600 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <p className="text-xs font-semibold text-saffron-400 uppercase tracking-wide">AI Summary</p>
                </div>
                {isSummaryLoading ? (
                  <div className="space-y-2">
                    <div className="h-3 w-3/4 bg-white/10 rounded animate-pulse" />
                    <div className="h-3 w-full bg-white/10 rounded animate-pulse" />
                    <div className="h-3 w-2/3 bg-white/10 rounded animate-pulse" />
                  </div>
                ) : (
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                    {summaryData?.summary_text || selectedArticle.aiSummary || 'Summary not available.'}
                  </p>
                )}
              </div>

              {/* Full Summary */}
              <div>
                <p className="section-heading mb-2">Summary</p>
                <p className="text-sm text-slate-400 leading-relaxed">{selectedArticle.summary}</p>
              </div>

              {/* Tags (Task 3: Topic Explorer Clickable Tags) */}
              <div>
                <p className="section-heading mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {selectedArticle.tags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setFilters({ search: tag });
                        close();
                      }}
                      className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/05 hover:bg-orange-500/10 border border-white/08 hover:border-orange-500/30 text-slate-400 hover:text-orange-400 transition-all duration-200"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Read Full Article */}
              <Link
                href={`/news/${selectedArticle.id}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all border border-white/08 group"
              >
                <span className="text-sm font-medium text-slate-300 group-hover:text-white">Read Full Article</span>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-saffron-400" />
              </Link>

              {/* Topic Clustering / Similar Stories (Task 4) */}
              {similarArticles.length > 0 && (
                <div className="border-t border-white/05 pt-4">
                  <button
                    onClick={() => setClustersExpanded(!clustersExpanded)}
                    className="flex items-center justify-between w-full section-heading hover:text-white transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      📁 Related Stories ({similarArticles.length})
                    </span>
                    {clustersExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                  </button>
                  
                  {clustersExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="space-y-2 mt-3 overflow-hidden"
                    >
                      {similarArticles.map((art) => (
                        <button
                          key={art.id}
                          onClick={() => setSelectedArticle(art)}
                          className="w-full text-left p-2.5 rounded-xl bg-white/02 hover:bg-white/05 border border-white/05 transition-all text-xs flex gap-3 items-start group"
                        >
                          <div className="relative w-14 h-10 rounded-lg overflow-hidden flex-shrink-0">
                            <Image
                              src={art.imageUrl}
                              alt={art.title}
                              fill
                              className="object-cover"
                              sizes="56px"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-300 group-hover:text-orange-400 transition-colors leading-snug line-clamp-2">
                              {art.title}
                            </p>
                            <p className="text-[9px] text-slate-600 mt-1">{art.source.name} · {art.state}</p>
                          </div>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </div>
              )}

              {/* Smart Recommendations - You May Also Like (Task 5) */}
              {recommendations.length > 0 && (
                <div className="border-t border-white/05 pt-4">
                  <p className="section-heading mb-3 flex items-center gap-1.5">
                    ✨ You May Also Like
                  </p>
                  <div className="grid grid-cols-2 gap-2.5">
                    {recommendations.slice(0, 4).map((art) => (
                      <button
                        key={art.id}
                        onClick={() => setSelectedArticle(art)}
                        className="text-left p-2 rounded-xl bg-white/02 hover:bg-white/05 border border-white/05 hover:border-white/08 transition-all flex flex-col gap-2 group"
                      >
                        <div className="relative w-full h-16 rounded-lg overflow-hidden">
                          <Image
                            src={art.imageUrl}
                            alt={art.title}
                            fill
                            className="object-cover"
                            sizes="120px"
                          />
                        </div>
                        <div className="min-w-0 flex-1 flex flex-col justify-between">
                          <p className="text-[10px] font-semibold text-slate-300 group-hover:text-orange-400 leading-tight line-clamp-2 transition-colors">
                            {art.title}
                          </p>
                          <p className="text-[8px] text-slate-600 mt-1 capitalize font-medium truncate">
                            {art.category} · {art.source.name}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
