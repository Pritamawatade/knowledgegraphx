import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseServer } from '@/lib/supabaseServer';

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { title } = await req.json();

        const { data, error } = await supabaseServer
            .from('chats')
            .insert({
                user_id: userId,
                title: title || 'New Chat',
            })
            .select()
            .single();

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error creating chat:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { data, error } = await supabaseServer
            .from('chats')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching chats:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
