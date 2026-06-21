'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Zap, AlertCircle, Info, Bell } from 'lucide-react';
import { useNotificationStore, type AppNotification } from '@/store/notificationStore';
import Link from 'next/link';

const TYPE_CONFIG = {
  breaking: { icon: Zap,          color: '#ef4444', bg: 'rgba(239,68,68,0.12)',  label: 'Breaking' },
  alert:    { icon: AlertCircle,   color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Alert'    },
  update:   { icon: Bell,          color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: 'Update'   },
  info:     { icon: Info,          color: '#64748b', bg: 'rgba(100,116,139,0.12)',label: 'Info'     },
};

function timeAgo(ts: number) {
  const diff = Date.now() - ts;
  if (diff < 60_000)  return 'just now';
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return `${Math.floor(diff / 86400_000)}d ago`;
}

function NotificationItem({ n }: { n: AppNotification }) {
  const { markRead, dismiss } = useNotificationStore();
  const cfg = TYPE_CONFIG[n.type];
  const Icon = cfg.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ duration: 0.2 }}
      onClick={() => markRead(n.id)}
      className="relative flex gap-3 px-4 py-3 cursor-pointer group transition-colors"
      style={{
        background: n.read ? 'transparent' : 'rgba(255,255,255,0.03)',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Unread dot */}
      {!n.read && (
        <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-saffron-400 flex-shrink-0" />
      )}

      {/* Icon */}
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: cfg.bg }}
      >
        <Icon className="w-4 h-4" style={{ color: cfg.color }} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: cfg.color }}>
            {cfg.label}
          </span>
          {n.state && (
            <span className="text-[10px] text-slate-600 bg-slate-800 px-1.5 py-0.5 rounded">
              {n.state}
            </span>
          )}
        </div>
        <p className="text-xs font-semibold text-slate-200 leading-snug line-clamp-2">{n.body}</p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-slate-600">{timeAgo(n.timestamp)}</span>
          {n.articleId && (
            <Link
              href={`/news/${n.articleId}`}
              className="text-[10px] text-saffron-400 hover:text-saffron-300 font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              Read →
            </Link>
          )}
        </div>
      </div>

      {/* Dismiss */}
      <button
        onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
        className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center text-slate-600 hover:text-slate-300 hover:bg-white/10 transition-all flex-shrink-0"
      >
        <X className="w-3 h-3" />
      </button>
    </motion.div>
  );
}

export function NotificationCenter() {
  const { notifications, isOpen, setOpen, markAllRead, clearAll, preferences, setPreferences, unreadCount } =
    useNotificationStore();
  const count = unreadCount();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.18 }}
            className="fixed top-16 right-4 z-50 w-80 max-h-[calc(100vh-80px)] flex flex-col rounded-2xl overflow-hidden"
            style={{
              background: 'rgba(9,14,28,0.98)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-saffron-400" />
                <span className="text-sm font-bold text-white">Notifications</span>
                {count > 0 && (
                  <span className="text-[10px] font-bold bg-saffron-400 text-slate-900 px-1.5 py-0.5 rounded-full">
                    {count}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {count > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[10px] text-slate-500 hover:text-slate-300 px-2 py-1 rounded hover:bg-white/5 transition-colors"
                  >
                    Mark all read
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={clearAll}
                    className="text-[10px] text-slate-500 hover:text-red-400 px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Notifications list */}
            <div className="flex-1 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <Bell className="w-8 h-8 text-slate-700 mb-3" />
                  <p className="text-sm font-medium text-slate-500">No notifications yet</p>
                  <p className="text-xs text-slate-700 mt-1">Breaking news alerts will appear here</p>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {notifications.map((n) => (
                    <NotificationItem key={n.id} n={n} />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Preferences footer */}
            <div
              className="px-4 py-3 border-t border-white/5 space-y-2"
              style={{ background: 'rgba(255,255,255,0.02)' }}
            >
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Preferences</p>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { key: 'breaking', label: 'Breaking News' },
                    { key: 'alerts', label: 'Alerts' },
                    { key: 'browserPush', label: 'Browser Push' },
                    { key: 'sound', label: 'Sound' },
                  ] as const
                ).map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() => setPreferences({ [key]: !preferences[key] })}
                      className="relative w-7 h-4 rounded-full transition-colors cursor-pointer flex-shrink-0"
                      style={{ background: preferences[key] ? '#fb923c' : 'rgba(255,255,255,0.1)' }}
                    >
                      <div
                        className="absolute top-0.5 w-3 h-3 bg-white rounded-full shadow transition-all"
                        style={{ left: preferences[key] ? '14px' : '2px' }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500">{label}</span>
                  </label>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
