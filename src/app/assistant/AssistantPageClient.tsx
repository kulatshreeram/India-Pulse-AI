'use client';

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Send, User, Sparkles, RefreshCw, Newspaper } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Providers } from '@/components/Providers';
import { useChatHistory, useChatMutation } from '@/hooks/useNews';
import { useTranslation, WELCOME_MESSAGES } from '@/hooks/useTranslation';
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

        {/* Sources Attribution List */}
        {!isUser && message.articles && message.articles.length > 0 && (
          <div className="space-y-1.5 w-full mt-1">
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-1">Sources Cited:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {message.articles.map((article) => (
                <a
                  key={article.id}
                  href={article.url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-2 rounded-xl text-xs hover:bg-white/10 transition-all border border-white/06 group"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                  }}
                >
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Newspaper className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <span className="font-medium text-slate-300 truncate">{article.source.name}</span>
                  </div>
                  <span className="text-[10px] text-saffron-400 group-hover:underline flex-shrink-0">Visit →</span>
                </a>
              ))}
            </div>
          </div>
        )}

        <span className="text-[10px] text-slate-700 mt-0.5">
          {new Date(message.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </motion.div>
  );
}

// ── Inner App ─────────────────────────────────────────────────────────────────
function AssistantInner() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: historyData, isLoading: isHistoryLoading } = useChatHistory();
  const chatMutation = useChatMutation();
  const { t, language } = useTranslation();

  useEffect(() => {
    if (historyData && historyData.length > 0) {
      const chatMsgs: ChatMessage[] = [];
      [...historyData].reverse().forEach((log) => {
        chatMsgs.push({
          id: `${log.id}-q`,
          role: 'user',
          content: log.question,
          timestamp: log.timestamp,
        });
        chatMsgs.push({
          id: `${log.id}-a`,
          role: 'assistant',
          content: log.answer,
          timestamp: log.timestamp,
          articles: log.sources.map((s: any, idx: number) => ({
            id: `source-${log.id}-${idx}`,
            title: `Read article on ${s.name}`,
            url: s.url,
            source: { name: s.name, url: s.url, id: s.name.toLowerCase() },
            imageUrl: '',
            category: 'politics' as any,
            sentiment: 'neutral',
            sentimentScore: 0.0,
            impactScore: { local: 0, state: 0, national: 0, global: 0 },
            tags: [],
            publishedAt: log.timestamp,
            summary: ''
          })),
        });
      });
      setMessages(chatMsgs);
    } else if (!isHistoryLoading) {
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: WELCOME_MESSAGES[language as keyof typeof WELCOME_MESSAGES] || WELCOME_MESSAGES.en,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
  }, [historyData, isHistoryLoading]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatMutation.isPending]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || chatMutation.isPending) return;

    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');

    try {
      const response = await chatMutation.mutateAsync({ question: text });

      const aiMsg: ChatMessage = {
        id: response.id,
        role: 'assistant',
        content: response.answer,
        timestamp: response.timestamp,
        articles: response.sources.map((s: any, idx: number) => ({
          id: `source-${response.id}-${idx}`,
          title: `Read article on ${s.name}`,
          url: s.url,
          source: { name: s.name, url: s.url, id: s.name.toLowerCase() },
          imageUrl: '',
          category: 'politics' as any,
          sentiment: 'neutral',
          sentimentScore: 0.0,
          impactScore: { local: 0, state: 0, national: 0, global: 0 },
          tags: [],
          publishedAt: response.timestamp,
          summary: ''
        })),
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errMsg: ChatMessage = {
        id: generateId(),
        role: 'assistant',
        content: 'I encountered an error connecting to the AI assistant. Please check your backend connection.',
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errMsg]);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-950">
      <Navbar />

      <div className="flex-1 flex flex-col mt-14 max-w-3xl mx-auto w-full px-4 pb-4 overflow-hidden">
        {/* Header */}
        <div className="py-4 flex items-center justify-between border-b border-white/05 flex-shrink-0">
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
                  content: language === 'hi' ? 'चैट साफ़ हो गई! भारतीय समाचारों के बारे में कुछ भी पूछें।' : language === 'mr' ? 'चॅट साफ झाली! भारतीय बातम्यांबद्दल काहीही विचारा.' : 'Chat cleared! Ask me anything about Indian news.',
                  timestamp: new Date().toISOString(),
                },
              ])
            }
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" /> {t("Clear Chat")}
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-5 py-5 pr-1">
          {isHistoryLoading && messages.length === 0 ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 rounded-full border-2 border-blue-400/20 border-t-blue-400 animate-spin" />
            </div>
          ) : (
            messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))
          )}

          {/* Typing indicator */}
          {chatMutation.isPending && (
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
          <div className="pb-4 flex-shrink-0">
            <p className="section-heading mb-3">{t("Suggested Questions")}</p>
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
                  {t(prompt.text)}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input box */}
        <div
          className="pt-3 flex-shrink-0"
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
              placeholder={t("Ask anything about Indian news...")}
              className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none"
              id="ai-chat-input"
              disabled={chatMutation.isPending}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || chatMutation.isPending}
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
          <p className="text-[10px] text-slate-700 text-center mt-2 mb-1">
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
