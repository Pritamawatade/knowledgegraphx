import { auth } from '@clerk/nextjs/server';
import { supabaseServer } from '@/lib/supabaseServer';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { MessageSquare, Clock, ArrowRight } from 'lucide-react';

export default async function HistoryPage() {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="p-8 mx-auto max-w-3xl">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">History</h1>
        </div>
        <p className="mt-3 text-muted-foreground">Please sign in to view your chat history.</p>
      </div>
    );
  }

  const { data, error } = await supabaseServer
    .from('query_history')
    .select('id, question, answer, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    return (
      <div className="p-8 mx-auto max-w-3xl">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">History</h1>
        </div>
        <div className="mt-6 rounded-lg border bg-background">
          <div className="p-6">
            <p className="text-sm text-red-600">Failed to load history.</p>
            <div className="mt-4">
              <Link href="/query">
                <Button variant="default">
                  Try asking a question
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 mx-auto max-w-4xl">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold tracking-tight">Your Chat History</h1>
        </div>
        <Link href="/query">
          <Button variant="default" size="sm">
            New chat
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      {!data || data.length === 0 ? (
        <div className="mt-8 rounded-lg border bg-background">
          <div className="p-8 text-center">
            <MessageSquare className="mx-auto h-10 w-10 text-muted-foreground" />
            <h2 className="mt-4 text-lg font-semibold">No chats yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your recent conversations will appear here.
            </p>
            <div className="mt-5">
              <Link href="/query">
                <Button>
                  Start your first chat
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {(data as Array<{ id: string; question: string; answer: string; created_at: string }>).map((row) => (
            <li key={row.id} className="group rounded-xl border bg-background transition-colors hover:bg-accent/40">
              <div className="p-5">
                <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
                  <div className="inline-flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Conversation</span>
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(row.created_at).toLocaleString()}</span>
                  </div>
                </div>

                <h3 className="mt-3 text-base font-semibold leading-6 line-clamp-2">
                  {row.question}
                </h3>

                <p className="mt-2 text-sm text-muted-foreground line-clamp-3">
                  {row.answer}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <Link href={`/query`} className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                    Open chat
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


