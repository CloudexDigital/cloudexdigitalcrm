import { NextResponse } from 'next/server';
import { getDb }       from '../../../lib/mongodb';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get('folder');
    if (!folder) {
      return NextResponse.json({ error: 'Missing folder param' }, { status:400 });
    }

    const db = await getDb();
    const leads = await db
      .collection('leads')
      .find({ folder })
      .sort({ savedAt: -1 })
      .toArray();

    return NextResponse.json({ leads });
  } catch (err) {
    console.error('/api/leads error:', err);
    return NextResponse.json({ error: err.message }, { status:500 });
  }
}
