'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import {
  Bot, Send, User, Sparkles, RefreshCw, Newspaper, Download,
  FileText, ChevronRight, BookOpen, TrendingUp, BarChart2,
  Map, Calendar, Search, X, Copy, Check, Printer
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Providers } from '@/components/Providers';
import { useChatHistory, useChatMutation } from '@/hooks/useNews';
import { useTranslation, WELCOME_MESSAGES } from '@/hooks/useTranslation';
import { generateId } from '@/lib/utils';
import { REPORT_CONFIGS, type ReportType } from '@/hooks/useReportGeneration';
import {
  downloadMarkdown, downloadText, printReportAsPdf, markdownToHtml
} from '@/hooks/useReportExport';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import type { ChatMessage } from '@/types';

// ── Sidebar mode config ───────────────────────────────────────────────────────
const SIDEBAR_MODES = [
  { id: 'chat',       label: 'Chat',           icon: Bot,       color: '#3b82f6' },
  { id: 'briefing',   label: 'Daily Briefing', icon: Calendar,  color: '#fb923c' },
  { id: 'weekly',     label: 'Weekly Report',  icon: BookOpen,  color: '#a855f7' },
  { id: 'state',      label: 'State Report',   icon: Map,       color: '#10b981' },
  { id: 'topic',      label: 'Topic Analysis', icon: Search,    color: '#06b6d4' },
  { id: 'sentiment',  label: 'Sentiment',      icon: BarChart2, color: '#f59e0b' },
  { id: 'trend',      label: 'Trends',         icon: TrendingUp,color: '#ef4444' },
] as const;

type SidebarMode = (typeof SIDEBAR_MODES)[number]['id'];

const STATES = [
  'Maharashtra', 'Delhi', 'Karnataka', 'Tamil Nadu', 'Uttar Pradesh',
  'West Bengal', 'Gujarat', 'Rajasthan', 'Telangana', 'Kerala',
  'Madhya Pradesh', 'Bihar', 'Punjab', 'Haryana', 'Odisha',
];

const QUICK_TOPICS = [
  'Electric Vehicles', 'Startup Funding', 'Monsoon & Floods', 'Digital India',
  'AI in India', 'Infrastructure Projects', 'Healthcare Reforms', 'Education Policy',
];

// ── Markdown components ───────────────────────────────────────────────────────
const MdComponents = {
  h1: ({ children }: any) => <h1 className="text-xl font-black text-white mb-3 mt-4">{children}</h1>,
  h2: ({ children }: any) => (
    <h2 className="text-base font-bold text-white mb-2 mt-5 pb-1.5 border-b border-white/10 flex items-center gap-2">
      {children}
    </h2>
  ),
  h3: ({ children }: any) => <h3 className="text-sm font-bold text-slate-200 mb-1.5 mt-3">{children}</h3>,
  p: ({ children }: any) => <p className="text-sm text-slate-300 leading-relaxed mb-2">{children}</p>,
  ul: ({ children }: any) => <ul className="space-y-1 mb-3 ml-3">{children}</ul>,
  ol: ({ children }: any) => <ol className="space-y-1 mb-3 ml-4 list-decimal">{children}</ol>,
  li: ({ children }: any) => (
    <li className="text-sm text-slate-300 flex gap-2">
      <span className="text-saffron-400 flex-shrink-0 mt-0.5">•</span>
      <span>{children}</span>
    </li>
  ),
  strong: ({ children }: any) => <strong className="font-bold text-white">{children}</strong>,
  em: ({ children }: any) => <em className="italic text-slate-400">{children}</em>,
  blockquote: ({ children }: any) => (
    <blockquote className="border-l-2 border-saffron-400 pl-3 py-1 my-2 bg-saffron-400/5 rounded-r-lg text-slate-400 text-sm italic">
      {children}
    </blockquote>
  ),
  code: ({ children }: any) => (
    <code className="text-xs bg-white/10 text-saffron-300 px-1.5 py-0.5 rounded font-mono">
      {children}
    </code>
  ),
  hr: () => <hr className="my-4 border-white/10" />,
};

