// app/api/ingest/route.js
import { supabaseServer } from '@/lib/supabaseServer'; // your service client
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
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

  // 4. load document via LangChain loader
  const loader = new PDFLoader(localFileName);
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
  const enrichedDocs = docs.map((d) => {
    const pageNumber = d.metadata?.page || d.metadata?.pageNumber || d.metadata?.loc?.pageNumber;
    return {
      pageContent: d.pageContent,
      metadata: {
        ...d.metadata,
        fileName: meta.file_name,
        path: meta.path,
        userId: meta.user_id,
        pageNumber: pageNumber ?? null,
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
