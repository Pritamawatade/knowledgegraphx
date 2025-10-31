"use client";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  return (
    <header className="w-full border-b">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold">PDF Chat</Link>
        <nav className="flex items-center gap-3">
          <Link href="/upload" className="text-sm">Upload</Link>
          <SignedOut>
            <SignInButton mode="modal">
              <button className="text-sm px-3 py-1.5 rounded border">Sign in</button>
            </SignInButton>
          </SignedOut>
          <SignedIn>
            <UserButton appearance={{ elements: { avatarBox: { width: 32, height: 32 } } }} afterSignOutUrl="/" />
          </SignedIn>
        </nav>
      </div>
    </header>
  );
}
