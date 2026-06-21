'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend, AreaChart, Area,
} from 'recharts';
import {
  Plus, X, TrendingUp, Newspaper, Zap, BarChart2,
  MapPin, Award, ArrowUp, ArrowDown, Minus, Globe
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Providers } from '@/components/Providers';
import { useStateMetrics, type StateMetrics } from '@/hooks/useStateComparison';
import type { IndianState, NewsCategory } from '@/types';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

// ── Constants ─────────────────────────────────────────────────────────────────
const ALL_STATES: IndianState[] = [
  'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh',
  'West Bengal', 'Gujarat', 'Rajasthan', 'Telangana', 'Kerala',
  'Madhya Pradesh', 'Bihar', 'Punjab', 'Haryana', 'Odisha',
  'Jharkhand', 'Assam', 'Chhattisgarh', 'Uttarakhand', 'Himachal Pradesh',
  'Goa', 'Tripura', 'Andhra Pradesh', 'Jammu and Kashmir', 'Manipur',
];

const STATE_COLORS = ['#fb923c', '#3b82f6', '#10b981'];

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

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'rgba(9,14,28,0.98)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 14px' }}>
      <p className="text-xs font-semibold text-slate-300 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} className="text-xs" style={{ color: p.color || p.fill }}>
          {p.name}: <strong>{p.value}</strong>
        </p>
      ))}
    </div>
  );
};

// ── State Selector Card ───────────────────────────────────────────────────────
function StateSelector({
  index, value, onChange, color, used,
}: {
  index: number; value: IndianState | null; onChange: (s: IndianState | null) => void;
  color: string; used: Set<IndianState>;
}) {
  return (
    <div
      className="p-4 rounded-2xl flex flex-col gap-3"
      style={{ ...GLASS, borderColor: value ? `${color}30` : 'rgba(255,255,255,0.07)' }}
    >
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
        <span className="text-xs font-bold text-slate-400">State {index + 1}</span>
        {value && (
          <button onClick={() => onChange(null)} className="ml-auto text-slate-600 hover:text-red-400">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value as IndianState || null)}
        className="text-sm px-3 py-2 rounded-xl outline-none w-full"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: value ? '#e2e8f0' : '#64748b' }}
      >
        <option value="">Choose a state...</option>
        {ALL_STATES.map((s) => (
          <option key={s} value={s} disabled={used.has(s) && s !== value}>
            {s}
          </option>
        ))}
      </select>
    </div>
  );
}

