import Link from "next/link";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <div className="flex flex-col items-center text-center gap-6 py-10">
      <h1 className="text-4xl font-bold">Chat with your PDFs</h1>
      <p className="text-muted-foreground max-w-2xl">
        Upload your PDF documents and ask questions about their content. We use
        embeddings to enable fast, accurate answers.
      </p>
      <div className="flex items-center gap-3">
        <SignedOut>
          <SignInButton mode="modal">
            <button className="px-4 py-2 rounded bg-black text-white">Get started</button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <Link href="/upload" className="px-4 py-2 rounded bg-black text-white">Go to Uploads</Link>
          <Link href="/secure" className="px-4 py-2 rounded border">Test Secure API</Link>
        </SignedIn>
      </div>
    </div>
  );
}
