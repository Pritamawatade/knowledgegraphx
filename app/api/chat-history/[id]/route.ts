import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const { error } = await supabaseServer
      .from('query_history')
      .delete()
      .eq('id', id)
      .eq('user_id', userId); // Ensure user can only delete their own chats

    if (error) {
      console.error('Error deleting chat history:', error);
      return NextResponse.json({ error: 'Failed to delete chat' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (err: any) {
    console.error('Delete chat history route error:', err);
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}