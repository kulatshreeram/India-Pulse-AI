import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import {
  ArrowLeft, Clock, MapPin, ExternalLink,
  Eye, Sparkles, Tag
} from 'lucide-react';
import { MOCK_ARTICLES, CATEGORY_COLORS, CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/mock-data';
import { formatDate } from '@/lib/utils';
import { ImpactScoreDisplay } from '@/components/ui/ImpactScore';

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  return MOCK_ARTICLES.map((a) => ({ id: a.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const article = MOCK_ARTICLES.find((a) => a.id === id);
  if (!article) return { title: 'Article Not Found' };
  return {
    title: `${article.title} — India Pulse AI`,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      images: [article.imageUrl],
    },
  };
}

export default async function NewsArticlePage({ params }: Props) {
  const { id } = await params;
  const article = MOCK_ARTICLES.find((a) => a.id === id);
  if (!article) notFound();

  const related = MOCK_ARTICLES.filter(
    (a) => a.id !== article.id && a.category === article.category
  ).slice(0, 3);

  const color = CATEGORY_COLORS[article.category];
  const sentColor =
    article.sentiment === 'positive' ? '#10b981'
    : article.sentiment === 'negative' ? '#ef4444'
    : '#64748b';

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Simple top nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center px-6 gap-4"
        style={{
          background: 'rgba(2,6,23,0.9)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Map
        </Link>
        <div className="flex-1" />
        <span
          className="px-2.5 py-1 rounded-lg text-xs font-semibold"
          style={{ background: `${color}20`, color }}
        >
          {CATEGORY_ICONS[article.category]} {CATEGORY_LABELS[article.category]}
        </span>
      </nav>

      <div className="pt-14 max-w-3xl mx-auto px-6 py-10">
        {/* Hero image */}
        <div className="relative h-72 rounded-2xl overflow-hidden mb-8">
          <Image
            src={article.imageUrl}
            alt={article.title}
            fill
            className="object-cover"
            sizes="768px"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          {article.isBreaking && (
            <div className="absolute top-4 left-4">
              <span className="breaking-badge">⚡ Breaking News</span>
            </div>
          )}
        </div>

        {/* Article header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight mb-4">
            {article.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mb-4">
            <span className="font-semibold" style={{ color }}>
              {article.source.name}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDate(article.publishedAt)}
            </span>
            {article.state && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {article.city ? `${article.city}, ${article.state}` : article.state}
              </span>
            )}
            {article.viewCount && (
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {(article.viewCount / 1000).toFixed(0)}K views
              </span>
            )}
          </div>

          {/* Sentiment badge */}
          <span
            className="badge"
            style={{
              background: `${sentColor}18`,
              color: sentColor,
              borderColor: `${sentColor}35`,
            }}
          >
            {article.sentiment === 'positive' ? '↑ Positive' : article.sentiment === 'negative' ? '↓ Negative' : '→ Neutral'} Sentiment
            <span className="opacity-60 ml-1">({article.sentimentScore > 0 ? '+' : ''}{(article.sentimentScore * 100).toFixed(0)})</span>
          </span>
        </div>

        {/* AI Summary */}
        {article.aiSummary && (
          <div
            className="rounded-2xl p-5 mb-6"
            style={{
              background: 'linear-gradient(135deg, rgba(251,146,60,0.07), rgba(59,130,246,0.07))',
              border: '1px solid rgba(251,146,60,0.2)',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #fb923c, #f97316)' }}
              >
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <p className="text-xs font-bold text-orange-400 uppercase tracking-wider">AI Summary</p>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">{article.aiSummary}</p>
          </div>
        )}

        {/* Impact Score */}
        <div
          className="rounded-2xl p-5 mb-6"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <ImpactScoreDisplay impactScore={article.impactScore} />
        </div>

        {/* Article description */}
        <div className="mb-6">
          <h2 className="text-base font-bold text-white mb-3">Full Story</h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-4">{article.description}</p>
          <p className="text-slate-400 text-sm leading-relaxed">{article.summary}</p>
        </div>

        {/* Tags */}
        <div className="mb-8">
          <p className="section-heading mb-3 flex items-center gap-2">
            <Tag className="w-3.5 h-3.5" /> Tags
          </p>
          <div className="flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-lg text-xs font-medium"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  color: '#94a3b8',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* Source link */}
        <a
          href={article.source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-between p-4 rounded-2xl mb-10 group transition-all"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div>
            <p className="text-sm font-semibold text-slate-200 group-hover:text-white transition-colors">
              Read on {article.source.name}
            </p>
            <p className="text-xs text-slate-600">{article.source.url}</p>
          </div>
          <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-orange-400 transition-colors" />
        </a>

        {/* Related Articles */}
        {related.length > 0 && (
          <div>
            <h2 className="text-base font-bold text-white mb-4">Related Articles</h2>
            <div className="space-y-3">
              {related.map((rel) => (
                <Link
                  key={rel.id}
                  href={`/news/${rel.id}`}
                  className="flex gap-4 p-3 rounded-2xl group transition-all hover:-translate-y-0.5"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <div className="relative w-20 h-14 rounded-xl overflow-hidden flex-shrink-0">
                    <Image
                      src={rel.imageUrl}
                      alt={rel.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200 group-hover:text-orange-400 transition-colors leading-snug line-clamp-2">
                      {rel.title}
                    </p>
                    <p className="text-xs text-slate-600 mt-1">{rel.source.name} · {rel.state}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
