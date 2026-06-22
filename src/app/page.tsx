import Link from 'next/link';
import { Metadata } from 'next';
import {
  Map, Bot, BarChart3, Zap, Globe,
  ArrowRight, TrendingUp, Shield, Sparkles,
  Newspaper, Radio, Star, Search, GitCompare,
  Bell, ChevronRight, Activity
} from 'lucide-react';
import { MOCK_ARTICLES, CATEGORY_COLORS, CATEGORY_ICONS } from '@/lib/mock-data';
import { formatRelativeTime } from '@/lib/utils';
import { PersonalizedGrid } from '@/components/news/PersonalizedGrid';
import type { NewsCategory } from '@/types';

export const metadata: Metadata = {
  title: 'India Pulse AI — Real-Time Interactive News Intelligence Platform',
  description:
    'Explore Indian news geographically on a live interactive map. AI summaries, sentiment analysis, trending topics, and an intelligent news assistant — all in one platform.',
};

export const dynamic = 'force-dynamic';

async function getHomepageData() {
  try {
    const [newsRes, analyticsRes] = await Promise.all([
      fetch('http://127.0.0.1:8000/api/news?limit=20', { next: { revalidate: 15 } }),
      fetch('http://127.0.0.1:8000/api/analytics', { next: { revalidate: 15 } }),
    ]);
    if (!newsRes.ok || !analyticsRes.ok) return null;
    return { newsData: await newsRes.json(), analyticsData: await analyticsRes.json() };
  } catch {
    return null;
  }
}

const FEATURES = [
  { icon: Map,       title: 'Interactive India Map',    desc: 'Geo-tagged news across all 28 states on a live animated map. Zoom, click, discover.',       color: '#fb923c', href: '/dashboard' },
  { icon: Sparkles,  title: 'AI News Intelligence',     desc: 'GPT-4o summaries, impact scores, and sentiment for every article. Zero hallucinations.',      color: '#3b82f6', href: '/dashboard' },
  { icon: Bot,       title: 'AI News Assistant',        desc: '"What happened in Maharashtra today?" Ask anything. Get sourced answers instantly.',          color: '#10b981', href: '/assistant' },
  { icon: BarChart3, title: 'Live Analytics Dashboard', desc: 'Trending topics, sentiment trends, category breakdowns and state activity in real time.',      color: '#a855f7', href: '/analytics' },
  { icon: Search,    title: 'Advanced Search',          desc: 'Filter by state, category, sentiment, date and source. Highlighted results with history.',     color: '#06b6d4', href: '/search'    },
  { icon: GitCompare,title: 'State Comparison',         desc: 'Compare news volume, sentiment and trends across any 3 Indian states side-by-side.',           color: '#f59e0b', href: '/compare'   },
  { icon: Bell,      title: 'Breaking News Alerts',     desc: 'Real-time in-app notifications and browser push alerts whenever breaking news hits.',          color: '#ef4444', href: '/dashboard' },
  { icon: Globe,     title: 'Multilingual',             desc: 'AI summaries in English, Hindi and Marathi. Built for all of India.',                         color: '#14b8a6', href: '/dashboard' },
  { icon: Shield,    title: 'Verified Sources',         desc: 'NDTV, Times of India, The Hindu, Economic Times, Hindustan Times and 20+ publications.',      color: '#84cc16', href: '/dashboard' },
];

const TRUSTED = ['NDTV', 'Times of India', 'The Hindu', 'Economic Times', 'Hindustan Times', 'India Today', 'Mint', 'Deccan Herald', 'Tribune', 'The Wire'];

