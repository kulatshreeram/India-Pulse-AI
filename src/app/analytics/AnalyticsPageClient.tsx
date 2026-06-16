'use client';

import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Newspaper, Map, Brain, ArrowUp, ArrowDown, Minus } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Providers } from '@/components/Providers';
import { useAnalytics } from '@/hooks/useAnalytics';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { CATEGORY_COLORS } from '@/lib/mock-data';

// ── Helpers ───────────────────────────────────────────────────────────────────
const SENTIMENT_COLORS = {
  positive: '#10b981',
  negative: '#ef4444',
  neutral: '#64748b',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{
        background: 'rgba(9,14,28,0.98)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 10,
        padding: '10px 14px',
      }}
    >
      <p className="text-xs font-semibold text-slate-300 mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-xs" style={{ color: p.color }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color = '#fb923c',
  index = 0,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  index?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="p-5 rounded-2xl"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: `${color}20` }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
          <ArrowUp className="w-3 h-3" /> Live
        </span>
      </div>
      <p className="text-3xl font-bold mb-1" style={{ color }}>{value}</p>
      <p className="text-xs text-slate-500 font-medium">{label}</p>
      {sub && <p className="text-xs text-slate-700 mt-1">{sub}</p>}
    </motion.div>
  );
}

// ── Trend Icon ────────────────────────────────────────────────────────────────
function TrendIcon({ trend }: { trend: 'rising' | 'falling' | 'stable' }) {
  if (trend === 'rising')  return <ArrowUp   className="w-3 h-3 text-emerald-400 flex-shrink-0" />;
  if (trend === 'falling') return <ArrowDown  className="w-3 h-3 text-red-400 flex-shrink-0" />;
  return <Minus className="w-3 h-3 text-slate-500 flex-shrink-0" />;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function AnalyticsDashboard() {
  const { data, isLoading } = useAnalytics();

  if (isLoading || !data) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    );
  }

  const sentimentPieData = [
    { name: 'Positive', value: data.sentimentData.positive, color: SENTIMENT_COLORS.positive },
    { name: 'Negative', value: data.sentimentData.negative, color: SENTIMENT_COLORS.negative },
    { name: 'Neutral',  value: data.sentimentData.neutral,  color: SENTIMENT_COLORS.neutral  },
  ];

  const topStates = [...data.stateActivity]
    .sort((a, b) => b.articleCount - a.articleCount)
    .slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Newspaper}   label="Total Articles"   value={data.totalArticles}    sub="Across all states"   color="#fb923c" index={0} />
        <StatCard icon={Map}         label="States Covered"   value={data.totalStates}      sub="With active news"    color="#3b82f6" index={1} />
        <StatCard icon={Brain}       label="AI Summaries"     value={data.totalAISummaries} sub="Generated today"     color="#10b981" index={2} />
        <StatCard icon={TrendingUp}  label="Categories"       value={data.totalCategories}  sub="Types tracked"       color="#a855f7" index={3} />
      </div>

      {/* Timeline + Sentiment Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-5 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <h3 className="text-sm font-bold text-white mb-4">News Volume — Last 7 Days</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.timelineData}>
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#fb923c" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#fb923c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="count" name="Articles" stroke="#fb923c" strokeWidth={2} fill="url(#areaGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Sentiment Donut */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-5 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <h3 className="text-sm font-bold text-white mb-4">Sentiment Distribution</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="55%" height={200}>
              <PieChart>
                <Pie
                  data={sentimentPieData}
                  cx="50%" cy="50%"
                  innerRadius={55} outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {sentimentPieData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-4">
              {sentimentPieData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <div>
                    <p className="text-xs font-medium text-slate-400">{item.name}</p>
                    <p className="text-2xl font-bold" style={{ color: item.color }}>{item.value}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* State Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-5 rounded-2xl"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <h3 className="text-sm font-bold text-white mb-4">Most Active States</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={topStates} layout="vertical" barCategoryGap="30%">
            <XAxis type="number" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis
              type="category" dataKey="state"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              axisLine={false} tickLine={false} width={110}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="articleCount" name="Articles" radius={[0, 6, 6, 0]}>
              {topStates.map((_, i) => (
                <Cell key={i} fill={`hsl(${28 + i * 14}, 78%, 58%)`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Trending Topics + Category Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trending Topics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-5 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <h3 className="text-sm font-bold text-white mb-4">Trending Topics</h3>
          <div className="space-y-2.5">
            {data.trendingTopics.slice(0, 10).map((topic, i) => (
              <div key={topic.id} className="flex items-center gap-3">
                <span className="text-xs text-slate-600 font-mono w-4 text-right flex-shrink-0">{i + 1}</span>
                <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <TrendIcon trend={topic.trend} />
                    <span className="text-xs font-medium text-slate-300 truncate">{topic.topic}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${Math.max(20, (topic.count / (data.trendingTopics[0]?.count || 1)) * 60)}px`,
                        background: `${CATEGORY_COLORS[topic.category]}60`,
                      }}
                    />
                    <span className="text-xs text-slate-600">{topic.count}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Category Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="p-5 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <h3 className="text-sm font-bold text-white mb-4">Category Breakdown</h3>
          <div className="space-y-3">
            {[...data.categoryBreakdown]
              .sort((a, b) => b.count - a.count)
              .map((item) => (
                <div key={item.category} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400 capitalize">{item.category}</span>
                    <span className="text-xs text-slate-600">{item.count} · {item.percentage}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${item.percentage}%` }}
                      transition={{ delay: 0.8, duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{ background: CATEGORY_COLORS[item.category] || '#64748b' }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────
export function AnalyticsPageClient() {
  return (
    <Providers>
      <div className="min-h-screen bg-slate-950">
        <Navbar />
        <div className="pt-14 max-w-6xl mx-auto px-6 py-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-white mb-1">News Analytics</h1>
            <p className="text-slate-500 text-sm">
              Real-time intelligence about what&apos;s happening across India
            </p>
          </div>
          <AnalyticsDashboard />
        </div>
      </div>
    </Providers>
  );
}
