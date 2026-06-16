'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, MapPin, Newspaper } from 'lucide-react';
import { useNewsStore } from '@/store/newsStore';
import { MOCK_ARTICLES } from '@/lib/mock-data';
import { INDIA_STATES } from '@/lib/india-states';
import { truncate } from '@/lib/utils';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setFilters, setSelectedArticle } = useNewsStore();

  const articleResults = query.length > 1
    ? MOCK_ARTICLES.filter(
        (a) =>
          a.title.toLowerCase().includes(query.toLowerCase()) ||
          a.tags.some((t) => t.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, 4)
    : [];

  const stateResults = query.length > 1
    ? INDIA_STATES.filter((s) =>
        s.name.toLowerCase().includes(query.toLowerCase()) ||
        s.capital.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 3)
    : [];

  const hasResults = articleResults.length > 0 || stateResults.length > 0;

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query) setFilters({ search: query });
      else setFilters({ search: undefined });
    }, 400);
    return () => clearTimeout(timeout);
  }, [query, setFilters]);

  return (
    <div className="relative">
      <div
        className="flex items-center gap-2 px-3"
        style={{
          background: 'rgba(9, 14, 28, 0.92)',
          backdropFilter: 'blur(20px)',
          border: `1px solid ${isOpen ? 'rgba(251,146,60,0.4)' : 'rgba(255,255,255,0.08)'}`,
          borderRadius: 12,
          height: 40,
          minWidth: 280,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          transition: 'border-color 0.2s',
        }}
      >
        <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder="Search states, cities, topics…"
          className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 outline-none"
          id="map-search-input"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setFilters({ search: undefined }); }}
            className="text-slate-600 hover:text-slate-300 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && hasResults && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 left-0 right-0 rounded-xl overflow-hidden z-50"
            style={{
              background: 'rgba(9, 14, 28, 0.98)',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
            }}
          >
            {stateResults.length > 0 && (
              <div className="p-2">
                <p className="section-heading px-2 py-1 mb-1">States</p>
                {stateResults.map((state) => (
                  <button
                    key={state.slug}
                    onClick={() => setFilters({ state: state.name })}
                    className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors text-left"
                  >
                    <MapPin className="w-3.5 h-3.5 text-saffron-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-slate-200">{state.name}</p>
                      <p className="text-xs text-slate-600">Capital: {state.capital}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {articleResults.length > 0 && (
              <div className="p-2 border-t border-white/5">
                <p className="section-heading px-2 py-1 mb-1">Articles</p>
                {articleResults.map((article) => (
                  <button
                    key={article.id}
                    onClick={() => setSelectedArticle(article)}
                    className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors text-left"
                  >
                    <Newspaper className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-slate-200 leading-snug">
                        {truncate(article.title, 70)}
                      </p>
                      <p className="text-xs text-slate-600">{article.source.name} · {article.state}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
