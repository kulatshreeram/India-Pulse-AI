'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send, User, Sparkles, RefreshCw, Newspaper } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Providers } from '@/components/Providers';
import { MOCK_ARTICLES, CATEGORY_ICONS } from '@/lib/mock-data';
import { formatRelativeTime, truncate, generateId } from '@/lib/utils';
import type { ChatMessage, NewsArticle } from '@/types';

// ── Suggested prompts ────────────────────────────────────────────────────────
const SUGGESTED_PROMPTS = [
  { text: 'What happened in Maharashtra today?',       icon: '🏙️' },
  { text: 'Show me the latest technology news',        icon: '💻' },
  { text: 'Summarize political news from Delhi',       icon: '🏛️' },
  { text: 'What are the biggest stories this week?',   icon: '📰' },
  { text: 'Any breaking health or weather news?',      icon: '⚡' },
  { text: 'Tell me about startup investment news',     icon: '🚀' },
];

// ── AI Response Engine (mock) ────────────────────────────────────────────────
function getMockAIResponse(query: string): { content: string; articles: NewsArticle[] } {
  const q = query.toLowerCase();

  const relevantArticles = MOCK_ARTICLES.filter(
    (a) =>
      a.title.toLowerCase().split(' ').some((w) => w.length > 4 && q.includes(w)) ||
      a.tags.some((t) => q.includes(t.toLowerCase())) ||
      (a.state && q.includes(a.state.toLowerCase())) ||
      q.includes(a.category.toLowerCase()) ||
      (a.city && q.includes(a.city.toLowerCase()))
  ).slice(0, 3);

  const topArticles = relevantArticles.length > 0 ? relevantArticles : MOCK_ARTICLES.slice(0, 3);

  let content = '';

  if (q.includes('maharashtra') || q.includes('mumbai') || q.includes('pune') || q.includes('nagpur')) {
    content = `**Maharashtra Today** 🏙️

Key developments in Maharashtra:

• **Mumbai Metro Line 3** hit 8 lakh daily riders — the Aqua Line slashed commute times from 75 to 40 minutes.

• **Drought Relief**: ₹15,000 crore agricultural package for 38 lakh farmers in Marathwada and Vidarbha.

• **Pune Startup Boom**: ₹4,200 crore VC investment landed in Q1 2025, cementing Pune as India's 3rd largest startup hub.

Maharashtra remains one of India's most economically dynamic states with strong infrastructure investment.`;
  } else if (q.includes('delhi') || q.includes('politics') || q.includes('budget') || q.includes('parliament') || q.includes('political')) {
    content = `**Delhi & Political News** 🏛️

Latest from the capital:

• **Union Budget 2025-26**: Record ₹18 lakh crore capital expenditure — 23% higher — targeting railways, roads, ports.

• **Digital India Act**: Lok Sabha passed India's first comprehensive AI and social media governance framework.

• **Delhi AQI**: Improved to 'Moderate' (85) — 5-year seasonal best as anti-pollution measures take hold.

• **NEET-UG**: Supreme Court ordered fresh exam within 45 days after paper leak evidence emerged.`;
  } else if (q.includes('tech') || q.includes('startup') || q.includes('bengaluru') || q.includes('bangalore') || q.includes('technology') || q.includes('investment')) {
    content = `**Technology & Startup News** 💻

Key tech developments across India:

• **$50B Semiconductor**: India-US summit unlocked Intel (Greater Noida) and Micron (Dholera, Gujarat) fab investments.

• **Hyderabad Tech Hub**: Surpassed Bengaluru in tech job creation — 2.4 lakh new positions in 2024.

• **Ather Energy IPO**: Bengaluru EV startup raised ₹3,100 crore, subscribed 47x at ₹22,000 crore valuation.

• **Jio GigaFiber**: 10 Gbps home broadband launched in Ahmedabad at ₹2,999/month — India first.`;
  } else if (q.includes('sports') || q.includes('cricket') || q.includes('neeraj') || q.includes('javelin')) {
    content = `**Sports Highlights** 🏏

• **Border-Gavaskar Trophy**: India beat Australia 3-1 — most dominant away Test win. Bumrah took 32 wickets, breaking Kapil Dev's 40-year record.

• **Neeraj Chopra**: New Asian record of 89.94m at Zurich Diamond League — only 6th person in history to cross 89m.

India is performing at an all-time high across cricket and athletics ahead of the 2028 Los Angeles Olympics.`;
  } else if (q.includes('health') || q.includes('nipah') || q.includes('vaccine') || q.includes('medical') || q.includes('weather') || q.includes('breaking')) {
    content = `**Health & Breaking News** ⚡

• **Nipah Alert (Kerala)**: Fresh Nipah cluster in Kozhikode — 3 cases, 1 death, 1,200 contacts traced. WHO monitoring closely.

• **mRNA Vaccine Breakthrough**: India's first indigenous mRNA vaccine (NMV-001) showed 94% efficacy in Phase 3 trials — CSIR-Serum Institute.

• **Chennai Floods**: IMD Red Alert as Cyclone Fengal remnants dump 40cm rain — airport operations suspended.

Authorities are on high alert in Kerala and Tamil Nadu.`;
  } else if (q.includes('science') || q.includes('isro') || q.includes('space') || q.includes('environment') || q.includes('climate')) {
    content = `**Science & Environment** 🔬

• **ISRO SpaDeX**: India achieved first autonomous in-orbit space docking — becoming the 4th nation with this critical capability.

• **Madhya Pradesh Tigers**: First Indian state to cross 1,000 tigers — 26% of India's total population.

• **Kerala Carbon Neutral**: First Indian state to achieve carbon neutrality for all government operations.

• **Bhadla Solar**: Rajasthan's 30 GW expansion will make it the world's largest renewable energy facility.`;
  } else if (q.includes('biggest') || q.includes('top') || q.includes('week') || q.includes('today') || q.includes('latest')) {
    content = `**Top Stories This Week** 📰

Here are the biggest stories from across India:

• **Maha Kumbh 2025**: 45 crore pilgrims — world record for the largest peaceful human gathering in history.

• **India-US Semiconductor Deal**: $50 billion in chip manufacturing investments announced.

• **ISRO SpaDeX**: India's first space docking mission — 4th nation globally to achieve this.

• **Chennai Floods**: Red alert as Cyclone Fengal remnants cause catastrophic flooding.

• **Budget 2025-26**: Record ₹18 lakh crore capital expenditure targeting infrastructure.

Want me to go deeper on any of these?`;
  } else {
    content = `**Here's what I found** 📰

Based on the latest news data:

${topArticles
  .map(
    (a, i) =>
      `**${i + 1}. ${a.title}**\n${a.summary}\n*Source: ${a.source.name} · ${a.state || 'India'} · Sentiment: ${a.sentiment}*`
  )
  .join('\n\n')}

Would you like me to go deeper on any of these, or search by a specific state or category?`;
  }

  return { content, articles: topArticles };
}

