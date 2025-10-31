import { auth } from '@clerk/nextjs/server';
import { supabaseServer } from '@/lib/supabaseServer';

export default async function HistoryPage() {
  const { userId } = await auth();
  if (!userId) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold">History</h1>
        <p className="mt-4">Please sign in to view your history.</p>
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
      <div className="p-8 max-w-3xl mx-auto">
        <h1 className="text-2xl font-semibold">History</h1>
        <p className="mt-4 text-red-600">Failed to load history.</p>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-3xl mx-auto space-y-4">
      <h1 className="text-3xl font-bold">Your Query History</h1>
      {!data || data.length === 0 ? (
        <p>No queries yet.</p>
      ) : (
        <ul className="space-y-4">
          {data.map((row) => (
            <li key={row.id} className="border rounded p-4">
              <div className="text-sm text-gray-500">
                {new Date(row.created_at as string).toLocaleString()}
              </div>
              <div className="font-medium mt-1">Q: {row.question}</div>
              <div className="mt-2 text-gray-800">A: {row.answer}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}


