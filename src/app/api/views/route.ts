import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { postId, viewerId } = await request.json();
    const supabase = createRouteHandlerClient({ cookies });

    // Record the view
    const { error } = await supabase
      .from('post_views')
      .insert([
        {
          post_id: postId,
          viewer_id: viewerId,
          created_at: new Date().toISOString(),
        }
      ])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error recording view:', error);
    return NextResponse.json(
      { error: 'Failed to record view' },
      { status: 500 }
    );
  }
}