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
    </div>
  );
}

