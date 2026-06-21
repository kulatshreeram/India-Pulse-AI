// ─── Core News Types ────────────────────────────────────────────────────────

export type NewsCategory =
  | 'politics'
  | 'technology'
  | 'startups'
  | 'business'
  | 'sports'
  | 'entertainment'
  | 'education'
  | 'science'
  | 'weather'
  | 'crime'
  | 'health'
  | 'government';

export type Sentiment = 'positive' | 'negative' | 'neutral';

export type Language = 'en' | 'hi' | 'mr';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface ImpactScore {
  local: number;    // 0–100
  state: number;    // 0–100
  national: number; // 0–100
  global: number;   // 0–100
}

export interface NewsSource {
  id: string;
  name: string;
  logoUrl?: string;
  url: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  description: string;
  content?: string;
  summary: string;
  aiSummary?: string;
  source: NewsSource;
  category: NewsCategory;
  state: IndianState | null;
  city?: string;
  coordinates: Coordinates | null;
  publishedAt: string;
  imageUrl: string;
  url?: string;
  sentiment: Sentiment;
  sentimentScore: number; // -1 to 1
  impactScore: ImpactScore;
  tags: string[];
  relatedArticleIds?: string[];
  isBreaking?: boolean;
  viewCount?: number;
  bookmarked?: boolean;
}

export interface NewsFilter {
  category?: NewsCategory;
  state?: IndianState;
  sentiment?: Sentiment;
  dateRange?: 'today' | 'yesterday' | '7days' | '30days' | 'custom';
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface NewsResponse {
  status: 'ok' | 'error';
  totalResults: number;
  articles: NewsArticle[];
  _mock?: boolean;
}

// ─── Indian States ───────────────────────────────────────────────────────────

export type IndianState =
  | 'Andhra Pradesh'
  | 'Arunachal Pradesh'
  | 'Assam'
  | 'Bihar'
  | 'Chhattisgarh'
  | 'Goa'
  | 'Gujarat'
  | 'Haryana'
  | 'Himachal Pradesh'
  | 'Jharkhand'
  | 'Karnataka'
  | 'Kerala'
  | 'Madhya Pradesh'
  | 'Maharashtra'
  | 'Manipur'
  | 'Meghalaya'
  | 'Mizoram'
  | 'Nagaland'
  | 'Odisha'
  | 'Punjab'
  | 'Rajasthan'
  | 'Sikkim'
  | 'Tamil Nadu'
  | 'Telangana'
  | 'Tripura'
  | 'Uttar Pradesh'
  | 'Uttarakhand'
  | 'West Bengal'
  | 'Delhi'
  | 'Jammu and Kashmir'
  | 'Ladakh'
  | 'Chandigarh'
  | 'Puducherry'
  | 'Lakshadweep'
  | 'Andaman and Nicobar Islands'
  | 'Dadra and Nagar Haveli'
  | 'Daman and Diu';

export interface StateInfo {
  name: IndianState;
  slug: string;
  capital: string;
  coordinates: Coordinates;
  population: number;
  area: number;
  newsCount: number;
  topCategory?: NewsCategory;
  sentimentScore?: number;
  color?: string;
}

// ─── AI / Chat Types ─────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  sources?: NewsSource[];
  articles?: NewsArticle[];
  isStreaming?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface AISummary {
  articleId: string;
  summary: string;
  keyPoints: string[];
  sentiment: Sentiment;
  impactAssessment: string;
  generatedAt: string;
  language: Language;
}

// ─── Analytics Types ─────────────────────────────────────────────────────────

export interface TrendingTopic {
  id: string;
  topic: string;
  count: number;
  trend: 'rising' | 'falling' | 'stable';
  growthRate?: string;
  category: NewsCategory;
  states: IndianState[];
}

export interface SentimentData {
  positive: number;
  negative: number;
  neutral: number;
  trend: Array<{ date: string; positive: number; negative: number; neutral: number }>;
}

export interface StateActivity {
  state: IndianState;
  articleCount: number;
  topCategory: NewsCategory;
  sentimentScore: number;
}

export interface AnalyticsData {
  totalArticles: number;
  totalStates: number;
  totalCategories: number;
  totalAISummaries: number;
  trendingTopics: TrendingTopic[];
  sentimentData: SentimentData;
  stateActivity: StateActivity[];
  timelineData: Array<{ date: string; count: number }>;
  categoryBreakdown: Array<{ category: NewsCategory; count: number; percentage: number }>;
  categorySentiment?: Record<string, { dominant: string; positive: number; negative: number; neutral: number }>;
  newsMoods?: Array<{ source: string; positive: number; neutral: number; negative: number; mood: 'positive' | 'neutral' | 'negative' }>;
}

// ─── UI State Types ───────────────────────────────────────────────────────────

export interface MapState {
  center: Coordinates;
  zoom: number;
  selectedArticle: NewsArticle | null;
  hoveredState: IndianState | null;
  isHeatmapMode: boolean;
  isPanelOpen: boolean;
  filters: NewsFilter;
}

export interface SearchResult {
  articles: NewsArticle[];
  states: StateInfo[];
  topics: TrendingTopic[];
  query: string;
}
