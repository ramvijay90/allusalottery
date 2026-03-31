import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export async function GET(request: NextRequest) {
  const secret = request.nextUrl.searchParams.get('secret');
  const path = request.nextUrl.searchParams.get('path');
  const tag = request.nextUrl.searchParams.get('tag');

  if (secret !== process.env.REVALIDATE_SECRET) {
    return NextResponse.json({ message: 'Invalid or missing secret' }, { status: 401 });
  }

  if (!path && !tag) {
    return NextResponse.json(
      { message: 'Missing path or tag parameter value' },
      { status: 400 }
    );
  }

  try {
    if (path) {
      revalidatePath(path);
      return NextResponse.json({ revalidated: true, type: 'path', path, now: Date.now() });
    } else if (tag) {
      // @ts-ignore - Next.js 16 strict types incorrectly require a 2nd profile parameter
      revalidateTag(tag);
      return NextResponse.json({ revalidated: true, type: 'tag', tag, now: Date.now() });
    }
  } catch (err) {
    return NextResponse.json({ message: 'Error revalidating', error: String(err) }, { status: 500 });
  }

  return NextResponse.json({ message: 'No action taken' });
}
