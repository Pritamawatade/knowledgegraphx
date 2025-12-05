import { auth } from '@clerk/nextjs/server';
import { FileUpload } from '@/components/ui/file-upload';

export default async function UploadPage() {
  const { userId } = await auth();
  if (!userId) {
    return <p>Please sign in to upload documents.</p>;
  }
  return (
    <div className="p-6">


      <FileUpload />
    </div>
  );
}

