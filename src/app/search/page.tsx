import type { Metadata } from 'next';
import { SearchPageClient } from './SearchPageClient';

export const metadata: Metadata = {
  title: 'Advanced News Search — India Pulse AI',
  description:
    'Search thousands of Indian news articles by state, category, sentiment, source, and date range. Google-like news discovery with real-time results.',
};

export default function SearchPage() {
  return <SearchPageClient />;
}
