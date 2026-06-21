import Link from 'next/link';
import { Metadata } from 'next';
import {
  Map, Bot, BarChart3, Zap, Globe,
  ArrowRight, TrendingUp, Shield, Sparkles,
  Newspaper, Radio, Star
} from 'lucide-react';
import { MOCK_ARTICLES, CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/mock-data';
import { formatRelativeTime, truncate } from '@/lib/utils';
import { PersonalizedGrid } from '@/components/news/PersonalizedGrid';
import type { NewsCategory } from '@/types';

export const metadata: Metadata = {
  title: 'India Pulse AI — Real-Time Interactive News Intelligence Platform',
  description:
    'Explore Indian news geographically on a live interactive map. AI summaries, sentiment analysis, trending topics, and an intelligent news assistant — all in one platform.',
};

const STATS = [
  { value: '28+', label: 'States Covered',     icon: Map },
  { value: '12',  label: 'News Categories',    icon: Newspaper },
  { value: '60+', label: 'Live Articles',       icon: Radio },
  { value: '4.9', label: 'User Rating',         icon: Star },
];

const FEATURES = [
  {
    icon: Map,
    title: 'Interactive India Map',
    description:
      'Explore geo-tagged news on an animated interactive map of India. Zoom into any state, click any city, discover what\'s happening right now.',
    color: '#fb923c',
    gradient: 'from-orange-500/20 to-amber-500/10',
  },
  {
    icon: Sparkles,
    title: 'AI News Intelligence',
    description:
      'Every article gets an AI-generated summary, impact assessment, and sentiment score. Powered by GPT-4o with no hallucinations — every fact is sourced.',
    color: '#3b82f6',
    gradient: 'from-blue-500/20 to-indigo-500/10',
  },
  {
    icon: Bot,
    title: 'AI News Assistant',
    description:
      '"What happened in Maharashtra today?" "Show startup news from Bengaluru." Ask anything — your AI assistant answers using the latest verified news data.',
    color: '#10b981',
    gradient: 'from-emerald-500/20 to-teal-500/10',
  },
  {
    icon: BarChart3,
    title: 'Live Analytics',
    description:
      'Trending topics, sentiment distribution, most active states, category breakdowns, and timeline views — the complete news intelligence dashboard.',
    color: '#a855f7',
    gradient: 'from-purple-500/20 to-violet-500/10',
  },
  {
    icon: Globe,
    title: 'Multilingual',
    description:
      'Read AI summaries in English, Hindi, and Marathi. India\'s news intelligence platform built for all of India.',
    color: '#14b8a6',
    gradient: 'from-teal-500/20 to-cyan-500/10',
  },
  {
    icon: Shield,
    title: 'Verified Sources',
    description:
      'News aggregated from NDTV, Times of India, The Hindu, Economic Times, Hindustan Times, and 20+ trusted Indian publications.',
    color: '#84cc16',
    gradient: 'from-lime-500/20 to-green-500/10',
  },
];

export const dynamic = 'force-dynamic';

async function getHomepageData() {
  try {
    const [newsRes, analyticsRes] = await Promise.all([
      fetch('http://127.0.0.1:8000/api/news?limit=20', { next: { revalidate: 15 } }),
      fetch('http://127.0.0.1:8000/api/analytics', { next: { revalidate: 15 } })
    ]);
    
    if (!newsRes.ok || !analyticsRes.ok) return null;
    return {
      newsData: await newsRes.json(),
      analyticsData: await analyticsRes.json()
    };
  } catch (e) {
    return null;
  }
}

export default async function LandingPage() {
  const data = await getHomepageData();
  
  let breakingArticles: any[] = [];
  let latestArticles: any[] = [];
  let trendingTopics: any[] = [];
  let mostDiscussedState = 'Maharashtra';
  let topCategory = 'politics';
  
  let statsValues = {
    states: '28+',
    categories: '12',
    articles: '60+',
  };
  
  if (data) {
    const allArticles = data.newsData.articles || [];
    breakingArticles = allArticles.filter((a: any) => a.isBreaking).slice(0, 4);
    if (breakingArticles.length === 0) {
      breakingArticles = allArticles.slice(0, 4);
    }
    latestArticles = allArticles.slice(0, 6);
    trendingTopics = data.analyticsData.trendingTopics || [];
    
    const sortedStates = [...(data.analyticsData.stateActivity || [])].sort(
      (a: any, b: any) => b.articleCount - a.articleCount
    );
    mostDiscussedState = sortedStates[0]?.state || 'Maharashtra';
    
    const sortedCats = [...(data.analyticsData.categoryBreakdown || [])].sort(
      (a: any, b: any) => b.count - a.count
    );
    topCategory = sortedCats[0]?.category || 'politics';
    
    statsValues = {
      states: String(data.analyticsData.totalStates || '28+'),
      categories: String(data.analyticsData.totalCategories || '12'),
      articles: String(data.analyticsData.totalArticles || '60+'),
    };
  } else {
    // Fallback using mock data mapping
    const fallback = MOCK_ARTICLES.map((a) => ({
      id: a.id,
      title: a.title,
      description: a.description,
      summary: a.summary,
      publishedAt: a.publishedAt,
      category: a.category,
      isBreaking: a.isBreaking,
      state: a.state,
      source: { name: a.source.name, url: a.source.url },
    }));
    breakingArticles = fallback.filter((a) => a.isBreaking).slice(0, 4);
    latestArticles = fallback.slice(0, 6);
    trendingTopics = [
      { topic: 'Electric Vehicles' },
      { topic: 'Startup Funding' },
      { topic: 'Monsoon Alert' },
      { topic: 'Digital India' },
      { topic: 'Metro Expansion' },
    ];
  }
  
  const stats = [
    { value: statsValues.states, label: 'States Covered', icon: Map },
    { value: statsValues.categories, label: 'News Categories', icon: Newspaper },
    { value: statsValues.articles, label: 'Live Articles', icon: Radio },
    { value: '4.9', label: 'User Rating', icon: Star },
  ];

  return (
    <main className="min-h-screen bg-slate-950">
      {/* Navigation Bar */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6"
        style={{
          background: 'rgba(2, 6, 23, 0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm">
            <span
              style={{
                background: 'linear-gradient(135deg, #fb923c, #f59e0b)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              India Pulse
            </span>
            <span className="text-slate-400 ml-1 font-medium">AI</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            Live Map
          </Link>
          <Link
            href="/assistant"
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            AI Chat
          </Link>
          <Link
            href="/analytics"
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            Analytics
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-1.5 rounded-lg text-sm font-semibold text-white transition-all"
            style={{
              background: 'linear-gradient(135deg, #fb923c, #f97316)',
              boxShadow: '0 4px 15px rgba(251,146,60,0.3)',
            }}
          >
            Explore Map
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-14">
        {/* Background */}
        <div className="absolute inset-0">
          <div
            style={{
              position: 'absolute',
              top: '-20%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '80vw',
              height: '80vh',
              background:
                'radial-gradient(ellipse, rgba(251,146,60,0.08) 0%, rgba(59,130,246,0.04) 50%, transparent 70%)',
              borderRadius: '50%',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: '0',
              left: '-10%',
              width: '40vw',
              height: '40vw',
              background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)',
              borderRadius: '50%',
            }}
          />

          {/* Animated grid */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundImage:
                'linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Live badge */}
          <div className="inline-flex items-center gap-2 mb-6">
            <div
              className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#f87171',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
              LIVE
            </div>
            <span
              className="px-3 py-1.5 rounded-full text-xs font-medium"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#94a3b8',
              }}
            >
              AI-Powered News Intelligence
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
            <span className="text-white">Every Story.</span>
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #fb923c 0%, #f59e0b 50%, #fbbf24 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Every State.
            </span>
            <br />
            <span className="text-slate-300">In Real Time.</span>
          </h1>

          <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            India&apos;s most intelligent news platform. Explore geo-tagged news on an interactive map,
            get AI summaries for every article, and ask your AI assistant anything about the latest
            news from all 28 states.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="group flex items-center gap-2.5 px-6 py-3 rounded-xl text-base font-semibold text-white transition-all"
              style={{
                background: 'linear-gradient(135deg, #fb923c, #f97316)',
                boxShadow: '0 8px 30px rgba(251,146,60,0.4)',
              }}
            >
              <Map className="w-5 h-5" />
              Explore Live Map
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/assistant"
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-base font-semibold transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#e2e8f0',
              }}
            >
              <Bot className="w-5 h-5" />
              Try AI Assistant
            </Link>
          </div>
        </div>
      </section>

      {/* Dynamic Insights Grid Panel */}
      <section className="py-6 px-6 max-w-5xl mx-auto -mt-10 mb-8 relative z-25">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/02 border border-orange-500/15 backdrop-blur-md">
            <p className="text-[10px] text-orange-400 font-bold uppercase tracking-wider mb-1">🔥 Trending Today</p>
            <p className="text-base font-bold text-white mb-2"># {trendingTopics[0]?.topic || 'Startup Funding'}</p>
            <p className="text-xs text-slate-500">Fastest rising topic in the news cycle right now.</p>
          </div>
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/02 border border-blue-500/15 backdrop-blur-md">
            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-1">📍 Most Discussed State</p>
            <p className="text-base font-bold text-white mb-2">{mostDiscussedState}</p>
            <p className="text-xs text-slate-500">Region recording the highest volume of news updates.</p>
          </div>
          <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-violet-500/02 border border-purple-500/15 backdrop-blur-md">
            <p className="text-[10px] text-purple-400 font-bold uppercase tracking-wider mb-1">⚡ Top Category</p>
            <p className="text-base font-bold text-white mb-2 capitalize">{topCategory}</p>
            <p className="text-xs text-slate-500">Most active thematic area across publications.</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map(({ value, label, icon: Icon }) => (
              <div
                key={label}
                className="text-center p-6 rounded-2xl"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl mx-auto mb-3 flex items-center justify-center"
                  style={{ background: 'rgba(251,146,60,0.15)' }}
                >
                  <Icon className="w-5 h-5 text-orange-400" />
                </div>
                <p
                  className="text-3xl font-bold mb-1"
                  style={{
                    background: 'linear-gradient(135deg, #fb923c, #f59e0b)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {value}
                </p>
                <p className="text-xs text-slate-500 font-medium">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Breaking News Preview */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Trending Today hashtags strip */}
          <div className="flex flex-wrap items-center gap-2 mb-8 bg-slate-900/50 border border-white/05 rounded-2xl p-4">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-wider mr-2">🔥 Trending:</span>
            {trendingTopics.slice(0, 7).map((topic: any) => (
              <Link
                key={topic.topic}
                href={`/dashboard?search=${encodeURIComponent(topic.topic)}`}
                className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white/05 border border-white/08 hover:border-orange-500/50 hover:bg-orange-500/10 text-slate-300 hover:text-white transition-all duration-200"
              >
                #{topic.topic.replace(/\s+/g, '')}
              </Link>
            ))}
          </div>

          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="px-2 py-0.5 rounded text-xs font-bold text-white"
                  style={{ background: 'rgba(239, 68, 68, 0.9)' }}
                >
                  ⚡ BREAKING
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white">Top Stories Right Now</h2>
            </div>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-sm font-medium transition-colors"
              style={{ color: '#fb923c' }}
            >
              View all on map <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {breakingArticles.map((article, i) => (
              <Link
                key={article.id}
                href={`/news/${article.id}`}
                className="group p-4 rounded-2xl transition-all"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-semibold mb-3"
                  style={{
                    background: `${CATEGORY_COLORS[article.category as NewsCategory]}20`,
                    color: CATEGORY_COLORS[article.category as NewsCategory],
                  }}
                >
                  <span>{CATEGORY_ICONS[article.category as NewsCategory]}</span>
                  {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                </div>
                <h3 className="text-sm font-semibold text-slate-100 leading-snug mb-2 group-hover:text-orange-400 transition-colors">
                  {article.title}
                </h3>
                <p className="text-xs text-slate-500">{article.source.name} · {formatRelativeTime(article.publishedAt)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Built for India&apos;s Information Age
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              From journalists to researchers, students to policymakers — India Pulse AI gives you
              the intelligence layer that news alone never could.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, description, color, gradient }) => (
              <div
                key={title}
                className="p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${color}20` }}
                >
                  <Icon className="w-6 h-6" style={{ color }} />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest / Personalized Articles Preview */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <PersonalizedGrid fallbackArticles={latestArticles} />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div
            className="p-12 rounded-3xl relative overflow-hidden"
            style={{
              background:
                'linear-gradient(135deg, rgba(251,146,60,0.1), rgba(59,130,246,0.1))',
              border: '1px solid rgba(251,146,60,0.2)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-50%',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '300px',
                height: '300px',
                background: 'radial-gradient(circle, rgba(251,146,60,0.15), transparent)',
                borderRadius: '50%',
                pointerEvents: 'none',
              }}
            />
            <Zap className="w-12 h-12 text-orange-400 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Explore India&apos;s News Intelligence
            </h2>
            <p className="text-slate-400 mb-8">
              No account needed. Start exploring the interactive map, discover trending stories,
              and ask your AI assistant anything.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-xl text-base font-bold text-white transition-all"
              style={{
                background: 'linear-gradient(135deg, #fb923c, #f97316)',
                boxShadow: '0 8px 30px rgba(251,146,60,0.5)',
              }}
            >
              <Map className="w-5 h-5" />
              Launch the Map
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/05 py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-sm text-slate-300">India Pulse AI</span>
        </div>
        <p className="text-xs text-slate-600">
          Real-time news intelligence for India. Built with Next.js, AI-powered insights.
        </p>
      </footer>
    </main>
  );
}
