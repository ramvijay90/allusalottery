import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get('url');
  const filename = searchParams.get('name') || 'lottery-chart-2026.png';

  if (!targetUrl) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  try {
    const fullUrl = targetUrl.startsWith('http')
      ? targetUrl
      : new URL(targetUrl, request.nextUrl.origin).toString();

    const res = await fetch(fullUrl);
    if (!res.ok) {
      return new NextResponse('Failed to fetch image', { status: res.status });
    }

    const imageBuffer = await res.arrayBuffer();

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': res.headers.get('content-type') || 'image/png',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    });
  } catch (error: any) {
    console.error('Download proxy error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}
