import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;

        // Verify ownership
        const { data: chat, error: chatError } = await supabaseServer
            .from('chats')
            .select('id')
            .eq('id', id)
            .eq('user_id', userId)
            .single();

        if (chatError || !chat) {
            return NextResponse.json({ error: 'Chat not found or unauthorized' }, { status: 404 });
        }

        const { data: messages, error: messagesError } = await supabaseServer
            .from('messages')
            .select('*')
            .eq('chat_id', id)
            .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;

        return NextResponse.json(messages);
    } catch (error: any) {
        console.error('Error fetching messages:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { id } = await params;

        const { error } = await supabaseServer
            .from('chats')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (error) throw error;

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error deleting chat:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
