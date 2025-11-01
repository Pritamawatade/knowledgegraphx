import { auth } from '@clerk/nextjs/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.formData();
  const file = body.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  // Validate file type
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'text/csv',
    'application/csv'
  ];
  
  if (!allowedTypes.includes(file.type)) {
    return NextResponse.json({ 
      error: 'Unsupported file type. Please upload PDF, DOCX, or CSV files only.' 
    }, { status: 400 });
  }

  const fileName = `${userId}/${Date.now()}-${file.name}`;

  const { data: uploadData, error: uploadError } = await supabaseServer.storage
    .from('documents')
    .upload(fileName, file, { upsert: false });

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }

  // Insert metadata record
  const { data: metaInsert, error: metaError } = await supabaseServer
    .from('documents_metadata')
    .insert([
      {
        user_id: userId,
        file_name: fileName,
        path: uploadData.path,
        uploaded_at: new Date()
      }
    ])
    .select('id')
    .single();

  if (metaError) {
    console.error('Error inserting metadata:', metaError);
    // You might choose to continue anyway
  }

  const metadataId = metaInsert?.id;

  return NextResponse.json({ path: uploadData.path, fileName, metadataId });
}
