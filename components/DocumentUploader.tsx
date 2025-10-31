// components/DocumentUploader.tsx
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';  // or you may call your API route
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function DocumentUploader() {
  const [uploading, setUploading] = useState(false);
  const [filePath, setFilePath] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [indexing, setIndexing] = useState(false);
  const [indexedCount, setIndexedCount] = useState<number | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || 'Upload failed');
      }
      setFilePath(json.path);

      // Trigger ingestion automatically
      if (json.metadataId) {
        try {
          setIndexing(true);
          const ingestRes = await fetch('/api/ingest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ metadataId: json.metadataId }),
          });
          const ingestJson = await ingestRes.json();
          if (!ingestRes.ok) {
            throw new Error(ingestJson.error || 'Ingestion failed');
          }
          setIndexedCount(ingestJson.documentsCount ?? null);
        } catch (e: any) {
          setError(e.message);
        } finally {
          setIndexing(false);
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input type="file" onChange={handleFileChange} disabled={uploading} />
      <Button disabled={uploading}>{uploading ? 'Uploading...' : 'Upload'}</Button>
      {error && <p className="text-red-600">{error}</p>}
      {filePath && <p>Uploaded: {filePath}</p>}
      {indexing && <p>Indexing in vector DB…</p>}
      {indexedCount !== null && <p>Indexed {indexedCount} chunks.</p>}
    </div>
  );
}

