import { auth } from '@clerk/nextjs/server';
import { supabaseServer } from '@/lib/supabaseServer';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { MessageSquare, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ClientChat from '@/components/ClientChat';

type PageProps = {
  params: { id: string };
};

export default async function ChatByIdPage({ params }: PageProps) {
  const { userId } = await auth();
  if (!userId) redirect('/query');

  const { data, error } = await supabaseServer
    .from('query_history')
    .select('id, question, answer, user_id, created_at')
    .eq('id', params.id)
    .single();

  if (error || !data || data.user_id !== userId) {
    notFound();
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-3xl mx-auto px-4">
      <div className="py-4 sticky top-0 bg-white/70 dark:bg-neutral-950/70 backdrop-blur z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-semibold">Continue chat</h1>
          </div>
          <Link href="/history">
            <Button variant="ghost" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" /> Back to history
            </Button>
          </Link>
        </div>
      </div>

      <ClientChat initialQuestion={data.question} initialAnswer={data.answer} />
    </div>
  );
}

