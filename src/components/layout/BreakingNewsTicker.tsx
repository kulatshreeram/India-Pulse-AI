'use client';

import { useBreakingNews } from '@/hooks/useNews';
import { Zap } from 'lucide-react';

export function BreakingNewsTicker() {
  const { data: articles } = useBreakingNews();

  if (!articles?.length) return null;

  const tickerText = articles
    .map((a) => `⚡ ${a.title}`)
    .join('   •••   ');

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-40 h-8 flex items-center overflow-hidden"
      style={{
        background: 'rgba(2, 6, 23, 0.9)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(239, 68, 68, 0.3)',
      }}
    >
      {/* LIVE label */}
      <div
        className="flex-shrink-0 flex items-center gap-1.5 px-3 h-full"
        style={{ background: 'rgba(239, 68, 68, 0.9)', borderRight: '1px solid rgba(239, 68, 68, 0.3)' }}
      >
        <Zap className="w-3 h-3 text-white" />
        <span className="text-white text-xs font-bold tracking-wider">LIVE</span>
      </div>

      {/* Scrolling text */}
      <div className="flex-1 overflow-hidden relative">
        <div
          className="whitespace-nowrap text-xs text-slate-300 font-medium"
          style={{ animation: 'ticker 60s linear infinite' }}
        >
          {tickerText}
          &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          {tickerText}
        </div>
      </div>
    </div>
  );
}
