import type { Metadata } from 'next';
import { AnalyticsPageClient } from './AnalyticsPageClient';

export const metadata: Metadata = {
  title: 'News Analytics Dashboard — India Pulse AI',
  description:
    'Trending topics, sentiment distribution, state activity, and news timeline analytics for India.',
};

export default function AnalyticsPage() {
  return <AnalyticsPageClient />;
}
