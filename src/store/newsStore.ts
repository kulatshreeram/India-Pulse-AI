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
  toggleBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;
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
  toggleBookmark: (id) =>
    set((state) => ({
      bookmarks: state.bookmarks.includes(id)
        ? state.bookmarks.filter((b) => b !== id)
        : [...state.bookmarks, id],
    })),
  isBookmarked: (id) => get().bookmarks.includes(id),
}));
