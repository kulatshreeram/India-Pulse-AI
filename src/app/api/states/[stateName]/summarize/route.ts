import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ stateName: string }> }
) {
  const { stateName } = await params;
  const decodedStateName = decodeURIComponent(stateName);
  const backendUrl = `http://127.0.0.1:8000/api/states/${encodeURIComponent(decodedStateName)}/summarize`;

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
    console.error(`Error proxying summarize to backend for state ${decodedStateName}:`, error);
    return NextResponse.json(
      { error: `Failed to connect to backend: ${error.message}` },
      { status: 500 }
    );
  }
}
