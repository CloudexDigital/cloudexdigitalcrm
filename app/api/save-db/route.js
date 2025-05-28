// File: app/api/save-db/route.js
import { NextResponse }        from 'next/server';
import { getDb }              from '../../../lib/mongodb';
import { currentUser }        from '@clerk/nextjs/server';

export async function POST(request) {
  // 1) Ensure we have a user
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 2) Parse payload
  const { folder, leads } = await request.json();
  if (!folder || !Array.isArray(leads) || !leads.length) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }

  // 3) Tag each document with userId
  const docs = leads.map((l) => ({
    ...l,
    folder,
    savedAt: new Date(),
    userId: user.id
  }));

  // 4) Insert
  const db = await getDb();
  const result = await db.collection('leads').insertMany(docs);

  return NextResponse.json({
    message:       `Saved ${result.insertedCount} leads in “${folder}”`,
    insertedCount: result.insertedCount
  }, { status: 201 });
}
