'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Map, Bot, BarChart3, Search, GitCompare,
  Settings, User, Bell, Globe,
  ChevronDown, Zap, Bookmark, LogOut, LayoutDashboard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNewsStore } from '@/store/newsStore';
import { useTranslation } from '@/hooks/useTranslation';
import { useAppAuth } from '@/context/AuthContext';
import { useNotificationStore } from '@/store/notificationStore';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

const NAV_LINKS = [
  { href: '/dashboard', label: 'Live Map',  icon: Map       },
  { href: '/assistant', label: 'AI Chat',   icon: Bot       },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/search',    label: 'Search',    icon: Search    },
  { href: '/compare',   label: 'Compare',   icon: GitCompare },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage } = useNewsStore();
  const { t } = useTranslation();
  const { user, isSignedIn, logout } = useAppAuth();
  const { isOpen, setOpen, unreadCount } = useNotificationStore();
  
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const unread = unreadCount();

  const handleLogout = async () => {
    await logout();
    setUserMenuOpen(false);
    router.push('/');
  };

  return (
    <>
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
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-saffron-400 to-orange-600 flex items-center justify-center shadow-glow-sm">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm hidden sm:block">
              <span className="gradient-text">India Pulse</span>
              <span className="text-slate-400 ml-1 font-medium">AI</span>
            </span>
          </Link>

          {/* Nav links */}
          <div className="flex items-center gap-0.5 overflow-x-auto no-scrollbar">
            {NAV_LINKS.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex-shrink-0',
                  pathname === href || pathname.startsWith(href + '/')
                    ? 'bg-saffron-400/15 text-saffron-400 border border-saffron-400/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                )}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden md:block">{t(label)}</span>
              </Link>
            ))}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {/* Language selector */}
            <div className="relative group">
              <button className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 text-xs font-medium transition-all">
                <Globe className="w-3.5 h-3.5" />
                <span className="uppercase hidden sm:block">{language}</span>
              </button>
              <div className="absolute right-0 top-full mt-1 hidden group-hover:block z-50">
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

            {/* Bell / Notification button */}
            <button
              onClick={() => setOpen(!isOpen)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unread > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[8px] font-bold flex items-center justify-center leading-none">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>

            {/* Authentication Section */}
            {isSignedIn && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1.5 focus:outline-none"
                >
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-8 h-8 rounded-full border border-saffron-400/20 object-cover"
                  />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setUserMenuOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 top-full mt-2 w-56 rounded-xl overflow-hidden z-20"
                        style={{
                          background: 'rgba(15,23,42,0.98)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                        }}
                      >
                        <div className="px-4 py-3 border-b border-white/5">
                          <p className="text-xs font-bold text-slate-200 truncate">{user.name}</p>
                          <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                        </div>
                        
                        <div className="p-1">
                          <Link
                            href="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                          >
                            <User className="w-3.5 h-3.5 text-slate-500" />
                            {t('Profile & Interests')}
                          </Link>
                          
                          <Link
                            href="/library"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                          >
                            <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                            {t('Research Library')}
                          </Link>
                        </div>
                        
                        <div className="p-1 border-t border-white/5">
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            {t('Sign Out')}
                          </button>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-white transition-all shadow-glow-sm"
                style={{
                  background: 'linear-gradient(135deg, #fb923c, #f97316)',
                }}
              >
                {t('Sign In')}
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Notification center dropdown (renders in portal-like position) */}
      <NotificationCenter />
    </>
  );
}
