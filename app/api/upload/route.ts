import { auth } from '@clerk/nextjs/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.formData();
  const files = body.getAll('files') as File[];
  
  if (!files || files.length === 0) {
    return NextResponse.json({ error: 'No files provided' }, { status: 400 });
  }

  // Validate file types and sizes
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'text/csv',
    'application/csv'
  ];
  
  const maxSize = 50 * 1024 * 1024; // 50MB per file
  const maxFiles = 10; // Maximum 10 files at once

  if (files.length > maxFiles) {
    return NextResponse.json({ 
      error: `Maximum ${maxFiles} files allowed at once.` 
    }, { status: 400 });
  }

  // Validate each file
  for (const file of files) {
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Invalid file format' }, { status: 400 });
    }
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: `Unsupported file type: ${file.name}. Please upload PDF, DOCX, or CSV files only.` 
      }, { status: 400 });
    }

    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File ${file.name} is too large. Maximum size is 50MB.` 
      }, { status: 400 });
    }
  }

  const uploadResults = [];
  const errors = [];

  // Process each file
  for (const file of files) {
    try {
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}-${file.name}`;

      const { data: uploadData, error: uploadError } = await supabaseServer.storage
        .from('documents')
        .upload(fileName, file, { upsert: false });

      if (uploadError) {
        errors.push(`Failed to upload ${file.name}: ${uploadError.message}`);
        continue;
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
        console.error('Error inserting metadata for', file.name, ':', metaError);
        errors.push(`Failed to save metadata for ${file.name}`);
        continue;
      }

      uploadResults.push({
        originalName: file.name,
        path: uploadData.path,
        fileName: fileName,
        metadataId: metaInsert?.id,
        size: file.size,
        type: file.type
      });

    } catch (error: any) {
      errors.push(`Error processing ${file.name}: ${error.message}`);
    }
  }

  // Return results
  if (uploadResults.length === 0) {
    return NextResponse.json({ 
      error: 'All uploads failed', 
      details: errors 
    }, { status: 500 });
  }

  return NextResponse.json({ 
    success: true,
    uploadedFiles: uploadResults,
    totalUploaded: uploadResults.length,
    totalRequested: files.length,
    errors: errors.length > 0 ? errors : undefined
  });
}
