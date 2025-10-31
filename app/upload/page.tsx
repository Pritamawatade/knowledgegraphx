import { auth } from '@clerk/nextjs/server';
import DocumentUploader from '@/components/DocumentUploader';
import { FileUpload } from '@/components/ui/file-upload';

export default async function UploadPage() {
  const { userId } = await auth();
  if (!userId) {
    return <p>Please sign in to upload documents.</p>;
  }
  return (
    <div className="p-6">
      {/* <h1 className="text-2xl font-bold mb-4 text-center flex items-center justify-center">Upload Documents</h1> */}
      {/* <DocumentUploader /> */}

      <FileUpload />
    </div>
  );
}

