import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  if (isToday(date)) {
    return formatDistanceToNow(date, { addSuffix: true });
  }
  if (isYesterday(date)) {
    return `Yesterday at ${format(date, 'h:mm a')}`;
  }
  return format(date, 'MMM d, yyyy');
}

export function formatDate(dateStr: string): string {
  return format(new Date(dateStr), 'MMMM d, yyyy · h:mm a');
}

export function formatNumber(n: number): string {
  if (n >= 1_00_00_000) return `${(n / 1_00_00_000).toFixed(1)}Cr`;
  if (n >= 1_00_000)    return `${(n / 1_00_000).toFixed(1)}L`;
  if (n >= 1_000)       return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + '…';
}

export function getSentimentColor(sentiment: 'positive' | 'negative' | 'neutral'): string {
  switch (sentiment) {
    case 'positive': return 'text-emerald-400';
    case 'negative': return 'text-red-400';
    default:         return 'text-slate-400';
  }
}

export function getSentimentBg(sentiment: 'positive' | 'negative' | 'neutral'): string {
  switch (sentiment) {
    case 'positive': return 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30';
    case 'negative': return 'bg-red-400/15 text-red-300 border-red-400/30';
    default:         return 'bg-slate-400/15 text-slate-300 border-slate-400/30';
  }
}

export function scoreToColor(score: number): string {
  if (score >= 75) return '#10b981'; // emerald
  if (score >= 50) return '#f59e0b'; // amber
  if (score >= 25) return '#f97316'; // orange
  return '#ef4444'; // red
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}