export default async function LandingPage() {
  const data = await getHomepageData();

  let breakingArticles: any[] = [];
  let latestArticles:   any[] = [];
  let trendingTopics:   any[] = [];
  let mostDiscussedState = 'Maharashtra';
  let topCategory        = 'politics';
  let statsValues        = { states: '28+', categories: '12', articles: '60+' };

  if (data) {
    const all = data.newsData.articles || [];
    breakingArticles = (all.filter((a: any) => a.isBreaking).length ? all.filter((a: any) => a.isBreaking) : all).slice(0, 4);
    latestArticles   = all.slice(0, 6);
    trendingTopics   = data.analyticsData.trendingTopics || [];
    const sortedSt   = [...(data.analyticsData.stateActivity || [])].sort((a: any, b: any) => b.articleCount - a.articleCount);
    mostDiscussedState = sortedSt[0]?.state || 'Maharashtra';
    const sortedCat  = [...(data.analyticsData.categoryBreakdown || [])].sort((a: any, b: any) => b.count - a.count);
    topCategory      = sortedCat[0]?.category || 'politics';
    statsValues      = { states: String(data.analyticsData.totalStates || '28+'), categories: String(data.analyticsData.totalCategories || '12'), articles: String(data.analyticsData.totalArticles || '60+') };
  } else {
    const fb       = MOCK_ARTICLES.map(a => ({ id: a.id, title: a.title, description: a.description, summary: a.summary, publishedAt: a.publishedAt, category: a.category, isBreaking: a.isBreaking, state: a.state, source: { name: a.source.name, url: a.source.url } }));
    breakingArticles = fb.filter(a => a.isBreaking).slice(0, 4);
    latestArticles   = fb.slice(0, 6);
    trendingTopics   = [{ topic: 'Electric Vehicles' },{ topic: 'Startup Funding' },{ topic: 'Monsoon Alert' },{ topic: 'Digital India' },{ topic: 'Metro Expansion' }];
  }

  const STATS = [
    { value: statsValues.states,     label: 'States Covered',   icon: Map,       color: '#fb923c' },
    { value: statsValues.categories, label: 'News Categories',  icon: Newspaper, color: '#3b82f6' },
    { value: statsValues.articles,   label: 'Live Articles',    icon: Activity,  color: '#10b981' },
    { value: '4.9★',                 label: 'User Rating',      icon: Star,      color: '#f59e0b' },
  ];

  return (
    <main className="min-h-screen bg-slate-950 overflow-x-hidden">

      {/* ── NAVBAR ──────────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 h-14 flex items-center justify-between px-6"
        style={{ background: 'rgba(2,6,23,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
      >
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-[0_0_12px_rgba(251,146,60,0.5)]">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm">
            <span style={{ background: 'linear-gradient(135deg,#fb923c,#f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>India Pulse</span>
            <span className="text-slate-400 ml-1 font-medium">AI</span>
          </span>
        </div>
        <div className="hidden md:flex items-center gap-1">
          {[['Live Map','/dashboard'],['AI Chat','/assistant'],['Analytics','/analytics'],['Search','/search'],['Compare','/compare']].map(([label,href]) => (
            <Link key={href} href={href} className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all">{label}</Link>
          ))}
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-bold text-white transition-all"
          style={{ background: 'linear-gradient(135deg,#fb923c,#f97316)', boxShadow: '0 4px 15px rgba(251,146,60,0.4)' }}
        >
          Explore Map <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </nav>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-14">

        {/* Background layers */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Deep radial glow */}
          <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(251,146,60,0.07) 0%, rgba(59,130,246,0.04) 45%, transparent 70%)' }} />
          {/* Bottom-left green accent */}
          <div style={{ position:'absolute', bottom:'-5%', left:'-5%', width:'40vw', height:'40vw', background:'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 65%)', borderRadius:'50%' }} />
          {/* Top-right blue accent */}
          <div style={{ position:'absolute', top:'5%', right:'-5%', width:'30vw', height:'30vw', background:'radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 65%)', borderRadius:'50%' }} />
          {/* Grid overlay */}
          <div style={{ position:'absolute', inset:0, backgroundImage:'linear-gradient(rgba(255,255,255,0.012) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.012) 1px,transparent 1px)', backgroundSize:'64px 64px' }} />
        </div>

        {/* India outline SVG watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035]">
          <svg viewBox="0 0 400 500" className="w-[600px] h-[600px]" fill="none">
            <path d="M200 40 L240 60 L280 55 L310 80 L330 110 L340 145 L325 175 L335 210 L320 240 L300 265 L310 295 L295 320 L275 345 L260 375 L245 400 L230 425 L215 450 L200 470 L185 450 L170 425 L155 400 L140 375 L125 345 L105 320 L90 295 L100 265 L80 240 L65 210 L75 175 L60 145 L70 110 L90 80 L120 55 L160 60 Z"
              fill="url(#indiaGlow)" stroke="rgba(251,146,60,0.6)" strokeWidth="1.5" />
            <defs>
              <radialGradient id="indiaGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fb923c" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.1" />
              </radialGradient>
            </defs>
          </svg>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          {/* Live badge row */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold" style={{ background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.25)', color:'#f87171' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" /> LIVE
            </div>
            <span className="px-3 py-1.5 rounded-full text-xs font-medium text-slate-400" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)' }}>
              AI-Powered · 28 States · Real-Time
            </span>
          </div>

          {/* Main headline */}
          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-6 leading-[1.05]">
            <span className="text-white">Every Story.</span>
            <br />
            <span style={{ background:'linear-gradient(135deg,#fb923c 0%,#f59e0b 40%,#fbbf24 80%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
              Every State.
            </span>
            <br />
            <span className="text-slate-400 text-5xl md:text-6xl font-bold">In Real Time.</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            India&apos;s most intelligent news platform. Geo-tagged stories on an interactive map,
            AI summaries for every article, and an assistant that knows every headline.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/dashboard"
              className="group flex items-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold text-white transition-all duration-300 hover:scale-105"
              style={{ background:'linear-gradient(135deg,#fb923c,#f97316)', boxShadow:'0 8px 40px rgba(251,146,60,0.45)' }}
            >
              <Map className="w-5 h-5" />
              Explore Live Map
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/assistant"
              className="group flex items-center gap-2.5 px-8 py-4 rounded-2xl text-base font-semibold text-slate-200 transition-all duration-300 hover:scale-105 hover:bg-white/10"
              style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)' }}
            >
              <Bot className="w-5 h-5 text-emerald-400" />
              Try AI Assistant
            </Link>
          </div>

          {/* Mini stat pills */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {STATS.map(({ value, label, color }) => (
              <div key={label} className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold" style={{ background:`${color}12`, border:`1px solid ${color}25` }}>
                <span style={{ color }}>{value}</span>
                <span className="text-slate-500">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-40">
          <span className="text-[10px] text-slate-600 uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-slate-600 to-transparent" />
        </div>
      </section>

      {/* ── LIVE INSIGHTS STRIP ───────────────────────────────────────────────── */}
      <section className="py-4 px-6 relative z-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label:'🔥 Trending Right Now', value: trendingTopics[0]?.topic || 'Startup Funding',    sub:'Fastest rising topic in the news cycle',        color:'#fb923c', bg:'rgba(251,146,60,0.08)',  border:'rgba(251,146,60,0.2)'  },
            { label:'📍 Most Active State',   value: mostDiscussedState,                              sub:'Highest news volume across all publications',    color:'#3b82f6', bg:'rgba(59,130,246,0.08)',  border:'rgba(59,130,246,0.2)'  },
            { label:'⚡ Top Category',        value: topCategory,                                     sub:'Most active thematic area right now',            color:'#a855f7', bg:'rgba(168,85,247,0.08)', border:'rgba(168,85,247,0.2)'  },
          ].map(({ label, value, sub, color, bg, border }) => (
            <div key={label} className="p-5 rounded-2xl backdrop-blur-sm" style={{ background:bg, border:`1px solid ${border}` }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color }}>{label}</p>
              <p className="text-lg font-black text-white mb-1 capitalize">{value}</p>
              <p className="text-xs text-slate-500">{sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── TRUSTED SOURCES TICKER ───────────────────────────────────────────── */}
      <section className="py-8 overflow-hidden relative">
        <div className="flex items-center gap-2 mb-4 px-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest px-3">Trusted Sources</span>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>
        <div className="flex gap-10 animate-ticker whitespace-nowrap">
          {[...TRUSTED, ...TRUSTED, ...TRUSTED, ...TRUSTED].map((name, i) => (
            <span key={i} className="text-sm font-semibold text-slate-600 hover:text-slate-400 transition-colors flex-shrink-0">
              {name}
            </span>
          ))}
        </div>
      </section>

      {/* ── BREAKING NEWS ─────────────────────────────────────────────────────── */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">

          {/* Trending hashtags */}
          {trendingTopics.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-10 p-4 rounded-2xl" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)' }}>
              <span className="text-xs font-bold text-orange-400 uppercase tracking-wider mr-1">🔥 Trending:</span>
              {trendingTopics.slice(0, 8).map((t: any) => (
                <Link key={t.topic} href={`/search?q=${encodeURIComponent(t.topic)}`}
                  className="px-3 py-1 rounded-full text-xs font-semibold text-slate-400 hover:text-white hover:bg-orange-500/10 transition-all"
                  style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)' }}>
                  #{t.topic.replace(/\s+/g,'')}
                </Link>
              ))}
            </div>
          )}

          <div className="flex items-end justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-xs font-bold text-red-400 uppercase tracking-widest">Live</span>
              </div>
              <h2 className="text-3xl font-black text-white">Top Stories Right Now</h2>
            </div>
            <Link href="/dashboard" className="flex items-center gap-1 text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors">
              View all on map <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {breakingArticles.map((article, i) => {
              const catColor = CATEGORY_COLORS[article.category as NewsCategory] || '#64748b';
              return (
                <Link
                  key={article.id}
                  href={`/news/${article.id}`}
                  className="group relative p-5 rounded-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}
                >
                  {/* Hover glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl" style={{ background:`radial-gradient(ellipse at 50% 0%, ${catColor}08 0%, transparent 70%)` }} />
                  {/* Top accent line */}
                  <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background:`linear-gradient(90deg, transparent, ${catColor}, transparent)` }} />

                  <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-bold px-2 py-0.5 rounded-lg capitalize" style={{ background:`${catColor}18`, color:catColor, border:`1px solid ${catColor}25` }}>
                        {CATEGORY_ICONS[article.category as NewsCategory]} {article.category}
                      </span>
                      {article.isBreaking && (
                        <span className="text-[10px] font-bold text-red-400 bg-red-400/10 px-1.5 py-0.5 rounded">BREAKING</span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-slate-100 leading-snug mb-3 group-hover:text-white transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">{article.source.name} · {formatRelativeTime(article.publishedAt)}</span>
                      <ChevronRight className="w-4 h-4 text-slate-700 group-hover:text-orange-400 transition-colors" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── STATS BAR ─────────────────────────────────────────────────────────── */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map(({ value, label, icon: Icon, color }) => (
            <div
              key={label}
              className="group text-center p-6 rounded-2xl transition-all duration-300 hover:-translate-y-1"
              style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${color}18` }}
            >
              <div className="w-11 h-11 rounded-xl mx-auto mb-3 flex items-center justify-center transition-transform group-hover:scale-110" style={{ background:`${color}15` }}>
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <p className="text-3xl font-black mb-1" style={{ background:`linear-gradient(135deg,${color},${color}99)`, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>{value}</p>
              <p className="text-xs text-slate-500 font-medium">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES GRID ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 relative overflow-hidden">
        {/* Section background glow */}
        <div className="absolute inset-0 pointer-events-none" style={{ background:'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(59,130,246,0.04) 0%, transparent 70%)' }} />

        <div className="max-w-6xl mx-auto relative">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-3">Platform Features</p>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
              Built for India&apos;s<br />
              <span style={{ background:'linear-gradient(135deg,#3b82f6,#a855f7)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                Information Age
              </span>
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto text-base">
              From journalists to researchers, students to policymakers — the intelligence layer news alone never had.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon: Icon, title, desc, color, href }, idx) => (
              <Link
                key={title}
                href={href}
                className="group relative p-6 rounded-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden block"
                style={{ background:'rgba(255,255,255,0.025)', border:`1px solid rgba(255,255,255,0.06)` }}
              >
                {/* Hover background glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" style={{ background:`radial-gradient(ellipse at 30% 30%, ${color}10 0%, transparent 70%)` }} />
                {/* Top accent */}
                <div className="absolute top-0 left-6 right-6 h-px opacity-0 group-hover:opacity-100 transition-opacity" style={{ background:`linear-gradient(90deg, transparent, ${color}60, transparent)` }} />

                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110" style={{ background:`${color}15`, border:`1px solid ${color}20` }}>
                    <Icon className="w-6 h-6" style={{ color }} />
                  </div>
                  <h3 className="text-base font-bold text-white mb-2 group-hover:text-white transition-colors">{title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed group-hover:text-slate-400 transition-colors">{desc}</p>
                  <div className="flex items-center gap-1 mt-4 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300" style={{ color }}>
                    Explore <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── PERSONALIZED ARTICLES ─────────────────────────────────────────────── */}
      <section className="py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <PersonalizedGrid fallbackArticles={latestArticles} />
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div
            className="relative p-14 rounded-3xl text-center overflow-hidden"
            style={{ background:'linear-gradient(135deg,rgba(251,146,60,0.08),rgba(59,130,246,0.08),rgba(168,85,247,0.08))', border:'1px solid rgba(251,146,60,0.15)' }}
          >
            {/* Glow orbs */}
            <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full pointer-events-none" style={{ background:'radial-gradient(circle,rgba(251,146,60,0.15),transparent)' }} />
            <div className="absolute -bottom-10 left-10 w-40 h-40 rounded-full pointer-events-none" style={{ background:'radial-gradient(circle,rgba(59,130,246,0.1),transparent)' }} />
            <div className="absolute -bottom-10 right-10 w-40 h-40 rounded-full pointer-events-none" style={{ background:'radial-gradient(circle,rgba(168,85,247,0.1),transparent)' }} />

            <div className="relative">
              {/* Icon cluster */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background:'linear-gradient(135deg,#fb923c,#f97316)', boxShadow:'0 8px 30px rgba(251,146,60,0.5)' }}>
                  <Zap className="w-7 h-7 text-white" />
                </div>
              </div>

              <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
                Start Exploring<br />
                <span style={{ background:'linear-gradient(135deg,#fb923c,#f59e0b)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
                  India&apos;s Stories
                </span>
              </h2>
              <p className="text-slate-400 mb-10 text-base max-w-lg mx-auto">
                No account needed. Dive into the interactive map, discover trending stories,
                and get AI-powered summaries for every headline across every state.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/dashboard"
                  className="group flex items-center gap-2.5 px-8 py-4 rounded-2xl text-base font-bold text-white transition-all duration-300 hover:scale-105"
                  style={{ background:'linear-gradient(135deg,#fb923c,#f97316)', boxShadow:'0 8px 40px rgba(251,146,60,0.5)' }}
                >
                  <Map className="w-5 h-5" />
                  Launch the Map
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/signup"
                  className="flex items-center gap-2 px-8 py-4 rounded-2xl text-base font-semibold text-slate-300 hover:text-white transition-all duration-300 hover:scale-105"
                  style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)' }}
                >
                  Create Free Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.05] py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-sm">
                <span style={{ background:'linear-gradient(135deg,#fb923c,#f59e0b)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>India Pulse</span>
                <span className="text-slate-500 ml-1">AI</span>
              </span>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6">
              {[['Live Map','/dashboard'],['AI Chat','/assistant'],['Analytics','/analytics'],['Search','/search'],['Compare','/compare']].map(([label,href]) => (
                <Link key={href} href={href} className="text-xs text-slate-600 hover:text-slate-400 transition-colors">{label}</Link>
              ))}
            </div>

            <p className="text-xs text-slate-700">
              © 2026 India Pulse AI · Real-time news intelligence
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
}
