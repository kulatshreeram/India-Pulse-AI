'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  FileText, Download, Map, TrendingUp, BarChart2,
  Calendar, BookOpen, Printer, Copy, Check,
  ChevronDown, Loader2, AlertCircle, RefreshCw,
  Table2, FileJson
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Providers } from '@/components/Providers';
import { downloadMarkdown, downloadText, downloadJson, downloadArticlesCsv, printReportAsPdf, markdownToHtml } from '@/hooks/useReportExport';
import { MOCK_ARTICLES } from '@/lib/mock-data';

// ── Types ─────────────────────────────────────────────────────────────────────
interface GeneratedReport {
  report_type: string;
  title: string;
  content: string;
  generated_at: string;
  article_count: number;
  sources: string[];
}

// ── Report type definitions ───────────────────────────────────────────────────
const REPORT_TYPES = [
  {
    id: 'daily_briefing',
    label: 'Daily Briefing',
    icon: Calendar,
    color: '#fb923c',
    desc: 'Concise overview of today\'s top stories across India',
    params: [],
  },
  {
    id: 'weekly_report',
    label: 'Weekly Report',
    icon: BookOpen,
    color: '#a855f7',
    desc: '7-day deep-dive with trend analysis and regional roundup',
    params: [],
  },
  {
    id: 'state_report',
    label: 'State Report',
    icon: Map,
    color: '#10b981',
    desc: 'Comprehensive news analysis for a specific Indian state',
    params: ['state'],
  },
  {
    id: 'topic_analysis',
    label: 'Topic Analysis',
    icon: TrendingUp,
    color: '#06b6d4',
    desc: 'Deep-dive on any topic: background, data, perspectives, outlook',
    params: ['topic'],
  },
  {
    id: 'sentiment_report',
    label: 'Sentiment Report',
    icon: BarChart2,
    color: '#f59e0b',
    desc: 'Analysis of news sentiment patterns across categories and states',
    params: [],
  },
] as const;

const STATES = [
  'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh',
  'West Bengal', 'Gujarat', 'Rajasthan', 'Telangana', 'Kerala',
  'Madhya Pradesh', 'Bihar', 'Punjab', 'Haryana', 'Odisha', 'Assam',
];

const TOPICS = [
  'Electric Vehicles', 'Startup Funding', 'Monsoon & Floods', 'Digital India',
  'AI Technology', 'Infrastructure', 'Healthcare', 'Education Policy',
  'Cryptocurrency', 'Clean Energy', 'Food Security', 'Urban Development',
];

// ── Markdown Components ────────────────────────────────────────────────────────
const MdComponents = {
  h1: ({ children }: any) => <h1 className="text-2xl font-black text-white mb-4 mt-2">{children}</h1>,
  h2: ({ children }: any) => (
    <h2 className="text-base font-bold text-white mb-3 mt-6 pb-2 border-b border-white/10">{children}</h2>
  ),
  h3: ({ children }: any) => <h3 className="text-sm font-bold text-slate-200 mb-2 mt-4">{children}</h3>,
  p:  ({ children }: any) => <p className="text-sm text-slate-300 leading-relaxed mb-3">{children}</p>,
  ul: ({ children }: any) => <ul className="space-y-1.5 mb-4 ml-2">{children}</ul>,
  ol: ({ children }: any) => <ol className="space-y-1.5 mb-4 ml-4 list-decimal">{children}</ol>,
  li: ({ children }: any) => (
    <li className="text-sm text-slate-300 flex gap-2">
      <span className="text-orange-400 flex-shrink-0 mt-0.5">•</span>
      <span>{children}</span>
    </li>
  ),
  strong: ({ children }: any) => <strong className="font-bold text-white">{children}</strong>,
  em:     ({ children }: any) => <em className="italic text-slate-400">{children}</em>,
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-4 border-orange-400 pl-4 py-2 my-3 bg-orange-400/5 rounded-r-lg text-slate-400 text-sm italic">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-5 border-white/10" />,
};

