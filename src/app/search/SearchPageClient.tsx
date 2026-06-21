'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, X, SlidersHorizontal, Clock, TrendingUp, ArrowRight,
  MapPin, Tag, Calendar, BarChart2, Filter, Newspaper, ChevronDown,
  Zap, Globe
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Providers } from '@/components/Providers';
import { useAdvancedSearch, useSearchHistory, type SearchFilters } from '@/hooks/useAdvancedSearch';
import type { NewsArticle, NewsCategory, IndianState, Sentiment } from '@/types';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORIES: NewsCategory[] = [
  'politics', 'technology', 'startups', 'business', 'sports',
  'entertainment', 'education', 'science', 'weather', 'crime', 'health', 'government',
];

const STATES: IndianState[] = [
  'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh',
  'West Bengal', 'Gujarat', 'Rajasthan', 'Telangana', 'Kerala',
  'Madhya Pradesh', 'Bihar', 'Punjab', 'Haryana', 'Odisha',
];

const SENTIMENTS: { value: Sentiment; label: string; color: string }[] = [
  { value: 'positive', label: '😊 Positive', color: '#10b981' },
  { value: 'negative', label: '😞 Negative', color: '#ef4444' },
  { value: 'neutral',  label: '😐 Neutral',  color: '#64748b' },
];

const CAT_COLORS: Record<string, string> = {
  politics: '#ef4444', technology: '#3b82f6', startups: '#8b5cf6',
  business: '#f59e0b', sports: '#10b981', entertainment: '#ec4899',
  education: '#06b6d4', science: '#6366f1', weather: '#14b8a6',
  crime: '#f97316', health: '#84cc16', government: '#64748b',
};

const GLASS = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 16,
};

// ── Tiny helpers ──────────────────────────────────────────────────────────────
function timeAgo(s: string) {
  const d = Date.now() - new Date(s).getTime();
  if (d < 3_600_000) return `${Math.floor(d / 60_000)}m ago`;
  if (d < 86_400_000) return `${Math.floor(d / 3_600_000)}h ago`;
  return `${Math.floor(d / 86_400_000)}d ago`;
}

function highlight(text: string, q: string) {
  if (!q) return text;
  const parts = text.split(new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === q.toLowerCase()
      ? <mark key={i} className="bg-saffron-400/25 text-saffron-300 rounded px-0.5">{part}</mark>
      : part
  );
}

