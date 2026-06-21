'use client';

import Link from 'next/link';
import { useAppAuth } from '@/context/AuthContext';
import { usePersonalizedNews } from '@/hooks/useNews';
import { truncate, formatRelativeTime } from '@/lib/utils';
import { CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/mock-data';
import { ArrowRight, Sparkles, Loader2, BookOpen } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import type { NewsCategory } from '@/types';

interface PersonalizedGridProps {
  fallbackArticles: any[];
}

export function PersonalizedGrid({ fallbackArticles }: PersonalizedGridProps) {
  const { user, isSignedIn, isLoading: isAuthLoading } = useAppAuth();
  const { data: personalizedRes, isLoading: isNewsLoading } = usePersonalizedNews();
  const { t } = useTranslation();

  const personalizedArticles = personalizedRes?.articles || [];
  const active = isSignedIn && user && user.interests.length > 0;

  if (isAuthLoading || (active && isNewsLoading)) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 text-orange-500 animate-spin mr-2" />
        <span className="text-xs text-slate-500 font-bold">{t('Loading recommendations...')}</span>
      </div>
    );
  }

  // If personalized is active and has articles
  if (active && personalizedArticles.length > 0) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              <span>Recommended For You</span>
            </div>
            <h2 className="text-2xl font-bold text-white">Tailored news from your interests</h2>
          </div>
          <Link
            href="/profile"
            className="text-xs font-bold text-slate-500 hover:text-orange-400 transition-colors uppercase tracking-wider border border-white/5 bg-slate-900/40 px-3 py-1.5 rounded-lg"
          >
            Edit Interests
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {personalizedArticles.slice(0, 6).map((article) => (
            <Link
              key={article.id}
              href={`/dashboard?search=${encodeURIComponent(article.title)}`}
              className="group p-4 rounded-2xl transition-all duration-200"
              style={{
                background: 'rgba(9, 14, 28, 0.65)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <div
                className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider mb-2"
                style={{
                  background: `${CATEGORY_COLORS[article.category as NewsCategory]}20`,
                  color: CATEGORY_COLORS[article.category as NewsCategory],
                }}
              >
                {CATEGORY_ICONS[article.category as NewsCategory]} {article.category}
              </div>
              <h3 className="text-sm font-semibold text-slate-100 group-hover:text-orange-400 transition-colors leading-snug mb-2">
                {truncate(article.title, 100)}
              </h3>
              <p className="text-xs text-slate-600">
                {article.source.name} · {article.state} · {formatRelativeTime(article.publishedAt)}
              </p>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // If logged in but no interests selected
  if (isSignedIn && user && user.interests.length === 0) {
    return (
      <div className="p-8 rounded-2xl border border-dashed border-white/5 bg-slate-900/20 text-center flex flex-col items-center justify-center gap-3">
        <BookOpen className="w-8 h-8 text-slate-600" />
        <h3 className="text-sm font-bold text-slate-300">Tailor your personal news feed</h3>
        <p className="text-xs text-slate-500 max-w-sm">Select category interests in your profile setup to activate Recommended For You bulletins.</p>
        <Link
          href="/profile"
          className="mt-2 px-4 py-2 rounded-xl text-xs font-bold text-white"
          style={{ background: 'linear-gradient(135deg, #fb923c, #f97316)' }}
        >
          Select Interests
        </Link>
      </div>
    );
  }

  // Fallback default Latest News (anonymous view)
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">Latest from Across India</h2>
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-sm font-medium"
          style={{ color: '#fb923c' }}
        >
          Explore map <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {fallbackArticles.map((article) => (
          <Link
            key={article.id}
            href={`/dashboard?search=${encodeURIComponent(article.title)}`}
            className="group p-4 rounded-2xl transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <div
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold mb-2"
              style={{
                background: `${CATEGORY_COLORS[article.category as NewsCategory]}20`,
                color: CATEGORY_COLORS[article.category as NewsCategory],
              }}
            >
              {CATEGORY_ICONS[article.category as NewsCategory]} {article.category}
            </div>
            <h3 className="text-sm font-semibold text-slate-100 group-hover:text-orange-400 transition-colors leading-snug mb-2">
              {truncate(article.title, 100)}
            </h3>
            <p className="text-xs text-slate-600">
              {article.source.name} · {article.state} · {formatRelativeTime(article.publishedAt)}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
