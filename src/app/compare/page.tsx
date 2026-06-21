import type { Metadata } from 'next';
import { ComparePageClient } from './ComparePageClient';

export const metadata: Metadata = {
  title: 'State Comparison — India Pulse AI',
  description:
    'Compare news volume, sentiment, trending topics, and regional insights across Indian states side-by-side.',
};

export default function ComparePage() {
  return <ComparePageClient />;
}
