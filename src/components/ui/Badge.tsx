import { cn } from '@/lib/utils';
import type { NewsCategory } from '@/types';
import { CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/mock-data';

interface BadgeProps {
  children?: React.ReactNode;
  variant?: 'default' | 'outline' | 'solid';
  color?: string;
  className?: string;
}

export function Badge({ children, className }: BadgeProps) {
  return (
    <span className={cn('badge', className)}>
      {children}
    </span>
  );
}

interface CategoryBadgeProps {
  category: NewsCategory;
  showIcon?: boolean;
  className?: string;
}

export function CategoryBadge({ category, showIcon = true, className }: CategoryBadgeProps) {
  const color = CATEGORY_COLORS[category];
  const icon = CATEGORY_ICONS[category];
  const label = CATEGORY_LABELS[category];

  return (
    <span
      className={cn('badge', className)}
      style={{
        backgroundColor: `${color}20`,
        color: color,
        borderColor: `${color}40`,
      }}
    >
      {showIcon && <span>{icon}</span>}
      {label}
    </span>
  );
}

interface SentimentBadgeProps {
  sentiment: 'positive' | 'negative' | 'neutral';
  score?: number;
  className?: string;
}

export function SentimentBadge({ sentiment, score, className }: SentimentBadgeProps) {
  const configs = {
    positive: { color: '#4ade80', label: '↑ Positive' },
    negative: { color: '#f87171', label: '↓ Negative' },
    neutral:  { color: '#94a3b8', label: '→ Neutral' },
  };
  const cfg = configs[sentiment];

  return (
    <span
      className={cn('badge', className)}
      style={{
        backgroundColor: `${cfg.color}20`,
        color: cfg.color,
        borderColor: `${cfg.color}40`,
      }}
    >
      {cfg.label}
      {score !== undefined && (
        <span className="opacity-70 ml-1">({score > 0 ? '+' : ''}{(score * 100).toFixed(0)})</span>
      )}
    </span>
  );
}
