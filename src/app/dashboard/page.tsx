import type { Metadata } from 'next';
import { DashboardPageClient } from './DashboardPageClient';

export const metadata: Metadata = {
  title: 'Live India News Dashboard — India Pulse AI',
  description:
    'Explore real-time Indian news geographically on our interactive dashboard. Click any state or city marker to read local news with AI summaries.',
};

export default function DashboardPage() {
  return <DashboardPageClient />;
}