// ── Message Bubble ────────────────────────────────────────────────────────────
function MessageBubble({
  message,
  onCopy,
  onDownload,
  onPrint,
}: {
  message: ChatMessage;
  onCopy: (text: string) => void;
  onDownload: (text: string) => void;
  onPrint: (text: string) => void;
}) {
  const isUser = message.role === 'user';
  const isReport = !isUser && message.content.startsWith('#');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    onCopy(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1 shadow-lg"
        style={{
          background: isUser
            ? 'linear-gradient(135deg,#fb923c,#f97316)'
            : 'linear-gradient(135deg,#3b82f6,#6366f1)',
        }}
      >
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>

      {/* Content */}
      <div className={`max-w-[88%] flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
          style={{
            background: isUser
              ? 'linear-gradient(135deg,rgba(251,146,60,0.15),rgba(249,115,22,0.08))'
              : isReport
              ? 'rgba(255,255,255,0.04)'
              : 'rgba(255,255,255,0.05)',
            border: isUser
              ? '1px solid rgba(251,146,60,0.25)'
              : '1px solid rgba(255,255,255,0.08)',
            maxWidth: isReport ? '100%' : undefined,
          }}
        >
          {isUser ? (
            <p className="text-slate-200">{message.content}</p>
          ) : (
            <ReactMarkdown components={MdComponents as any}>{message.content}</ReactMarkdown>
          )}
        </div>

        {/* AI message actions */}
        {!isUser && (
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-all"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={() => onDownload(message.content)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold text-slate-600 hover:text-saffron-400 hover:bg-saffron-400/5 transition-all"
            >
              <Download className="w-3 h-3" /> Download .md
            </button>
            {isReport && (
              <button
                onClick={() => onPrint(message.content)}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-semibold text-slate-600 hover:text-blue-400 hover:bg-blue-400/5 transition-all"
              >
                <Printer className="w-3 h-3" /> Print PDF
              </button>
            )}
            {/* Source citations */}
            {message.articles && message.articles.length > 0 && (
              <span className="text-[10px] text-slate-700 ml-1">
                {message.articles.length} source{message.articles.length !== 1 ? 's' : ''} cited
              </span>
            )}
          </div>
        )}

        {/* Source cards */}
        {!isUser && message.articles && message.articles.length > 0 && (
          <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-1.5 mt-1">
            {message.articles.slice(0, 4).map((article) => (
              <a
                key={article.id}
                href={article.url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 rounded-xl text-xs hover:bg-white/8 transition-all group"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <Newspaper className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-300 truncate">{article.source.name}</p>
                  <p className="text-slate-600 text-[10px] truncate">{article.title}</p>
                </div>
                <ChevronRight className="w-3 h-3 text-slate-700 group-hover:text-saffron-400 flex-shrink-0" />
              </a>
            ))}
          </div>
        )}

        <span className="text-[10px] text-slate-700">
          {new Date(message.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}

// ── Main inner component ──────────────────────────────────────────────────────
function AssistantInner() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<SidebarMode>('chat');
  const [selectedState, setSelectedState] = useState('Maharashtra');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: historyData, isLoading: isHistoryLoading } = useChatHistory();
  const chatMutation = useChatMutation();
  const { t, language } = useTranslation();

  // Load chat history
  useEffect(() => {
    if (historyData && historyData.length > 0) {
      const chatMsgs: ChatMessage[] = [];
      [...historyData].reverse().forEach((log) => {
        chatMsgs.push({ id: `${log.id}-q`, role: 'user', content: log.question, timestamp: log.timestamp });
        chatMsgs.push({
          id: `${log.id}-a`, role: 'assistant', content: log.answer, timestamp: log.timestamp,
          articles: log.sources.map((s: any, idx: number) => ({
            id: `source-${log.id}-${idx}`, title: `Read article on ${s.name}`, url: s.url,
            source: { name: s.name, url: s.url, id: s.name.toLowerCase() },
            imageUrl: '', category: 'politics' as any, sentiment: 'neutral',
            sentimentScore: 0, impactScore: { local: 0, state: 0, national: 0, global: 0 },
            tags: [], publishedAt: log.timestamp, summary: '',
          })),
        });
      });
      setMessages(chatMsgs);
    } else if (!isHistoryLoading) {
      setMessages([{
        id: 'welcome', role: 'assistant',
        content: WELCOME_MESSAGES[language as keyof typeof WELCOME_MESSAGES] || WELCOME_MESSAGES.en,
        timestamp: new Date().toISOString(),
      }]);
    }
  }, [historyData, isHistoryLoading]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatMutation.isPending]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || chatMutation.isPending) return;

    const userMsg: ChatMessage = { id: generateId(), role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    try {
      const response = await chatMutation.mutateAsync({ question: text });
      const aiMsg: ChatMessage = {
        id: response.id, role: 'assistant', content: response.answer, timestamp: response.timestamp,
        articles: response.sources.map((s: any, idx: number) => ({
          id: `source-${response.id}-${idx}`, title: `Read on ${s.name}`, url: s.url,
          source: { name: s.name, url: s.url, id: s.name.toLowerCase() },
          imageUrl: '', category: 'politics' as any, sentiment: 'neutral',
          sentimentScore: 0, impactScore: { local: 0, state: 0, national: 0, global: 0 },
          tags: [], publishedAt: response.timestamp, summary: '',
        })),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [...prev, {
        id: generateId(), role: 'assistant',
        content: '⚠️ Could not connect to the AI backend. Please start the Python backend with `uvicorn app.main:app --reload` in the `/backend` folder.',
        timestamp: new Date().toISOString(),
      }]);
    }
  }, [chatMutation]);

  const generateReport = () => {
    const cfg = REPORT_CONFIGS.find((r) => {
      if (mode === 'briefing')  return r.type === 'daily_briefing';
      if (mode === 'weekly')    return r.type === 'weekly_report';
      if (mode === 'state')     return r.type === 'state_report';
      if (mode === 'topic')     return r.type === 'topic_analysis';
      if (mode === 'sentiment') return r.type === 'sentiment_report';
      if (mode === 'trend')     return r.type === 'trend_explanation';
      return false;
    });
    if (!cfg) return;

    const prompt = cfg.buildPrompt({
      state: selectedState,
      topic: selectedTopic || undefined,
      date: new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
    });
    sendMessage(prompt);
    setMode('chat');
  };

  const handleCopy = (text: string) => navigator.clipboard.writeText(text);
  const handleDownload = (text: string) => {
    const title = text.split('\n')[0].replace(/^#+ /, '').slice(0, 40) || 'report';
    downloadMarkdown(text, title);
  };
  const handlePrint = (text: string) => {
    const title = text.split('\n')[0].replace(/^#+ /, '').slice(0, 40) || 'Report';
    printReportAsPdf(title, markdownToHtml(text));
  };

  const clearChat = () => setMessages([{
    id: 'reset', role: 'assistant',
    content: 'Chat cleared! I\'m ready to help with analysis, reports, and news research.',
    timestamp: new Date().toISOString(),
  }]);

  const activeMode = SIDEBAR_MODES.find((m) => m.id === mode);

  return (
    <div className="flex flex-col h-screen bg-slate-950">
      <Navbar />
      <NotificationCenter />

      <div className="flex flex-1 mt-14 overflow-hidden">
        {/* ── Sidebar ─────────────────────────────────────────────────────────── */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 240, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-shrink-0 h-full overflow-hidden border-r border-white/[0.06] flex flex-col"
              style={{ background: 'rgba(9,14,28,0.95)' }}
            >
              <div className="p-4 border-b border-white/[0.05]">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">Research Modes</p>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {SIDEBAR_MODES.map(({ id, label, icon: Icon, color }) => (
                  <button
                    key={id}
                    onClick={() => setMode(id as SidebarMode)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all text-left"
                    style={
                      mode === id
                        ? { background: `${color}15`, color, border: `1px solid ${color}25` }
                        : { color: '#64748b', border: '1px solid transparent' }
                    }
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" style={{ color: mode === id ? color : undefined }} />
                    {label}
                    {mode === id && <ChevronRight className="w-3 h-3 ml-auto" style={{ color }} />}
                  </button>
                ))}
              </div>

              {/* Report config panel */}
              {mode !== 'chat' && (
                <div className="p-4 border-t border-white/[0.05] space-y-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                    {activeMode?.label} Options
                  </p>

                  {(mode === 'state') && (
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="w-full text-xs px-3 py-2 rounded-xl outline-none"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0' }}
                    >
                      {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  )}

                  {(mode === 'topic' || mode === 'trend') && (
                    <>
                      <input
                        value={selectedTopic}
                        onChange={(e) => setSelectedTopic(e.target.value)}
                        placeholder="Enter topic..."
                        className="w-full text-xs px-3 py-2 rounded-xl outline-none"
                        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', color: '#e2e8f0' }}
                      />
                      <div className="flex flex-wrap gap-1">
                        {QUICK_TOPICS.slice(0, 4).map((t) => (
                          <button
                            key={t}
                            onClick={() => setSelectedTopic(t)}
                            className="text-[9px] px-1.5 py-0.5 rounded text-slate-500 hover:text-saffron-400 transition-colors"
                            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </>
                  )}

                  <button
                    onClick={generateReport}
                    disabled={chatMutation.isPending}
                    className="w-full py-2.5 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-50"
                    style={{ background: `linear-gradient(135deg,${activeMode?.color},${activeMode?.color}cc)` }}
                  >
                    {chatMutation.isPending ? 'Generating...' : `Generate ${activeMode?.label}`}
                  </button>
                </div>
              )}

              {/* Clear chat */}
              <div className="p-3 border-t border-white/[0.05]">
                <button
                  onClick={clearChat}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs text-slate-600 hover:text-slate-400 hover:bg-white/5 transition-all"
                >
                  <RefreshCw className="w-3 h-3" /> Clear Chat
                </button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* ── Main chat area ─────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Chat header */}
          <div
            className="flex items-center justify-between px-5 py-3 border-b border-white/[0.06] flex-shrink-0"
            style={{ background: 'rgba(9,14,28,0.8)', backdropFilter: 'blur(20px)' }}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-300 hover:bg-white/5 transition-all"
              >
                <FileText className="w-4 h-4" />
              </button>
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }}
              >
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white">India Pulse Research Assistant</h1>
                <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {activeMode ? `${activeMode.label} Mode` : 'Chat Mode'} · AI-Powered
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-700 hidden sm:block">
                {messages.filter((m) => m.role === 'user').length} messages
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {isHistoryLoading && messages.length === 0 ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 rounded-full border-2 border-blue-400/20 border-t-blue-400 animate-spin" />
              </div>
            ) : (
              messages.map((msg) => (
                <MessageBubble
                  key={msg.id}
                  message={msg}
                  onCopy={handleCopy}
                  onDownload={handleDownload}
                  onPrint={handlePrint}
                />
              ))
            )}

            {/* Typing indicator */}
            {chatMutation.isPending && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)' }}>
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="px-4 py-3 rounded-2xl flex items-center gap-1.5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {[0, 1, 2].map((i) => (
                    <motion.div key={i} className="w-2 h-2 rounded-full bg-blue-400"
                      animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                      transition={{ delay: i * 0.2, duration: 0.8, repeat: Infinity }}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Suggested prompts — only on fresh chat */}
            {messages.length <= 1 && !chatMutation.isPending && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pb-2">
                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3">Quick Start</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { text: 'What happened in Maharashtra today?',     icon: '🏙️' },
                    { text: 'Show me the latest technology news',      icon: '💻' },
                    { text: 'Summarize political news from Delhi',      icon: '🏛️' },
                    { text: 'What are the biggest stories this week?', icon: '📰' },
                    { text: 'Any breaking health or weather news?',    icon: '⚡' },
                    { text: 'Tell me about startup investment news',   icon: '🚀' },
                  ].map((p) => (
                    <button
                      key={p.text}
                      onClick={() => sendMessage(p.text)}
                      className="text-left flex items-start gap-2.5 p-3 rounded-xl text-xs font-medium transition-all hover:-translate-y-0.5 hover:bg-white/[0.06]"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: '#94a3b8' }}
                    >
                      <span className="text-base flex-shrink-0">{p.icon}</span>
                      {p.text}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>

          {/* Input bar */}
          <div
            className="px-5 py-4 flex-shrink-0 border-t border-white/[0.05]"
            style={{ background: 'rgba(2,6,23,0.95)', backdropFilter: 'blur(20px)' }}
          >
            <div
              className="flex items-center gap-2 px-4 py-3 rounded-2xl transition-all"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: `1px solid ${input ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.08)'}`,
                boxShadow: input ? '0 0 0 3px rgba(59,130,246,0.06)' : 'none',
              }}
            >
              <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                placeholder={mode === 'chat' ? 'Ask anything about Indian news...' : `Ready to generate ${activeMode?.label}...`}
                className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none"
                disabled={chatMutation.isPending}
              />
              {input && (
                <button onClick={() => setInput('')} className="text-slate-600 hover:text-slate-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || chatMutation.isPending}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-30 flex-shrink-0"
                style={{ background: input.trim() ? 'linear-gradient(135deg,#3b82f6,#6366f1)' : 'rgba(255,255,255,0.08)' }}
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <p className="text-[10px] text-slate-700 text-center mt-2">
              AI Research Assistant · Powered by live Indian news data · All responses cite sources
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AssistantPageClient() {
  return (
    <Providers>
      <AssistantInner />
    </Providers>
  );
}
