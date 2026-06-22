'use client';

import type { NewsArticle } from '@/types';

// ── Download helpers ─────────────────────────────────────────────────────────

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function slugDate() {
  return new Date().toISOString().slice(0, 10);
}

// ── Markdown / Text export ───────────────────────────────────────────────────

export function downloadMarkdown(content: string, title: string) {
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  downloadBlob(blob, `india-pulse-${title.toLowerCase().replace(/\s+/g, '-')}-${slugDate()}.md`);
}

export function downloadText(content: string, title: string) {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  downloadBlob(blob, `india-pulse-${title.toLowerCase().replace(/\s+/g, '-')}-${slugDate()}.txt`);
}

// ── CSV export ───────────────────────────────────────────────────────────────

function escapeCsvCell(value: string | number | undefined | null): string {
  const str = String(value ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function downloadArticlesCsv(articles: NewsArticle[], title = 'articles') {
  const headers = ['Title', 'Source', 'Category', 'State', 'Sentiment', 'Published At', 'URL'];
  const rows = articles.map((a) => [
    escapeCsvCell(a.title),
    escapeCsvCell(a.source?.name),
    escapeCsvCell(a.category),
    escapeCsvCell(a.state ?? ''),
    escapeCsvCell(a.sentiment),
    escapeCsvCell(new Date(a.publishedAt).toLocaleString('en-IN')),
    escapeCsvCell(a.url ?? ''),
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, `india-pulse-${title}-${slugDate()}.csv`);
}

// ── JSON export ──────────────────────────────────────────────────────────────

export function downloadJson(data: object, title = 'report') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `india-pulse-${title}-${slugDate()}.json`);
}

// ── Print-to-PDF ─────────────────────────────────────────────────────────────
// Uses the browser's native print dialog (Ctrl+P → Save as PDF)
// This works universally without any library and produces high-quality output.

export function printReportAsPdf(reportTitle: string, markdownHtml: string) {
  const win = window.open('', '_blank');
  if (!win) return;

  win.document.write(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${reportTitle} — India Pulse AI</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      font-size: 14px;
      line-height: 1.7;
      color: #1e293b;
      max-width: 800px;
      margin: 0 auto;
      padding: 40px 32px;
      background: #fff;
    }
    /* Header */
    .report-header {
      border-bottom: 3px solid #fb923c;
      padding-bottom: 16px;
      margin-bottom: 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand {
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #fb923c;
    }
    .report-date {
      font-size: 11px;
      color: #94a3b8;
    }
    /* Typography */
    h1 { font-size: 26px; font-weight: 800; color: #0f172a; margin: 20px 0 12px; line-height: 1.2; }
    h2 { font-size: 18px; font-weight: 700; color: #1e293b; margin: 28px 0 10px; padding-bottom: 4px; border-bottom: 1px solid #e2e8f0; }
    h3 { font-size: 14px; font-weight: 700; color: #334155; margin: 16px 0 6px; }
    p  { margin-bottom: 10px; color: #334155; }
    ul, ol { margin: 8px 0 12px 20px; }
    li { margin-bottom: 5px; color: #334155; }
    strong { color: #0f172a; font-weight: 700; }
    em { color: #64748b; }
    blockquote {
      margin: 12px 0;
      padding: 10px 16px;
      border-left: 4px solid #fb923c;
      background: #fff7ed;
      color: #92400e;
      border-radius: 0 8px 8px 0;
    }
    code {
      background: #f1f5f9;
      padding: 1px 6px;
      border-radius: 4px;
      font-family: monospace;
      font-size: 12px;
    }
    pre {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      overflow: auto;
      margin: 12px 0;
    }
    /* Footer */
    .report-footer {
      margin-top: 48px;
      padding-top: 16px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #94a3b8;
    }
    @media print {
      body { padding: 20px 16px; }
      h2 { page-break-after: avoid; }
    }
  </style>
</head>
<body>
  <div class="report-header">
    <span class="brand">🇮🇳 India Pulse AI</span>
    <span class="report-date">Generated: ${new Date().toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })}</span>
  </div>
  ${markdownHtml}
  <div class="report-footer">
    <span>India Pulse AI — Powered by AI News Intelligence</span>
    <span>${reportTitle}</span>
  </div>
</body>
</html>`);

  win.document.close();
  setTimeout(() => {
    win.print();
    win.close();
  }, 500);
}

// ── Markdown → simple HTML converter for print ────────────────────────────────

export function markdownToHtml(md: string): string {
  return md
    // Headings
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    // Bold + italic
    .replace(/\*\*\*(.+?)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Inline code
    .replace(/`(.+?)`/g, '<code>$1</code>')
    // Blockquote
    .replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
    // Unordered lists
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/^• (.+)$/gm, '<li>$1</li>')
    // Ordered lists
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Wrap consecutive <li> in <ul>
    .replace(/(<li>.*<\/li>(\n<li>.*<\/li>)*)/g, '<ul>$1</ul>')
    // Horizontal rule
    .replace(/^---$/gm, '<hr />')
    // Paragraphs
    .split('\n\n')
    .map((block) => {
      const trimmed = block.trim();
      if (!trimmed) return '';
      if (trimmed.startsWith('<h') || trimmed.startsWith('<ul') || trimmed.startsWith('<blockquote') || trimmed.startsWith('<hr')) return trimmed;
      return `<p>${trimmed.replace(/\n/g, '<br />')}</p>`;
    })
    .join('\n');
}