// ── Message Bubble ────────────────────────────────────────────────────────────
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  // Simple markdown-lite renderer
  const renderContent = (text: string) =>
    text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**') && line.split('**').length === 3)
        return <p key={i} className="font-bold text-white mb-1">{line.replace(/\*\*/g, '')}</p>;
      if (line.startsWith('• '))
        return <p key={i} className="mb-1.5 text-slate-300">{line}</p>;
      if (line.startsWith('*') && line.endsWith('*'))
        return <p key={i} className="text-xs text-slate-500 italic mt-0.5">{line.replace(/\*/g, '')}</p>;
      if (line === '') return <br key={i} />;
      // Handle inline bold
      const parts = line.split(/\*\*(.*?)\*\*/g);
      if (parts.length > 1)
        return (
          <p key={i} className="mb-1">
            {parts.map((part, j) => (j % 2 === 1 ? <strong key={j} className="text-white">{part}</strong> : part))}
          </p>
        );
      return <p key={i} className="mb-1">{line}</p>;
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-1"
        style={{
          background: isUser
            ? 'linear-gradient(135deg, #fb923c, #f97316)'
            : 'linear-gradient(135deg, #3b82f6, #6366f1)',
        }}
      >
        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>

      {/* Content */}
      <div className={`max-w-[82%] flex flex-col gap-2 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className="px-4 py-3 rounded-2xl text-sm leading-relaxed"
          style={{
            background: isUser
              ? 'linear-gradient(135deg, rgba(251,146,60,0.18), rgba(249,115,22,0.12))'
              : 'rgba(255,255,255,0.05)',
            border: isUser
              ? '1px solid rgba(251,146,60,0.3)'
              : '1px solid rgba(255,255,255,0.08)',
            color: '#e2e8f0',
          }}
        >
          {renderContent(message.content)}
        </div>

        {/* Related articles (assistant only) */}
        {!isUser && message.articles && message.articles.length > 0 && (
          <div className="space-y-2 w-full">
            {message.articles.slice(0, 2).map((article) => (
              <div
                key={article.id}
                className="flex items-start gap-2 p-2.5 rounded-xl text-xs"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <span className="text-base flex-shrink-0">{CATEGORY_ICONS[article.category]}</span>
                <div className="min-w-0">
                  <p className="font-medium text-slate-300 leading-snug">{truncate(article.title, 80)}</p>
                  <p className="text-slate-600 mt-0.5">{article.source.name} · {formatRelativeTime(article.publishedAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <span className="text-xs text-slate-700">
          {new Date(message.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}

// ── Inner App ─────────────────────────────────────────────────────────────────
function AssistantInner() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '**Welcome to India Pulse AI Assistant!** 👋\n\nI can help you:\n\n• Find news from any state or city\n• Summarize events by category (politics, tech, sports...)\n• Explain what\'s trending across India\n• Answer questions about specific stories\n\nWhat would you like to know?',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Simulate AI latency
    await new Promise((r) => setTimeout(r, 700 + Math.random() * 800));

    const { content, articles } = getMockAIResponse(text);

    const aiMsg: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      articles,
    };

    setMessages((prev) => [...prev, aiMsg]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950">
      <Navbar />

      <div className="flex-1 flex flex-col mt-14 max-w-3xl mx-auto w-full px-4 pb-4">
        {/* Header */}
        <div className="py-4 flex items-center justify-between border-b border-white/05">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
            >
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">India Pulse AI Assistant</h1>
              <p className="text-xs text-emerald-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Online · Powered by AI
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              setMessages([
                {
                  id: 'reset',
                  role: 'assistant',
                  content: 'Chat cleared! Ask me anything about Indian news.',
                  timestamp: new Date().toISOString(),
                },
              ])
            }
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Clear
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-5 py-5">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-3"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1)' }}
              >
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div
                className="px-4 py-3 rounded-2xl flex items-center gap-1.5"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-blue-400"
                    animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ delay: i * 0.2, duration: 0.8, repeat: Infinity }}
                  />
                ))}
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggested prompts — only show with no replies yet */}
        {messages.length <= 1 && (
          <div className="pb-4">
            <p className="section-heading mb-3">Suggested Questions</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt.text}
                  onClick={() => sendMessage(prompt.text)}
                  className="text-left flex items-start gap-2.5 p-3 rounded-xl text-xs font-medium transition-all hover:-translate-y-0.5"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    color: '#94a3b8',
                  }}
                >
                  <span className="text-base flex-shrink-0">{prompt.icon}</span>
                  {prompt.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input box */}
        <div
          className="sticky bottom-0 pt-3"
          style={{ background: 'rgba(2,6,23,0.95)', backdropFilter: 'blur(20px)' }}
        >
          <div
            className="flex items-center gap-2 px-3 py-2.5 rounded-2xl"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
              placeholder="Ask about any Indian state, topic, or event…"
              className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none"
              id="ai-chat-input"
              disabled={isLoading}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isLoading}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white transition-all disabled:opacity-30"
              style={{
                background: input.trim()
                  ? 'linear-gradient(135deg, #3b82f6, #6366f1)'
                  : 'rgba(255,255,255,0.08)',
              }}
              id="ai-chat-send"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-xs text-slate-700 text-center mt-2 mb-1">
            AI assistant uses live news data · All responses cite sources
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Export ────────────────────────────────────────────────────────────────────
export function AssistantPageClient() {
  return (
    <Providers>
      <AssistantInner />
    </Providers>
  );
}
