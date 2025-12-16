import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabaseServer } from '@/lib/supabaseServer';


export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, email, avatar_url } = body;

    // Upsert user data
    const { data, error } = await supabaseServer
      .from('users')
      .upsert(
        {
          userid: userId,
          name: name || null,
          email: email || null,
          avatar_url: avatar_url || null,
        },
        {
          onConflict: 'userid',
          ignoreDuplicates: false,
        }
      )
      .select()
      .single();

    if (error) {
      console.error('Error upserting user:', error);
      return NextResponse.json(
        { error: 'Failed to save user', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });

  } catch (err: any) {
    console.error('User route error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error', details: err.message },
      { status: 500 }
    );
  }
}

