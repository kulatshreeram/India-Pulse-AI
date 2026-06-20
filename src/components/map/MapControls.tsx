'use client';

import { motion } from 'framer-motion';
import { Layers, Thermometer, Filter, RotateCcw } from 'lucide-react';
import { useNewsStore } from '@/store/newsStore';
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/mock-data';
import type { NewsCategory } from '@/types';

import { useTranslation } from '@/hooks/useTranslation';

const CATEGORIES: NewsCategory[] = [
  'politics', 'technology', 'startups', 'business', 'sports',
  'entertainment', 'education', 'science', 'weather', 'crime', 'health', 'government',
];

const DATE_RANGES = [
  { value: 'today',   label: 'Today' },
  { value: '7days',   label: '7 Days' },
  { value: '30days',  label: '30 Days' },
] as const;

export function MapControls() {
  const { filters, setFilters, resetFilters, isHeatmapMode, toggleHeatmap } = useNewsStore();
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="absolute left-3 top-3 bottom-12 z-30 flex flex-col gap-3 w-[200px] pointer-events-none"
    >
      {/* Filter Panel */}
      <div
        className="pointer-events-auto"
        style={{
          background: 'rgba(9, 14, 28, 0.92)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 14,
          padding: '14px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-saffron-400" />
            <span className="text-xs font-semibold text-slate-200">{t("Filter News")}</span>
          </div>
          {(filters.category || filters.dateRange) && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-saffron-400 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              {t("Reset")}
            </button>
          )}
        </div>

        {/* Date Range */}
        <p className="section-heading mb-2">{t("Date Range")}</p>
        <div className="flex gap-1 mb-4">
          {DATE_RANGES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() =>
                setFilters({ dateRange: filters.dateRange === value ? undefined : value })
              }
              className="flex-1 py-1 rounded-lg text-xs font-medium transition-all"
              style={{
                background: filters.dateRange === value
                  ? 'rgba(251,146,60,0.2)'
                  : 'rgba(255,255,255,0.04)',
                color: filters.dateRange === value ? '#fb923c' : '#64748b',
                border: `1px solid ${filters.dateRange === value ? 'rgba(251,146,60,0.4)' : 'rgba(255,255,255,0.06)'}`,
              }}
            >
              {t(label)}
            </button>
          ))}
        </div>

        {/* Categories */}
        <p className="section-heading mb-2">{t("Categories")}</p>
        <div className="space-y-1">
          {CATEGORIES.map((cat) => {
            const isActive = filters.category === cat;
            const color = CATEGORY_COLORS[cat];
            return (
              <button
                key={cat}
                onClick={() => setFilters({ category: isActive ? undefined : cat })}
                className="w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs transition-all"
                style={{
                  background: isActive ? `${color}20` : 'transparent',
                  color: isActive ? color : '#64748b',
                  border: `1px solid ${isActive ? `${color}40` : 'transparent'}`,
                }}
              >
                <span className="text-sm">{CATEGORY_ICONS[cat]}</span>
                <span className="font-medium">{t(CATEGORY_LABELS[cat])}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Heatmap Toggle */}
      <button
        onClick={toggleHeatmap}
        className="pointer-events-auto flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all"
        style={{
          background: isHeatmapMode ? 'rgba(251,146,60,0.2)' : 'rgba(9,14,28,0.92)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${isHeatmapMode ? 'rgba(251,146,60,0.4)' : 'rgba(255,255,255,0.08)'}`,
          color: isHeatmapMode ? '#fb923c' : '#64748b',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        }}
      >
        <Layers className="w-4 h-4" />
        {t("Heatmap Mode")} {isHeatmapMode ? 'On' : 'Off'}
      </button>
    </motion.div>
  );
}
