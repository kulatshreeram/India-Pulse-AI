// ── Report prompt templates ────────────────────────────────────────────────────
export type ReportType =
  | 'daily_briefing'
  | 'weekly_report'
  | 'state_report'
  | 'topic_analysis'
  | 'sentiment_report'
  | 'trend_explanation';

export interface ReportConfig {
  type: ReportType;
  label: string;
  icon: string;
  description: string;
  buildPrompt: (params: { state?: string; topic?: string; date?: string }) => string;
}

export const REPORT_CONFIGS: ReportConfig[] = [
  {
    type: 'daily_briefing',
    label: 'Daily Briefing',
    icon: '📋',
    description: 'A concise overview of today\'s top stories across India',
    buildPrompt: ({ date }) =>
      `Generate a comprehensive Daily News Briefing for India for ${date || 'today'}. 

Format your response exactly as:

# 🇮🇳 India Daily Briefing — ${date || new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

## 📊 Today at a Glance
[3-4 sentence executive summary of the most important news]

## 🔴 Top Stories
[Number each story 1-5, with headline, 2-3 sentence summary, and source]

## 🗺️ State Highlights
[Brief bullet points for 4-5 most active states]

## 📈 Market & Economy
[Key economic and business developments]

## 🔬 Technology & Science
[Notable tech and science stories]

## ⚽ Sports
[Key sports results and headlines]

## 🌤️ Weather & Environment
[Major weather events and environmental news]

## 💡 Insight of the Day
[One analytical insight about today's news patterns]

Use bullet points, numbered lists, and bold text for key terms. Cite your sources clearly.`,
  },
  {
    type: 'weekly_report',
    label: 'Weekly Report',
    icon: '📅',
    description: 'A deep-dive analysis of the past 7 days of Indian news',
    buildPrompt: () =>
      `Generate a comprehensive Weekly India News Report covering the past 7 days.

Format your response exactly as:

# 📅 India Weekly Report — Week of ${new Date().toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}

## Executive Summary
[4-5 sentence overview of the week's most significant developments]

## 🏆 Top 5 Stories of the Week
[Numbered list with each story having: headline, detailed 3-4 sentence analysis, why it matters, source]

## 📊 Trend Analysis
[What patterns emerged this week? Which categories dominated?]

## 🗺️ Regional Roundup
[State-by-state summary for the 5 most newsworthy states]

## 📈 Economy & Markets
[Weekly economic analysis and business news]

## 🔮 What to Watch Next Week
[3-4 stories or developments to monitor]

## 📉 Sentiment Analysis
[Overall tone of the week's news — positive/negative/neutral breakdown by category]

Be analytical and insightful. Cite all sources with article titles and publication names.`,
  },
  {
    type: 'state_report',
    label: 'State Report',
    icon: '🗺️',
    description: 'Comprehensive news analysis for a specific Indian state',
    buildPrompt: ({ state = 'Maharashtra' }) =>
      `Generate a comprehensive State News Report for ${state}.

Format your response exactly as:

# 🗺️ ${state} State News Report

## Overview
[3-4 sentence summary of what's happening in ${state}]

## 🔴 Breaking & Top Stories
[Top 5 stories from ${state} with detailed summaries, numbered]

## 🏛️ Politics & Governance
[Political developments, government decisions, policy changes]

## 💰 Economy & Business
[Key economic stories, investments, business developments in ${state}]

## 🎓 Education & Social
[Education, healthcare, social developments]

## 🏗️ Infrastructure & Development
[Infrastructure projects, urban development, connectivity]

## 🌱 Environment
[Environmental news, weather events, green initiatives]

## 📊 ${state} at a Glance
- **News Volume:** [estimate articles count]
- **Top Category:** [most covered topic]
- **Overall Sentiment:** [positive/negative/neutral with brief explanation]
- **Key Cities in News:** [list cities mentioned most]

## 🔮 Key Issues to Watch
[2-3 ongoing stories or developing situations in ${state}]

Provide specific facts, numbers, and cite all sources clearly.`,
  },
  {
    type: 'topic_analysis',
    label: 'Topic Analysis',
    icon: '🔍',
    description: 'Deep-dive analysis on a specific topic or event',
    buildPrompt: ({ topic = 'technology startups' }) =>
      `Generate a comprehensive Topic Analysis Report on: "${topic}" in the context of Indian news.

Format your response exactly as:

# 🔍 Topic Analysis: ${topic}

## What's Happening
[Detailed explanation of the current state of "${topic}" in India — 4-5 sentences]

## 📰 Key Developments
[Numbered list of 5-6 most important recent developments related to this topic]

## 🗺️ Geographic Impact
[Which Indian states/regions are most affected? Why?]

## 📊 Data & Numbers
[Key statistics, figures, percentages relevant to this topic]

## 🔗 Related Issues
[What other topics/stories are connected to this one?]

## 📈 Trend Analysis
[Is this topic growing, declining, or stable in news coverage? What drives it?]

## 💡 Expert Perspective
[Analytical insights — what does this mean for India?]

## 🔮 Outlook
[What's likely to happen next? Key events to watch]

## 📚 Sources
[List all sources cited in this analysis]

Be analytical, cite specific examples, and provide genuine insight beyond surface-level reporting.`,
  },
  {
    type: 'sentiment_report',
    label: 'Sentiment Report',
    icon: '📊',
    description: 'Analysis of news sentiment patterns across categories and states',
    buildPrompt: () =>
      `Generate a comprehensive News Sentiment Analysis Report for India.

Format your response exactly as:

# 📊 India News Sentiment Report

## Overall Mood
[What is the overall tone of Indian news right now? 3-4 sentences]

## 😊 Most Positive Topics
[Top 5 topics/categories generating positive news, with examples]

## 😟 Most Concerning Topics
[Top 5 topics/categories with negative sentiment, with context]

## 😐 Neutral/Factual Heavy Coverage
[Topics dominated by neutral, informational reporting]

## 🗺️ Regional Sentiment Map
[Which states have the most positive news? Which have the most challenges?]

## 📈 Sentiment Trends
[How has the mood of Indian news changed recently?]

## 🔍 Category Breakdown
- **Politics:** [sentiment + brief explanation]
- **Economy:** [sentiment + brief explanation]  
- **Technology:** [sentiment + brief explanation]
- **Health:** [sentiment + brief explanation]
- **Sports:** [sentiment + brief explanation]
- **Environment:** [sentiment + brief explanation]

## 💡 Analyst Notes
[Key insights about what the sentiment patterns reveal about India right now]

Be balanced, analytical, and cite specific news examples to support each point.`,
  },
  {
    type: 'trend_explanation',
    label: 'Trend Explanation',
    icon: '📈',
    description: 'Explain what\'s trending and why it matters',
    buildPrompt: ({ topic = '' }) =>
      `Explain the current trending news topic in India${topic ? `: "${topic}"` : ''}.

Format your response exactly as:

# 📈 Trending Now: ${topic || 'Top Trending Story in India'}

## What's Trending?
[Clear explanation of what the trend is — 3-4 sentences for someone unfamiliar]

## 📰 The Full Story
[Detailed background and context — what led to this? 5-6 sentences]

## 🔢 Key Facts
[Bullet list of the most important facts, numbers, and data points]

## 🗺️ Who's Affected?
[Which states, communities, industries, or groups are most impacted?]

## 💬 Different Perspectives
[What are various stakeholders saying? Include at least 3 viewpoints]

## 📊 Why Is This Trending Now?
[Analyze the timing — why is this getting attention now?]

## 🔗 Connections
[How does this connect to other ongoing stories or long-term trends in India?]

## 🔮 What Happens Next?
[Likely developments to watch, key dates, decision points]

## 📚 Where to Read More
[Suggest specific sources and article types to follow this story]

Make this accessible to general readers while still being substantive and analytical.`,
  },
];
