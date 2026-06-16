import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'India Pulse AI — Real-Time Interactive News Intelligence',
  description:
    'Explore Indian news geographically on an interactive map. AI-powered summaries, sentiment analysis, analytics, and an AI assistant for every story across every state.',
  keywords: [
    'India news',
    'interactive map',
    'AI news summarization',
    'real-time news India',
    'India state news',
    'news analytics India',
  ],
  authors: [{ name: 'India Pulse AI' }],
  creator: 'India Pulse AI',
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    title: 'India Pulse AI — Real-Time News Intelligence',
    description:
      'Explore Indian news geographically. AI-powered summaries, sentiment analysis, and an intelligent news assistant.',
    siteName: 'India Pulse AI',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'India Pulse AI',
    description: 'Real-time interactive news intelligence for India.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <meta name="theme-color" content="#020617" />
      </head>
      <body className={`${inter.variable} font-sans bg-slate-950 text-slate-100 antialiased`}>
        {children}
      </body>
    </html>
  );
}
