'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Map, Bot, BarChart3, Newspaper,
  Settings, User, Bell, Globe,
  ChevronDown, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNewsStore } from '@/store/newsStore';
import { useTranslation } from '@/hooks/useTranslation';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Live Map',  icon: Map      },
  { href: '/assistant', label: 'AI Chat',   icon: Bot      },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
];

export function Navbar() {
  const pathname = usePathname();
  const { language, setLanguage } = useNewsStore();
  const { t } = useTranslation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14">
      <div
        className="h-full px-4 flex items-center justify-between"
        style={{
          background: 'rgba(2, 6, 23, 0.85)',
          backdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-saffron-400 to-orange-600 flex items-center justify-center shadow-glow-sm">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm hidden sm:block">
            <span className="gradient-text">India Pulse</span>
            <span className="text-slate-400 ml-1 font-medium">AI</span>
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200',
                pathname === href || pathname.startsWith(href + '/')
                  ? 'bg-saffron-400/15 text-saffron-400 border border-saffron-400/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:block">{t(label)}</span>
            </Link>
          ))}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-2">
          {/* Language selector */}
          <div className="relative group">
            <button className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 text-xs font-medium transition-all">
              <Globe className="w-3.5 h-3.5" />
              <span className="uppercase">{language}</span>
              <ChevronDown className="w-3 h-3" />
            </button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:block">
              <div
                className="py-1 rounded-lg overflow-hidden"
                style={{
                  background: 'rgba(15,23,42,0.98)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  minWidth: 100,
                }}
              >
                {(['en', 'hi', 'mr'] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    className={cn(
                      'w-full text-left px-3 py-1.5 text-xs font-medium transition-colors',
                      language === lang ? 'text-saffron-400' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    )}
                  >
                    {lang === 'en' ? 'English' : lang === 'hi' ? 'हिंदी' : 'मराठी'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all relative">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-saffron-400" />
          </button>

          <Link
            href="/profile"
            className="w-8 h-8 rounded-lg bg-gradient-to-br from-saffron-400/30 to-orange-600/30 flex items-center justify-center border border-saffron-400/20 hover:border-saffron-400/50 transition-all"
          >
            <User className="w-4 h-4 text-saffron-400" />
          </Link>
        </div>
      </div>
    </nav>
  );
}
