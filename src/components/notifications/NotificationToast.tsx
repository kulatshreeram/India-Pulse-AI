'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Zap, AlertCircle, Bell, Info, X } from 'lucide-react';
import { useNotificationStore, type AppNotification } from '@/store/notificationStore';
import Link from 'next/link';

const TYPE_CONFIG = {
  breaking: { icon: Zap,        color: '#ef4444', border: 'rgba(239,68,68,0.3)'  },
  alert:    { icon: AlertCircle, color: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
  update:   { icon: Bell,        color: '#3b82f6', border: 'rgba(59,130,246,0.3)' },
  info:     { icon: Info,        color: '#64748b', border: 'rgba(100,116,139,0.3)'},
};

function Toast({ n, onDismiss }: { n: AppNotification; onDismiss: () => void }) {
  const cfg = TYPE_CONFIG[n.type];
  const Icon = cfg.icon;

  useEffect(() => {
    const timer = setTimeout(onDismiss, 6000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.22 }}
      className="w-80 rounded-xl overflow-hidden"
      style={{
        background: 'rgba(9,14,28,0.97)',
        border: `1px solid ${cfg.border}`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${cfg.border}`,
      }}
    >
      {/* Progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: 6, ease: 'linear' }}
        className="h-0.5 origin-left"
        style={{ background: cfg.color }}
      />

      <div className="flex gap-3 px-4 py-3">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${cfg.color}20` }}
        >
          <Icon className="w-4 h-4" style={{ color: cfg.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: cfg.color }}>
            {n.type === 'breaking' ? '🔴 Breaking News' : n.title}
          </p>
          <p className="text-xs font-medium text-slate-200 leading-snug line-clamp-2">{n.body}</p>
          {n.articleId && (
            <Link
              href={`/news/${n.articleId}`}
              className="inline-block mt-1.5 text-[10px] font-bold text-saffron-400 hover:text-saffron-300"
              onClick={onDismiss}
            >
              Read full story →
            </Link>
          )}
        </div>
        <button
          onClick={onDismiss}
          className="w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:text-slate-300 flex-shrink-0"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}

export function NotificationToast() {
  const { notifications, dismiss } = useNotificationStore();
  const [shown, setShown] = useState<Set<string>>(new Set());
  const [visible, setVisible] = useState<AppNotification[]>([]);

  useEffect(() => {
    const newOnes = notifications.filter(
      (n) => !n.read && !shown.has(n.id) && Date.now() - n.timestamp < 10_000
    );
    if (newOnes.length === 0) return;

    setShown((prev) => {
      const next = new Set(prev);
      newOnes.forEach((n) => next.add(n.id));
      return next;
    });
    setVisible((prev) => [...prev, ...newOnes].slice(-3));
  }, [notifications]);

  const handleDismiss = (id: string) => {
    setVisible((prev) => prev.filter((n) => n.id !== id));
    dismiss(id);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {visible.map((n) => (
          <div key={n.id} className="pointer-events-auto">
            <Toast n={n} onDismiss={() => handleDismiss(n.id)} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
