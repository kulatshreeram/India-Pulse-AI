import { Metadata } from 'next';
import { ReportsPageClient } from './ReportsPageClient';

export const metadata: Metadata = {
  title: 'Reports — India Pulse AI',
  description: 'Generate AI-powered news reports for any Indian state or topic. Export as PDF, CSV, JSON or Markdown.',
};

export default function ReportsPage() {
  return <ReportsPageClient />;
}
