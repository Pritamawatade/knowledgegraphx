// app/api/ingest-batch/route.js
import { supabaseServer } from '@/lib/supabaseServer';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx';
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv';
import { OpenAIEmbeddings } from '@langchain/openai';
import { QdrantVectorStore } from '@langchain/qdrant';

export async function POST(request) {
  const { metadataIds } = await request.json();
  
  if (!metadataIds || !Array.isArray(metadataIds) || metadataIds.length === 0) {
    return new Response(JSON.stringify({ error: 'No metadata IDs provided' }), { status: 400 });
  }

  const results = [];
  const errors = [];
  let totalDocuments = 0;

  // Setup embeddings and vector store (will be reused)
  const embeddings = new OpenAIEmbeddings({ model: 'text-embedding-3-small' });
  const qdrantUrl = process.env.QDRANT_URL;

  for (const metadataId of metadataIds) {
    try {
      // 1. Get metadata about the file
      const { data: meta, error: metaErr } = await supabaseServer
        .from('documents_metadata')
        .select('*')
        .eq('id', metadataId)
        .single();

      if (metaErr || !meta) {
        errors.push(`Metadata not found for ID: ${metadataId}`);
        continue;
      }

      const bucketName = 'documents';
      const filePath = meta.path;

      // 2. Download file from Supabase
      const { data: fileBlob, error: downloadErr } = await supabaseServer
        .storage
        .from(bucketName)
        .download(filePath);

      if (downloadErr || !fileBlob) {
        errors.push(`Download failed for ${meta.file_name}: ${downloadErr?.message}`);
        continue;
      }

      // 3. Write to local temp file
      const tmpRoot = os.tmpdir();
      const tmpDir = await fs.mkdtemp(path.join(tmpRoot, 'ingest-batch-'));
      const safeBaseName = path.basename(meta.file_name);
      const localFileName = path.join(tmpDir, safeBaseName);
      const arrayBuffer = await fileBlob.arrayBuffer();
      await fs.writeFile(localFileName, Buffer.from(arrayBuffer));

      // 4. Load document via LangChain loader based on file type
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
          errors.push(`Unsupported file type for ${meta.file_name}`);
          continue;
      }
      
      const docs = await loader.load();

      // 5. Setup vector store for this user
      const collectionName = meta.user_id;
      const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
        url: qdrantUrl,
        collectionName,
      });

      // 6. Enrich metadata and add documents (chunks) to vector store
      const enrichedDocs = docs.map((d, index) => {
        let pageNumber = null;
        let source = meta.file_name;
        
        if (fileExtension === '.pdf') {
          pageNumber = d.metadata?.page || d.metadata?.pageNumber || d.metadata?.loc?.pageNumber;
        } else if (fileExtension === '.csv') {
          pageNumber = d.metadata?.row || index + 1;
          source = `${meta.file_name} (Row ${pageNumber})`;
        } else if (fileExtension === '.docx') {
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

      // Cleanup temp file
      try {
        await fs.unlink(localFileName);
        await fs.rmdir(tmpDir);
      } catch (cleanupError) {
        console.warn('Cleanup warning:', cleanupError);
      }

      results.push({
        metadataId,
        fileName: meta.file_name,
        documentsCount: enrichedDocs.length,
        success: true
      });

      totalDocuments += enrichedDocs.length;

    } catch (error) {
      console.error(`Error processing file with metadata ID ${metadataId}:`, error);
      errors.push(`Processing failed for metadata ID ${metadataId}: ${error.message}`);
    }
  }

  console.log(`Batch indexing completed. Processed ${results.length} files, ${totalDocuments} total documents`);

  return new Response(
    JSON.stringify({ 
      success: true, 
      processedFiles: results.length,
      totalFiles: metadataIds.length,
      totalDocuments,
      results,
      errors: errors.length > 0 ? errors : undefined
    }),
    { status: 200 }
  );
}