'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { Clock, MapPin, Eye, Bookmark, BookmarkCheck } from 'lucide-react';
import { CategoryBadge, SentimentBadge } from '@/components/ui/Badge';
import { formatRelativeTime, truncate } from '@/lib/utils';
import { useNewsStore } from '@/store/newsStore';
import type { NewsArticle } from '@/types';

interface NewsCardProps {
  article: NewsArticle;
  onClick?: () => void;
  compact?: boolean;
  index?: number;
}

export function NewsCard({ article, onClick, compact = false, index = 0 }: NewsCardProps) {
  const { toggleBookmark, isBookmarked } = useNewsStore();
  const bookmarked = isBookmarked(article.id);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      className="glass-card p-3 cursor-pointer group"
      onClick={onClick}
      id={`news-card-${article.id}`}
    >
      {/* Image */}
      {!compact && (
        <div className="relative h-40 rounded-xl overflow-hidden mb-3">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 400px"
          />
          {article.isBreaking && (
            <div className="absolute top-2 left-2">
              <span className="breaking-badge">⚡ Breaking</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center gap-2 mb-2">
        <CategoryBadge category={article.category} showIcon={!compact} />
        {compact && article.isBreaking && (
          <span className="breaking-badge">⚡</span>
        )}
      </div>

      {/* Title */}
      <h3 className={`font-semibold text-slate-100 leading-snug mb-2 group-hover:text-saffron-400 transition-colors ${compact ? 'text-xs' : 'text-sm'}`}>
        {compact ? truncate(article.title, 80) : truncate(article.title, 120)}
      </h3>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-slate-500 text-xs">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatRelativeTime(article.publishedAt)}
          </span>
          {article.state && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              {article.city || article.state}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {article.viewCount && (
            <span className="flex items-center gap-1 text-xs text-slate-600">
              <Eye className="w-3 h-3" />
              {(article.viewCount / 1000).toFixed(0)}K
            </span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); toggleBookmark(article.id); }}
            className="text-slate-600 hover:text-saffron-400 transition-colors"
          >
            {bookmarked
              ? <BookmarkCheck className="w-3.5 h-3.5 text-saffron-400" />
              : <Bookmark className="w-3.5 h-3.5" />
            }
          </button>
        </div>
      </div>
    </motion.div>
  );
}
