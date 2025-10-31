import { auth } from '@clerk/nextjs/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.formData();
  const file = body.get('file') as File;
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const fileName = `${userId}/${Date.now()}-${file.name}`;

  const { data, error } = await supabaseServer.storage
    .from('documents')
    .upload(fileName, file, { upsert: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  console.log(`response data = ${JSON.stringify(data)}`)

  // Optionally insert record into your metadata table in Supabase DB
  // e.g., documents table with user id, fileName, bucket path, timestamp, etc.

  return NextResponse.json({ path: data.path, fileName });
}