// ── Single state metrics card ─────────────────────────────────────────────────
function StateCard({ metrics, color }: { metrics: StateMetrics; color: string }) {
  const sent = metrics.sentimentScore;
  const sentIcon = sent > 0.1 ? <ArrowUp className="w-3 h-3" /> : sent < -0.1 ? <ArrowDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />;
  const sentColor = sent > 0.1 ? '#10b981' : sent < -0.1 ? '#ef4444' : '#64748b';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-2xl space-y-4"
      style={{ ...GLASS, borderColor: `${color}25` }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
        <h3 className="text-sm font-bold text-white">{metrics.state}</h3>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Articles', value: metrics.articleCount, icon: Newspaper, color: color },
          { label: 'Breaking', value: metrics.breakingCount, icon: Zap, color: '#ef4444' },
          { label: 'Impact', value: `${metrics.avgImpact}%`, icon: TrendingUp, color: '#8b5cf6' },
          { label: 'Sentiment', value: sent.toFixed(2), icon: BarChart2, color: sentColor },
        ].map(({ label, value, icon: Icon, color: c }) => (
          <div key={label} className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <Icon className="w-3.5 h-3.5 mb-1" style={{ color: c }} />
            <p className="text-lg font-bold" style={{ color: c }}>{value}</p>
            <p className="text-[10px] text-slate-600">{label}</p>
          </div>
        ))}
      </div>

      {/* Sentiment bar */}
      <div>
        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Sentiment Mix</p>
        <div className="flex h-2 rounded-full overflow-hidden gap-0.5">
          <div className="rounded-full" style={{ width: `${metrics.sentimentBreakdown.positive}%`, background: '#10b981' }} />
          <div className="rounded-full" style={{ width: `${metrics.sentimentBreakdown.neutral}%`, background: '#64748b' }} />
          <div className="rounded-full" style={{ width: `${metrics.sentimentBreakdown.negative}%`, background: '#ef4444' }} />
        </div>
        <div className="flex gap-3 mt-1">
          {[
            { label: `${metrics.sentimentBreakdown.positive}% Positive`, c: '#10b981' },
            { label: `${metrics.sentimentBreakdown.neutral}% Neutral`, c: '#64748b' },
            { label: `${metrics.sentimentBreakdown.negative}% Negative`, c: '#ef4444' },
          ].map(({ label, c }) => (
            <span key={label} className="text-[9px]" style={{ color: c }}>{label}</span>
          ))}
        </div>
      </div>

      {/* Top category */}
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-slate-600">Top Category:</span>
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
          style={{ background: `${CAT_COLORS[metrics.topCategory] || '#64748b'}20`, color: CAT_COLORS[metrics.topCategory] || '#64748b' }}
        >
          {metrics.topCategory}
        </span>
      </div>

      {/* Top sources */}
      {metrics.topSources.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">Top Sources</p>
          <div className="space-y-1">
            {metrics.topSources.slice(0, 3).map(({ name, count }) => (
              <div key={name} className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400">{name}</span>
                <span className="text-[10px] text-slate-600">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ── Comparison Charts ─────────────────────────────────────────────────────────
function ComparisonCharts({ states }: { states: Array<StateMetrics | null | undefined> }) {
  const loaded = states.filter(Boolean) as StateMetrics[];
  if (loaded.length < 2) return null;

  // Volume comparison bar chart
  const volumeData = loaded.map((s, i) => ({
    state: s.state.split(' ')[0],
    Articles: s.articleCount,
    Breaking: s.breakingCount,
    fill: STATE_COLORS[i],
  }));

  // Radar chart data
  const radarData = [
    { subject: 'Volume', ...Object.fromEntries(loaded.map((s, i) => [s.state.split(' ')[0], s.articleCount])) },
    { subject: 'Sentiment', ...Object.fromEntries(loaded.map((s) => [s.state.split(' ')[0], Math.round((s.sentimentScore + 1) * 50)])) },
    { subject: 'Impact', ...Object.fromEntries(loaded.map((s) => [s.state.split(' ')[0], s.avgImpact])) },
    { subject: 'Breaking', ...Object.fromEntries(loaded.map((s) => [s.state.split(' ')[0], s.breakingCount * 10])) },
    { subject: 'Positive%', ...Object.fromEntries(loaded.map((s) => [s.state.split(' ')[0], s.sentimentBreakdown.positive])) },
  ];

  // Timeline comparison
  const timelineMap: Record<string, Record<string, number>> = {};
  loaded.forEach((s) => {
    s.timelineData.forEach(({ date, count }) => {
      if (!timelineMap[date]) timelineMap[date] = {};
      timelineMap[date][s.state.split(' ')[0]] = count;
    });
  });
  const timelineData = Object.entries(timelineMap)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, vals]) => ({ date, ...vals }));

  return (
    <div className="space-y-6 mt-6">
      {/* Volume vs Breaking bar */}
      <div className="p-5 rounded-2xl" style={GLASS}>
        <h3 className="text-sm font-bold text-white mb-4">News Volume Comparison</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={volumeData} barCategoryGap="30%">
            <XAxis dataKey="state" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="Articles" name="Articles" radius={[6, 6, 0, 0]}>
              {loaded.map((_, i) => (
                <Cell key={i} fill={STATE_COLORS[i]} />
              ))}
            </Bar>
            <Bar dataKey="Breaking" name="Breaking" fill="#ef4444" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Radar + Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl" style={GLASS}>
          <h3 className="text-sm font-bold text-white mb-4">Multi-Metric Radar</h3>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.06)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 10 }} />
              {loaded.map((s, i) => (
                <Radar
                  key={s.state}
                  name={s.state.split(' ')[0]}
                  dataKey={s.state.split(' ')[0]}
                  stroke={STATE_COLORS[i]}
                  fill={STATE_COLORS[i]}
                  fillOpacity={0.12}
                  strokeWidth={2}
                />
              ))}
              <Legend
                formatter={(value) => <span className="text-xs text-slate-400">{value}</span>}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="p-5 rounded-2xl" style={GLASS}>
          <h3 className="text-sm font-bold text-white mb-4">7-Day News Timeline</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={timelineData}>
              <defs>
                {loaded.map((s, i) => (
                  <linearGradient key={s.state} id={`grad${i}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={STATE_COLORS[i]} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={STATE_COLORS[i]} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              {loaded.map((s, i) => (
                <Area
                  key={s.state}
                  type="monotone"
                  dataKey={s.state.split(' ')[0]}
                  stroke={STATE_COLORS[i]}
                  fill={`url(#grad${i})`}
                  strokeWidth={2}
                  name={s.state.split(' ')[0]}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Regional Rankings table */}
      <div className="p-5 rounded-2xl" style={GLASS}>
        <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
          <Award className="w-4 h-4 text-saffron-400" /> Regional Rankings
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-white/5">
                {['Rank', 'State', 'Articles', 'Breaking', 'Sentiment', 'Top Category', 'Avg Impact'].map((h) => (
                  <th key={h} className="text-left py-2 px-3 text-[10px] font-bold text-slate-600 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[...loaded]
                .sort((a, b) => b.articleCount - a.articleCount)
                .map((s, rank) => {
                  const colorIdx = loaded.findIndex((l) => l.state === s.state);
                  const stColor = STATE_COLORS[colorIdx] ?? '#64748b';
                  const sentColor = s.sentimentScore > 0.1 ? '#10b981' : s.sentimentScore < -0.1 ? '#ef4444' : '#64748b';
                  return (
                    <tr key={s.state} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: `${stColor}20`, color: stColor }}>
                          {rank + 1}
                        </div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: stColor }} />
                          <span className="text-slate-200 font-medium">{s.state}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-bold" style={{ color: stColor }}>{s.articleCount}</td>
                      <td className="py-2.5 px-3 text-red-400 font-medium">{s.breakingCount}</td>
                      <td className="py-2.5 px-3 font-bold" style={{ color: sentColor }}>{s.sentimentScore.toFixed(2)}</td>
                      <td className="py-2.5 px-3">
                        <span className="capitalize px-2 py-0.5 rounded-full text-[10px] font-semibold"
                          style={{ background: `${CAT_COLORS[s.topCategory] || '#64748b'}20`, color: CAT_COLORS[s.topCategory] || '#64748b' }}>
                          {s.topCategory}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-400">{s.avgImpact}%</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function LoadingCard() {
  return (
    <div className="p-5 rounded-2xl space-y-4" style={GLASS}>
      <div className="h-4 w-24 skeleton rounded" />
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => <div key={i} className="h-16 skeleton rounded-xl" />)}
      </div>
      <div className="h-2 skeleton rounded" />
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
function CompareDashboard() {
  const [selected, setSelected] = useState<[IndianState | null, IndianState | null, IndianState | null]>([
    null, null, null,
  ]);

  const usedSet = new Set(selected.filter(Boolean) as IndianState[]);

  const q0 = useStateMetrics(selected[0]);
  const q1 = useStateMetrics(selected[1]);
  const q2 = useStateMetrics(selected[2]);

  const queries = [q0, q1, q2];
  const anyLoading = queries.some((q) => q.isLoading);
  const loadedMetrics = queries.map((q) => q.data ?? null);
  const hasAny = selected.some(Boolean);

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />
      <NotificationCenter />

      <div className="pt-14 max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-1">Regional News Comparison</h1>
          <p className="text-slate-500 text-sm">Compare news volume, sentiment, and trends across Indian states</p>
        </motion.div>

        {/* State selectors */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {([0, 1, 2] as const).map((i) => (
            <StateSelector
              key={i}
              index={i}
              value={selected[i]}
              color={STATE_COLORS[i]}
              used={usedSet}
              onChange={(s) => setSelected((prev) => {
                const next = [...prev] as typeof selected;
                next[i] = s;
                return next;
              })}
            />
          ))}
        </div>

        {/* Hint */}
        {!hasAny && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)' }}>
              <Globe className="w-8 h-8 text-blue-400/60" />
            </div>
            <h2 className="text-lg font-bold text-slate-400 mb-2">Select states to compare</h2>
            <p className="text-sm text-slate-600 max-w-sm">
              Choose 2 or 3 states from the selectors above to see side-by-side news analytics, radar charts, and timeline comparisons.
            </p>
          </div>
        )}

        {/* Metric cards + charts */}
        {hasAny && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {([0, 1, 2] as const).map((i) => {
                if (!selected[i]) return null;
                if (queries[i].isLoading) return <LoadingCard key={i} />;
                if (!loadedMetrics[i]) return null;
                return <StateCard key={i} metrics={loadedMetrics[i]!} color={STATE_COLORS[i]} />;
              })}
            </div>

            {!anyLoading && <ComparisonCharts states={loadedMetrics} />}
          </>
        )}
      </div>
    </div>
  );
}

export function ComparePageClient() {
  return (
    <Providers>
      <CompareDashboard />
    </Providers>
  );
}
