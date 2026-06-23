'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Map, Bot, BarChart3, Search, GitCompare,
  LayoutDashboard, Zap, ChevronRight, FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Live Map',    icon: Map,             color: '#fb923c', desc: 'Interactive India news map' },
  { href: '/assistant', label: 'AI Chat',     icon: Bot,             color: '#3b82f6', desc: 'AI research assistant'       },
  { href: '/analytics', label: 'Analytics',   icon: BarChart3,       color: '#a855f7', desc: 'News insights & charts'      },
  { href: '/search',    label: 'Search',      icon: Search,          color: '#10b981', desc: 'Find any story fast'         },
  { href: '/compare',   label: 'Compare',     icon: GitCompare,      color: '#06b6d4', desc: 'Compare states & regions'    },
  { href: '/reports',   label: 'Reports',     icon: FileText,        color: '#f59e0b', desc: 'Generate AI reports'         },
];

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const { t } = useTranslation();

  // Close on route change
  useEffect(() => { onClose(); }, [pathname]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 h-full w-72 z-[70] flex flex-col"
            style={{
              background: 'rgba(9, 14, 28, 0.98)',
              backdropFilter: 'blur(24px)',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white">India Pulse</p>
                  <p className="text-[10px] text-slate-500">AI News Platform</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav Links */}
            <div className="flex-1 overflow-y-auto p-4 space-y-1.5">
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 px-1">Navigation</p>
              {NAV_LINKS.map(({ href, label, icon: Icon, color, desc }) => {
                const isActive = pathname === href || pathname.startsWith(href + '/');
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all group',
                      isActive ? 'border' : 'border border-transparent'
                    )}
                    style={isActive ? {
                      background: `${color}12`,
                      borderColor: `${color}25`,
                    } : {}}
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110"
                      style={{ background: isActive ? `${color}20` : 'rgba(255,255,255,0.05)' }}
                    >
                      <Icon className="w-4 h-4" style={{ color: isActive ? color : '#64748b' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold" style={{ color: isActive ? color : '#e2e8f0' }}>
                        {t(label)}
                      </p>
                      <p className="text-[10px] text-slate-600 truncate">{desc}</p>
                    </div>
                    <ChevronRight
                      className="w-3.5 h-3.5 flex-shrink-0 transition-all group-hover:translate-x-0.5"
                      style={{ color: isActive ? color : '#334155' }}
                    />
                  </Link>
                );
              })}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-white/[0.05]">
              <div
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl"
                style={{ background: 'rgba(251,146,60,0.06)', border: '1px solid rgba(251,146,60,0.12)' }}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                <span className="text-xs text-slate-400">AI services online</span>
              </div>
              <p className="text-center text-[10px] text-slate-700 mt-3">India Pulse AI · v1.0</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
