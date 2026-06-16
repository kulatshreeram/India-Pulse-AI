import type { Metadata } from 'next';
import { AssistantPageClient } from './AssistantPageClient';

export const metadata: Metadata = {
  title: 'AI News Assistant — India Pulse AI',
  description:
    'Ask anything about Indian news. Your AI assistant answers using the latest verified news data from across all Indian states.',
};

export default function AssistantPage() {
  return <AssistantPageClient />;
}
