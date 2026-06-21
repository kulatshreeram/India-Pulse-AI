import { create } from 'zustand';
import type { NewsArticle, NewsFilter, MapState, IndianState } from '@/types';

interface NewsStore {
  // Articles
  articles: NewsArticle[];
  setArticles: (articles: NewsArticle[]) => void;
  
  // Map state
  selectedArticle: NewsArticle | null;
  setSelectedArticle: (article: NewsArticle | null) => void;
  isPanelOpen: boolean;
  setIsPanelOpen: (open: boolean) => void;
  isHeatmapMode: boolean;
  toggleHeatmap: () => void;
  hoveredState: IndianState | null;
  setHoveredState: (state: IndianState | null) => void;
  
  // Filters
  filters: NewsFilter;
  setFilters: (filters: Partial<NewsFilter>) => void;
  resetFilters: () => void;
  
  // UI
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  language: 'en' | 'hi' | 'mr';
  setLanguage: (lang: 'en' | 'hi' | 'mr') => void;
  
  // Bookmarks
  bookmarks: string[];
  setBookmarks: (ids: string[]) => void;
  toggleBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;

  // Viewed articles tracking (Smart Recommendations)
  viewedArticles: string[];
  addViewedArticle: (id: string) => void;
  loadViewedArticles: () => void;

  // Replay Mode
  replayTimestamp: number | null;
  isReplayActive: boolean;
  setReplayState: (state: Partial<{ replayTimestamp: number | null; isReplayActive: boolean }>) => void;
}

const DEFAULT_FILTERS: NewsFilter = {
  page: 1,
  limit: 50,
};

export const useNewsStore = create<NewsStore>((set, get) => ({
  // Articles
  articles: [],
  setArticles: (articles) => set({ articles }),
  
  // Map state
  selectedArticle: null,
  setSelectedArticle: (article) => set({ selectedArticle: article, isPanelOpen: !!article }),
  isPanelOpen: false,
  setIsPanelOpen: (open) => set({ isPanelOpen: open }),
  isHeatmapMode: false,
  toggleHeatmap: () => set((state) => ({ isHeatmapMode: !state.isHeatmapMode })),
  hoveredState: null,
  setHoveredState: (state) => set({ hoveredState: state }),
  
  // Filters
  filters: DEFAULT_FILTERS,
  setFilters: (newFilters) =>
    set((state) => ({ filters: { ...state.filters, ...newFilters, page: 1 } })),
  resetFilters: () => set({ filters: DEFAULT_FILTERS }),
  
  // UI
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
  language: 'en',
  setLanguage: (language) => set({ language }),
  
  // Bookmarks
  bookmarks: [],
  setBookmarks: (bookmarks) => set({ bookmarks }),
  toggleBookmark: (id) =>
    set((state) => ({
      bookmarks: state.bookmarks.includes(id)
        ? state.bookmarks.filter((b) => b !== id)
        : [...state.bookmarks, id],
    })),
  isBookmarked: (id) => get().bookmarks.includes(id),
  
  // Viewed articles
  viewedArticles: [],
  addViewedArticle: (id) =>
    set((state) => {
      const updated = state.viewedArticles.includes(id)
        ? state.viewedArticles
        : [...state.viewedArticles, id].slice(-20);
      if (typeof window !== 'undefined') {
        localStorage.setItem('viewed_articles', JSON.stringify(updated));
      }
      return { viewedArticles: updated };
    }),
  loadViewedArticles: () => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('viewed_articles');
        if (stored) {
          set({ viewedArticles: JSON.parse(stored) });
        }
      } catch (e) {
        console.error('Error loading viewed articles:', e);
      }
    }
  },

  // Replay Mode
  replayTimestamp: null,
  isReplayActive: false,
  setReplayState: (newState) => set((state) => ({ ...state, ...newState })),
}));
