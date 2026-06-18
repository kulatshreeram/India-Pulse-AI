import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const backendUrl = 'http://127.0.0.1:8000/api/chat';

  try {
    const body = await request.json();
    const res = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
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
    console.error('Error proxying chat to backend:', error);
    return NextResponse.json(
      { error: `Failed to connect to backend: ${error.message}` },
      { status: 500 }
    );
  }
}
