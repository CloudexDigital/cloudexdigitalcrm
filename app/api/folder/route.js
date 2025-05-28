// File: app/api/folders/route.js
import { NextResponse }         from 'next/server';
import { getDb }               from '../../../lib/mongodb';
import { currentUser }         from '@clerk/nextjs/server';

export async function GET() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = await getDb();
  // only folders for this user
  const folders = await db
    .collection('leads')
    .distinct('folder', { userId: user.id });

  return NextResponse.json({ folders });
}