// ── Article card ──────────────────────────────────────────────────────────────
function ArticleCard({ article, query }: { article: NewsArticle; query: string }) {
  const catColor = CAT_COLORS[article.category] ?? '#64748b';
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group flex gap-4 p-4 rounded-xl transition-all cursor-pointer hover:bg-white/[0.04]"
      style={{ border: '1px solid rgba(255,255,255,0.05)' }}
    >
      {/* Thumbnail */}
      <div className="relative w-20 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
        {article.imageUrl && (
          <img
            src={article.imageUrl}
            alt=""
            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {article.isBreaking && (
            <span className="flex items-center gap-1 text-[10px] font-bold text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">
              <Zap className="w-2.5 h-2.5" /> BREAKING
            </span>
          )}
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ background: `${catColor}15`, color: catColor, border: `1px solid ${catColor}25` }}
          >
            {article.category}
          </span>
          {article.state && (
            <span className="flex items-center gap-1 text-[10px] text-slate-500">
              <MapPin className="w-2.5 h-2.5" />{article.state}
            </span>
          )}
        </div>

        <Link href={`/news/${article.id}`}>
          <h3 className="text-sm font-semibold text-slate-200 leading-snug group-hover:text-white line-clamp-2 mb-1">
            {highlight(article.title, query)}
          </h3>
        </Link>

        <p className="text-xs text-slate-500 line-clamp-1 mb-2">
          {highlight(article.description?.slice(0, 120) || '', query)}
        </p>

        <div className="flex items-center gap-3 text-[10px] text-slate-600">
          <span>{article.source?.name}</span>
          <span>·</span>
          <span className="flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{timeAgo(article.publishedAt)}</span>
          <span>·</span>
          <span
            className="font-medium"
            style={{ color: article.sentiment === 'positive' ? '#10b981' : article.sentiment === 'negative' ? '#ef4444' : '#64748b' }}
          >
            {article.sentiment}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Filter sidebar ────────────────────────────────────────────────────────────
function FilterSidebar({
  filters, setFilters, onReset,
}: {
  filters: SearchFilters;
  setFilters: (f: Partial<SearchFilters>) => void;
  onReset: () => void;
}) {
  return (
    <div className="space-y-5">
      {/* Category */}
      <div>
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Tag className="w-3 h-3" /> Category
        </p>
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((cat) => {
            const active = filters.category === cat;
            return (
              <button
                key={cat}
                onClick={() => setFilters({ category: active ? '' : cat })}
                className="text-[10px] font-semibold px-2 py-1 rounded-lg capitalize transition-all"
                style={
                  active
                    ? { background: `${CAT_COLORS[cat]}25`, color: CAT_COLORS[cat], border: `1px solid ${CAT_COLORS[cat]}40` }
                    : { background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.06)' }
                }
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* State */}
      <div>
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Globe className="w-3 h-3" /> State
        </p>
        <select
          value={filters.state || ''}
          onChange={(e) => setFilters({ state: e.target.value as IndianState | '' })}
          className="w-full text-xs px-3 py-2 rounded-lg outline-none transition-all"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8' }}
        >
          <option value="">All States</option>
          {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      {/* Sentiment */}
      <div>
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2">Sentiment</p>
        <div className="flex gap-2">
          {SENTIMENTS.map(({ value, label, color }) => (
            <button
              key={value}
              onClick={() => setFilters({ sentiment: filters.sentiment === value ? '' : value })}
              className="flex-1 text-[10px] font-semibold py-1.5 rounded-lg transition-all"
              style={
                filters.sentiment === value
                  ? { background: `${color}20`, color, border: `1px solid ${color}40` }
                  : { background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.06)' }
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Date Range */}
      <div>
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1">
          <Calendar className="w-3 h-3" /> Date Range
        </p>
        <div className="grid grid-cols-3 gap-1.5">
          {(['today', '7days', '30days'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setFilters({ dateRange: filters.dateRange === r ? '' : r })}
              className="text-[10px] font-semibold py-1.5 rounded-lg transition-all"
              style={
                filters.dateRange === r
                  ? { background: 'rgba(251,146,60,0.15)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.3)' }
                  : { background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.06)' }
              }
            >
              {r === 'today' ? 'Today' : r === '7days' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Sort */}
      <div>
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1">
          <BarChart2 className="w-3 h-3" /> Sort By
        </p>
        <div className="flex gap-1.5">
          {(['relevance', 'date', 'views'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilters({ sort: s })}
              className="flex-1 text-[10px] font-semibold py-1.5 rounded-lg capitalize transition-all"
              style={
                (filters.sort ?? 'relevance') === s
                  ? { background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)' }
                  : { background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.06)' }
              }
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Reset */}
      <button
        onClick={onReset}
        className="w-full text-xs font-medium text-slate-500 hover:text-red-400 py-2 rounded-lg hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
      >
        Reset all filters
      </button>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const DEFAULT_FILTERS: SearchFilters = { q: '', state: '', category: '', sentiment: '', dateRange: '', sort: 'relevance' };

function SearchPage() {
  const [filters, setFiltersState] = useState<SearchFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { history, addToHistory, clearHistory } = useSearchHistory();

  const setFilters = (partial: Partial<SearchFilters>) =>
    setFiltersState((prev) => ({ ...prev, ...partial }));

  const { data, isLoading, isFetching } = useAdvancedSearch(filters);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filters.q.trim()) addToHistory(filters.q.trim());
    setShowHistory(false);
  };

  const hasFilters = !!(filters.category || filters.state || filters.sentiment || filters.dateRange);
  const activeFilterCount = [filters.category, filters.state, filters.sentiment, filters.dateRange].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <NotificationCenter />

      <div className="pt-14 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-white mb-1">
            News Search
          </h1>
          <p className="text-slate-500 text-sm">Search through thousands of articles from across India</p>
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="relative mb-6"
        >
          <form onSubmit={handleSubmit} className="relative">
            <div
              className="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${filters.q ? 'rgba(251,146,60,0.4)' : 'rgba(255,255,255,0.08)'}`,
                boxShadow: filters.q ? '0 0 0 3px rgba(251,146,60,0.08)' : 'none',
              }}
            >
              <Search className="w-5 h-5 text-slate-500 flex-shrink-0" />
              <input
                ref={inputRef}
                value={filters.q}
                onChange={(e) => setFilters({ q: e.target.value })}
                onFocus={() => setShowHistory(true)}
                onBlur={() => setTimeout(() => setShowHistory(false), 200)}
                placeholder="Search news, states, topics, sources..."
                className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none"
                autoComplete="off"
              />
              {(isLoading || isFetching) && (
                <div className="w-4 h-4 rounded-full border-2 border-saffron-400/40 border-t-saffron-400 animate-spin flex-shrink-0" />
              )}
              {filters.q && (
                <button
                  type="button"
                  onClick={() => setFilters({ q: '' })}
                  className="text-slate-600 hover:text-slate-300 flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex-shrink-0"
                style={
                  showFilters
                    ? { background: 'rgba(251,146,60,0.15)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.25)' }
                    : { background: 'rgba(255,255,255,0.06)', color: '#64748b', border: '1px solid rgba(255,255,255,0.08)' }
                }
              >
                <Filter className="w-3.5 h-3.5" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="bg-saffron-400 text-slate-900 text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Search history dropdown */}
          <AnimatePresence>
            {showHistory && history.length > 0 && !filters.q && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute left-0 right-0 top-full mt-2 rounded-xl overflow-hidden z-30"
                style={{ background: 'rgba(9,14,28,0.97)', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
              >
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
                  <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Recent Searches
                  </span>
                  <button onClick={clearHistory} className="text-[10px] text-slate-600 hover:text-red-400">Clear</button>
                </div>
                {history.map((h) => (
                  <button
                    key={h}
                    onMouseDown={() => { setFilters({ q: h }); addToHistory(h); setShowHistory(false); }}
                    className="w-full text-left flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:bg-white/5 transition-colors"
                  >
                    <Clock className="w-3.5 h-3.5 text-slate-600" />
                    {h}
                    <ArrowRight className="w-3 h-3 text-slate-700 ml-auto" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Body: Filters + Results */}
        <div className="flex gap-6">
          {/* Sidebar filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.aside
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 240 }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0 overflow-hidden"
              >
                <div className="w-60 p-4 rounded-2xl" style={GLASS}>
                  <FilterSidebar
                    filters={filters}
                    setFilters={setFilters}
                    onReset={() => setFiltersState(DEFAULT_FILTERS)}
                  />
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Stats bar */}
            {data && filters.q.length >= 2 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between mb-4"
              >
                <p className="text-xs text-slate-500">
                  <span className="font-bold text-slate-300">{data.totalResults}</span> results for{' '}
                  <span className="text-saffron-400 font-medium">"{filters.q}"</span>
                  {hasFilters && ' (filtered)'}
                </p>
                <div className="flex items-center gap-2">
                  {hasFilters && (
                    <button
                      onClick={() => setFiltersState(DEFAULT_FILTERS)}
                      className="text-xs text-slate-600 hover:text-saffron-400 flex items-center gap-1"
                    >
                      <X className="w-3 h-3" /> Clear filters
                    </button>
                  )}
                </div>
              </motion.div>
            )}

            {/* Autocomplete suggestions */}
            {data?.suggestions && data.suggestions.length > 0 && filters.q.length >= 2 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {data.suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setFilters({ q: s }); addToHistory(s); }}
                    className="text-[10px] font-medium px-2.5 py-1 rounded-full text-slate-400 hover:text-saffron-400 transition-colors"
                    style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)' }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Empty state */}
            {!filters.q || filters.q.length < 2 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.2)' }}
                >
                  <Search className="w-8 h-8 text-saffron-400/60" />
                </div>
                <h2 className="text-lg font-bold text-slate-400 mb-2">Search India's News</h2>
                <p className="text-sm text-slate-600 max-w-xs">
                  Type at least 2 characters to search across articles, states, topics, and categories.
                </p>
                {history.length > 0 && (
                  <div className="mt-6">
                    <p className="text-xs text-slate-600 mb-2">Try a recent search:</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {history.slice(0, 5).map((h) => (
                        <button
                          key={h}
                          onClick={() => setFilters({ q: h })}
                          className="text-xs text-slate-400 hover:text-saffron-400 px-3 py-1.5 rounded-lg transition-all"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : isLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-24 rounded-xl skeleton" />
                ))}
              </div>
            ) : data?.articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Newspaper className="w-12 h-12 text-slate-700 mb-4" />
                <p className="text-slate-400 font-semibold mb-1">No results found</p>
                <p className="text-slate-600 text-sm">Try a different query or adjust your filters</p>
                <button
                  onClick={() => setFiltersState(DEFAULT_FILTERS)}
                  className="mt-4 text-xs text-saffron-400 hover:text-saffron-300"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              <div className="space-y-1">
                {data?.articles.map((article) => (
                  <ArticleCard key={article.id} article={article} query={filters.q} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function SearchPageClient() {
  return (
    <Providers>
      <SearchPage />
    </Providers>
  );
}
