import { auth } from '@clerk/nextjs/server';
import DocumentUploader from '@/components/DocumentUploader';

export default async function UploadPage() {
  const { userId } = await auth();
  if (!userId) {
    return <p>Please sign in to upload documents.</p>;
  }
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Upload Documents</h1>
      <DocumentUploader />
    </div>
  );
}

