import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const backendUrl = 'http://127.0.0.1:8000/api/analytics';

  try {
    const res = await fetch(backendUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 } // optional cache revalidation
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
    console.error('Error proxying to analytics backend:', error);
    return NextResponse.json(
      { error: `Failed to connect to backend: ${error.message}` },
      { status: 500 }
    );
  }
}
