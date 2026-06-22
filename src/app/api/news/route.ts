import { NextResponse } from 'next/server';
import { MOCK_ARTICLES } from '@/lib/mock-data';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const backendUrl = `http://127.0.0.1:8000/api/news?${searchParams.toString()}`;

  try {
    const res = await fetch(backendUrl, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 15 }, // Next.js cache: 15s
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: `Backend returned error: ${errorText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30',
      },
    });
  } catch (error: any) {
    console.error('Error proxying to news backend:', error);
    // Graceful fallback: return mock data so the UI stays functional
    const mockResponse = {
      articles: MOCK_ARTICLES,
      total: MOCK_ARTICLES.length,
      totalResults: MOCK_ARTICLES.length,
      page: 1,
      limit: 50,
    };
    return NextResponse.json(mockResponse, {
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}


export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const backendUrl = `http://127.0.0.1:8000/api/news/refresh?${searchParams.toString()}`;

  try {
    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json(
        { error: `Backend returned error: ${errorText}` },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error proxying refresh to news backend:', error);
    return NextResponse.json(
      { error: `Failed to connect to backend: ${error.message}` },
      { status: 500 }
    );
  }
}
