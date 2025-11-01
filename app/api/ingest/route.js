// app/api/ingest/route.js
import { supabaseServer } from '@/lib/supabaseServer'; // your service client
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';

export async function POST(request) {
  const { metadataId } = await request.json();
  
  // 1. get metadata about the file
  const { data: meta, error: metaErr } = await supabaseServer
    .from('documents_metadata')
    .select('*')
    .eq('id', metadataId)
    .single();
  if (metaErr || !meta) {
    return new Response(JSON.stringify({ error: 'Metadata not found' }), { status: 404 });
  }

  const bucketName = 'documents';  // your storage bucket
  const filePath = meta.path;      // e.g., "user_34n.../1761889030394-nodejs.pdf"

  // 2. download file from Supabase
  const { data: fileBlob, error: downloadErr } = await supabaseServer
    .storage
    .from(bucketName)
    .download(filePath);
  if (downloadErr || !fileBlob) {
    return new Response(JSON.stringify({ error: 'Download failed', details: downloadErr }), { status: 500 });
  }

  // 3. write to local temp file (ensure no nested dirs from userId in file_name)
  const tmpRoot = os.tmpdir();
  const tmpDir = await fs.mkdtemp(path.join(tmpRoot, 'ingest-'));
  const safeBaseName = path.basename(meta.file_name);
  const localFileName = path.join(tmpDir, safeBaseName);
  const arrayBuffer = await fileBlob.arrayBuffer();
  await fs.writeFile(localFileName, Buffer.from(arrayBuffer));

  // 4. load document via LangChain loader based on file type
  let loader;
  const fileExtension = path.extname(safeBaseName).toLowerCase();
  
  switch (fileExtension) {
    case '.pdf':
      loader = new PDFLoader(localFileName);
      break;
    case '.docx':
      loader = new DocxLoader(localFileName);
      break;
    case '.csv':
      loader = new CSVLoader(localFileName);
      break;
    default:
      return new Response(
        JSON.stringify({ error: 'Unsupported file type' }), 
        { status: 400 }
      );
  }
  
  const docs = await loader.load();

  // 5. setup embeddings + vector store
  const embeddings = new OpenAIEmbeddings({ model: 'text-embedding-3-small' });
  const qdrantUrl = process.env.QDRANT_URL;
  // Use per-user collection to isolate vectors
  const collectionName = meta.user_id;
  const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
    url: qdrantUrl,
    collectionName,
  });

  // 6. enrich metadata and add documents (chunks) to vector store
  const enrichedDocs = docs.map((d, index) => {
    // Handle different metadata structures for different file types
    let pageNumber = null;
    let source = meta.file_name;
    
    if (fileExtension === '.pdf') {
      pageNumber = d.metadata?.page || d.metadata?.pageNumber || d.metadata?.loc?.pageNumber;
    } else if (fileExtension === '.csv') {
      // For CSV, use row number as "page"
      pageNumber = d.metadata?.row || index + 1;
      source = `${meta.file_name} (Row ${pageNumber})`;
    } else if (fileExtension === '.docx') {
      // For DOCX, we can use section or paragraph numbers
      pageNumber = d.metadata?.section || index + 1;
    }
    
    return {
      pageContent: d.pageContent,
      metadata: {
        ...d.metadata,
        fileName: meta.file_name,
        path: meta.path,
        userId: meta.user_id,
        pageNumber: pageNumber,
        fileType: fileExtension,
        source: source,
      },
    };
  });

  await vectorStore.addDocuments(enrichedDocs);

  // best-effort cleanup of temp file
  try {
    await fs.unlink(localFileName);
  } catch {}

  console.log("indexing done");
  return new Response(
    JSON.stringify({ success: true, documentsCount: enrichedDocs.length }),
    { status: 200 }
  );
}
