/**
 * Example: How to use the caching utilities
 * 
 * This file shows practical examples of using the cache helpers
 * in different parts of your application.
 */

// ============================================
// Example 1: Update RAG to use cached messages
// ============================================

/*
// lib/rag.ts - BEFORE
const { data: previousMessages } = await supabaseServer
  .from('messages')
  .select('role, content')
  .eq('chat_id', chatId)
  .order('created_at', { ascending: true })
  .limit(10);

// lib/rag.ts - AFTER
import { getCachedMessages } from './cache-helpers';

const previousMessages = await getCachedMessages(chatId);
*/

// ============================================
// Example 2: Update chat history API route
// ============================================

/*
// app/api/chat-history/route.ts - BEFORE
const { data, error } = await supabaseServer
  .from('query_history')
  .select('id, question, answer, created_at')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(50);

// app/api/chat-history/route.ts - AFTER
import { getCachedChatHistory } from '@/lib/cache-helpers';

const history = await getCachedChatHistory(userId);
*/

// ============================================
// Example 3: Invalidate cache after mutations
// ============================================

/*
// app/api/chat-history/[id]/route.ts - DELETE handler
import { invalidateUserCache } from '@/lib/cache-helpers';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { userId } = await auth();
  const { id } = await params;
  
  await supabaseServer
    .from('query_history')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);
  
  // Invalidate cache so next fetch gets fresh data
  await invalidateUserCache(userId, 'history');
  
  return NextResponse.json({ success: true });
}
*/

// ============================================
// Example 4: Add SWR to history page (client-side)
// ============================================

/*
// First install: bun add swr

// app/history/page.tsx - BEFORE
const [data, setData] = useState(null);
useEffect(() => {
  fetch('/api/chat-history')
    .then(r => r.json())
    .then(result => setData(result.history));
}, []);

// app/history/page.tsx - AFTER
import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then(r => r.json());

const { data, error, isLoading, mutate } = useSWR(
  '/api/chat-history',
  fetcher,
  {
    revalidateOnFocus: false,
    dedupingInterval: 10000, // 10 seconds
  }
);

// For optimistic updates on delete:
const deleteChat = async (id: string) => {
  // Update UI immediately
  mutate({ history: data?.history.filter(item => item.id !== id) }, false);
  
  // Then make API call
  await fetch(`/api/chat-history/${id}`, { method: 'DELETE' });
  
  // Revalidate to sync with server
  mutate();
};
*/

// ============================================
// Example 5: Add revalidation to static pages
// ============================================

/*
// app/about/page.tsx - Add this export
export const revalidate = 3600; // Cache for 1 hour

// app/contact/page.tsx - Add this export
export const revalidate = 3600;

// app/page.tsx - Add this export
export const revalidate = 1800; // Cache for 30 minutes
*/

export { };
