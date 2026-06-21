'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppAuth } from '@/context/AuthContext';
import { useUserBookmarks, useToggleBookmark } from '@/hooks/useNews';
import { Navbar } from '@/components/layout/Navbar';
import { Bookmark, Loader2, Trash2, Calendar, Newspaper, ArrowRight, BookOpen } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { CATEGORY_COLORS } from '@/lib/mock-data';

export default function LibraryPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, isSignedIn, isLoading } = useAppAuth();
  
  const { data: bookmarks = [], isLoading: isBookmarksLoading } = useUserBookmarks();
  const toggleBookmarkMutation = useToggleBookmark();

  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // Route protection redirect
  useEffect(() => {
    if (!isLoading && !isSignedIn) {
      router.push('/login');
    }
  }, [isSignedIn, isLoading, router]);

  if (isLoading || isBookmarksLoading) {
    return (
      <main className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </main>
    );
  }

  if (!user) return null;

  const handleRemove = async (articleId: string) => {
    try {
      await toggleBookmarkMutation.mutateAsync(articleId);
    } catch (e) {
      console.error(e);
    }
  };

  // Filter bookmarks by category
  const filteredBookmarks = selectedCategory
    ? bookmarks.filter((b) => b.category === selectedCategory)
    : bookmarks;

  // Find all unique categories in bookmarks
  const bookmarkCategories = Array.from(new Set(bookmarks.map((b) => b.category)));

  return (
    <main className="min-h-screen bg-slate-950 text-white pt-24 pb-16 px-6 relative overflow-hidden">
      <Navbar />

      {/* Ambient background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-orange-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-orange-400" />
              <h1 className="text-2xl font-bold tracking-tight">{t('Research Library')}</h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {bookmarks.length} {t('articles saved in your reading list')}
            </p>
          </div>

          {/* Category Filter */}
          {bookmarks.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-bold uppercase">Filter:</span>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-950 border border-white/10 rounded-lg text-xs font-semibold px-3 py-1.5 text-slate-300 focus:outline-none focus:border-orange-500 outline-none capitalize"
              >
                <option value="">All Categories</option>
                {bookmarkCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Empty State */}
        {bookmarks.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center p-16 rounded-3xl text-center border border-dashed border-white/5"
            style={{ background: 'rgba(9, 14, 28, 0.4)' }}
          >
            <div className="w-16 h-16 rounded-2xl bg-orange-500/10 flex items-center justify-center mb-6 border border-orange-500/20">
              <BookOpen className="w-8 h-8 text-orange-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-300">{t('No Bookmarked Articles')}</h2>
            <p className="text-xs text-slate-500 mt-2 max-w-sm leading-normal">
              Click the bookmark icon on any article cards while exploring the map dashboard to build your custom reading list and research library.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white transition-all shadow-glow-sm"
              style={{
                background: 'linear-gradient(135deg, #fb923c, #f97316)',
              }}
            >
              Explore Live Map
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : filteredBookmarks.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-sm font-semibold">
            No bookmarked articles in the &quot;{selectedCategory}&quot; category.
          </div>
        ) : (
          /* Bookmarks Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBookmarks.map((art) => {
              const catColor = CATEGORY_COLORS[art.category] || '#64748b';
              return (
                <div
                  key={art.id}
                  className="rounded-2xl overflow-hidden flex flex-col hover:border-white/10 transition-all border border-white/5 group"
                  style={{
                    background: 'rgba(9, 14, 28, 0.75)',
                    backdropFilter: 'blur(20px)',
                  }}
                >
                  {/* Image */}
                  <div className="h-44 w-full relative overflow-hidden bg-slate-950">
                    <img
                      src={art.imageUrl}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span
                      className="absolute top-3 left-3 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider text-white"
                      style={{
                        background: `${catColor}cc`,
                        border: '1px solid rgba(255,255,255,0.15)',
                      }}
                    >
                      {art.category}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col gap-3">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(art.publishedAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short'
                        })}
                      </span>
                      <span>{art.source.name}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-200 line-clamp-2 leading-snug group-hover:text-orange-400 transition-colors">
                      {art.title}
                    </h3>
                    
                    <p className="text-xs text-slate-500 line-clamp-3 leading-normal flex-1">
                      {art.description}
                    </p>

                    {/* Footer Actions */}
                    <div className="border-t border-white/5 pt-3.5 mt-2 flex items-center justify-between">
                      <button
                        onClick={() => {
                          // Open in dashboard details
                          router.push(`/dashboard?search=${encodeURIComponent(art.title)}`);
                        }}
                        className="text-xs font-bold text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-all"
                      >
                        Read Summary
                        <ArrowRight className="w-3 h-3" />
                      </button>

                      <button
                        onClick={() => handleRemove(art.id)}
                        className="p-2 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        title="Remove Bookmark"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
