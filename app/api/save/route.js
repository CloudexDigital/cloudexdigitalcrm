import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

// Make sure the directory exists
const DATA_DIR = path.join(process.cwd(), 'public', 'data');

async function ensureDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

export async function POST(request) {
  try {
    const results = await request.json();       // expect an array of objects
    await ensureDir();

    // generate a timestamped filename
    const now      = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `leads-${now}.json`;
    const filepath = path.join(DATA_DIR, filename);

    // write JSON to disk
    await fs.writeFile(filepath, JSON.stringify(results, null, 2), 'utf8');

    // Return the public URL
    const url = `/data/${filename}`;
    return NextResponse.json({ url }, { status: 201 });
  } catch (err) {
    console.error('🛑 /api/save error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