// ── Main component ─────────────────────────────────────────────────────────────
function ReportsPageInner() {
  const [selectedType, setSelectedType] = useState<string>('daily_briefing');
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [days, setDays] = useState(7);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<GeneratedReport | null>(null);
  const [copied, setCopied] = useState(false);

  const activeType = REPORT_TYPES.find((r) => r.id === selectedType)!;

  const generateReport = async () => {
    setLoading(true);
    setError(null);
    setReport(null);

    try {
      const body: any = {
        report_type: selectedType,
        days,
      };
      if (selectedType === 'state_report') body.state = selectedState;
      if (selectedType === 'topic_analysis') body.topic = customTopic || selectedTopic || 'technology';

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) throw new Error('Backend returned an error. Make sure the Python server is running.');
      const data: GeneratedReport = await res.json();
      setReport(data);
    } catch (err: any) {
      setError(err.message || 'Failed to generate report. Please start the backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!report) return;
    await navigator.clipboard.writeText(report.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMd = () => {
    if (!report) return;
    downloadMarkdown(report.content, report.report_type);
  };

  const handleDownloadTxt = () => {
    if (!report) return;
    downloadText(report.content, report.report_type);
  };

  const handleDownloadJson = () => {
    if (!report) return;
    downloadJson(report, report.report_type);
  };

  const handleDownloadCsv = () => {
    downloadArticlesCsv(MOCK_ARTICLES as any, report?.report_type || 'articles');
  };

  const handlePrint = () => {
    if (!report) return;
    printReportAsPdf(report.title, markdownToHtml(report.content));
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <Navbar />

      <div className="pt-14">
        {/* ── Page Header ────────────────────────────────────────────────── */}
        <div className="border-b border-white/[0.05] px-6 py-8"
          style={{ background: 'linear-gradient(180deg,rgba(251,146,60,0.04),transparent)' }}>
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#fb923c,#f97316)', boxShadow: '0 0 20px rgba(251,146,60,0.3)' }}>
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">Report Generation</h1>
                <p className="text-sm text-slate-500">AI-powered reports · Export PDF, CSV, JSON, Markdown</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* ── Config Panel ───────────────────────────────────────────── */}
            <div className="lg:col-span-1 space-y-5">
              {/* Report type picker */}
              <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="px-4 py-3 border-b border-white/[0.05]">
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Report Type</p>
                </div>
                <div className="p-2 space-y-1">
                  {REPORT_TYPES.map(({ id, label, icon: Icon, color, desc }) => (
                    <button
                      key={id}
                      onClick={() => setSelectedType(id)}
                      className="w-full flex items-start gap-3 p-3 rounded-xl text-left transition-all"
                      style={selectedType === id
                        ? { background: `${color}12`, border: `1px solid ${color}25` }
                        : { border: '1px solid transparent' }}
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                        style={{ background: `${color}15` }}>
                        <Icon className="w-4 h-4" style={{ color }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold" style={{ color: selectedType === id ? color : '#94a3b8' }}>{label}</p>
                        <p className="text-[10px] text-slate-600 mt-0.5 leading-relaxed">{desc}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Parameters */}
              {(activeType.params.includes('state') || activeType.params.includes('topic') || true) && (
                <div className="rounded-2xl p-4 space-y-4"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Parameters</p>

                  {/* Time range */}
                  <div>
                    <label className="text-xs font-semibold text-slate-500 block mb-2">Time Range</label>
                    <div className="flex gap-2">
                      {[1, 7, 14, 30].map((d) => (
                        <button key={d} onClick={() => setDays(d)}
                          className="flex-1 py-1.5 rounded-lg text-xs font-bold transition-all"
                          style={days === d
                            ? { background: 'rgba(251,146,60,0.2)', color: '#fb923c', border: '1px solid rgba(251,146,60,0.3)' }
                            : { background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.06)' }}>
                          {d}d
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* State selector */}
                  {activeType.params.includes('state') && (
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-2">State</label>
                      <select value={selectedState} onChange={(e) => setSelectedState(e.target.value)}
                        className="w-full text-xs px-3 py-2.5 rounded-xl outline-none appearance-none"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0' }}>
                        {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  )}

                  {/* Topic selector */}
                  {activeType.params.includes('topic') && (
                    <div>
                      <label className="text-xs font-semibold text-slate-500 block mb-2">Topic</label>
                      <input value={customTopic} onChange={(e) => setCustomTopic(e.target.value)}
                        placeholder="Enter custom topic..."
                        className="w-full text-xs px-3 py-2.5 rounded-xl outline-none mb-2"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0' }} />
                      <div className="flex flex-wrap gap-1.5">
                        {TOPICS.map((t) => (
                          <button key={t} onClick={() => setCustomTopic(t)}
                            className="text-[10px] px-2 py-1 rounded-lg transition-all"
                            style={customTopic === t || selectedTopic === t
                              ? { background: 'rgba(6,182,212,0.15)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.3)' }
                              : { background: 'rgba(255,255,255,0.04)', color: '#64748b', border: '1px solid rgba(255,255,255,0.06)' }}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Generate button */}
              <button onClick={generateReport} disabled={loading}
                className="w-full py-4 rounded-2xl text-sm font-black text-white transition-all disabled:opacity-60 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                style={{
                  background: `linear-gradient(135deg,${activeType.color},${activeType.color}99)`,
                  boxShadow: `0 8px 30px ${activeType.color}30`,
                }}>
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating Report...</>
                ) : (
                  <><FileText className="w-4 h-4" /> Generate {activeType.label}</>
                )}
              </button>

              {/* Export section (only when report exists) */}
              {report && (
                <div className="rounded-2xl p-4 space-y-2"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Export Report</p>
                  {[
                    { label: 'Download Markdown', icon: FileText, action: handleDownloadMd, color: '#fb923c' },
                    { label: 'Download Text (.txt)', icon: Download, action: handleDownloadTxt, color: '#3b82f6' },
                    { label: 'Download JSON', icon: FileJson, action: handleDownloadJson, color: '#10b981' },
                    { label: 'Export Articles CSV', icon: Table2, action: handleDownloadCsv, color: '#a855f7' },
                    { label: 'Print as PDF', icon: Printer, action: handlePrint, color: '#ef4444' },
                  ].map(({ label, icon: Icon, action, color }) => (
                    <button key={label} onClick={action}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all hover:scale-[1.01]"
                      style={{ background: `${color}0a`, border: `1px solid ${color}18`, color }}>
                      <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ── Report Viewer ──────────────────────────────────────────── */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl min-h-[600px] flex flex-col"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>

                {/* Viewer header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: activeType.color }} />
                    <span className="text-xs font-bold text-slate-400">
                      {report ? report.title : `${activeType.label} Preview`}
                    </span>
                    {report && (
                      <span className="text-[10px] text-slate-700 ml-2">
                        {report.article_count} articles · {report.sources.length} sources
                      </span>
                    )}
                  </div>
                  {report && (
                    <button onClick={handleCopy}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      style={{ background: 'rgba(255,255,255,0.05)', color: copied ? '#10b981' : '#64748b' }}>
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  )}
                </div>

                {/* Content area */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <AnimatePresence mode="wait">
                    {/* Loading */}
                    {loading && (
                      <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="flex flex-col items-center justify-center h-64 gap-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                          style={{ background: `${activeType.color}15` }}>
                          <Loader2 className="w-7 h-7 animate-spin" style={{ color: activeType.color }} />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-white mb-1">Generating {activeType.label}…</p>
                          <p className="text-xs text-slate-600">AI is analyzing live news data</p>
                        </div>
                        <div className="flex gap-1.5">
                          {[0, 1, 2].map((i) => (
                            <motion.div key={i} className="w-2 h-2 rounded-full"
                              style={{ background: activeType.color }}
                              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                              transition={{ delay: i * 0.2, repeat: Infinity, duration: 0.9 }} />
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Error */}
                    {error && !loading && (
                      <motion.div key="error" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
                          <AlertCircle className="w-6 h-6 text-red-400" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-red-400 mb-1">Generation Failed</p>
                          <p className="text-xs text-slate-600 max-w-xs">{error}</p>
                        </div>
                        <button onClick={generateReport}
                          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-red-400 transition-all hover:bg-red-400/10"
                          style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
                          <RefreshCw className="w-3.5 h-3.5" /> Try Again
                        </button>
                      </motion.div>
                    )}

                    {/* Empty state */}
                    {!report && !loading && !error && (
                      <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center h-64 gap-4 text-center">
                        <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
                          style={{ background: `${activeType.color}10` }}>
                          {(() => { const Icon = activeType.icon; return <Icon className="w-8 h-8" style={{ color: activeType.color }} />; })()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-white mb-1">Ready to Generate</p>
                          <p className="text-xs text-slate-600 max-w-xs">{activeType.desc}</p>
                        </div>
                        <button onClick={generateReport}
                          className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
                          style={{ background: `linear-gradient(135deg,${activeType.color},${activeType.color}cc)` }}>
                          Generate Now →
                        </button>
                      </motion.div>
                    )}

                    {/* Report content */}
                    {report && !loading && (
                      <motion.div key="report" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                        {/* Meta info */}
                        <div className="flex flex-wrap items-center gap-3 mb-6 pb-4 border-b border-white/[0.05]">
                          <span className="text-[10px] font-bold px-2 py-1 rounded-lg"
                            style={{ background: `${activeType.color}12`, color: activeType.color }}>
                            {activeType.label}
                          </span>
                          <span className="text-[10px] text-slate-600">
                            {new Date(report.generated_at).toLocaleString('en-IN')}
                          </span>
                          <span className="text-[10px] text-slate-600">
                            {report.article_count} articles analyzed
                          </span>
                          {report.sources.slice(0, 3).map((s) => (
                            <span key={s} className="text-[10px] text-slate-700 bg-white/5 px-2 py-0.5 rounded">{s}</span>
                          ))}
                          {report.sources.length > 3 && (
                            <span className="text-[10px] text-slate-700">+{report.sources.length - 3} more</span>
                          )}
                        </div>

                        {/* Markdown content */}
                        <ReactMarkdown components={MdComponents as any}>{report.content}</ReactMarkdown>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ReportsPageClient() {
  return (
    <Providers>
      <ReportsPageInner />
    </Providers>
  );
}
