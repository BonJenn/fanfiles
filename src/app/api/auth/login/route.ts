import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ApiError } from '@/types/error';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return NextResponse.json({ success: true, session: data.session });
  } catch (error: ApiError) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: error.message || 'Authentication failed' },
      { status: error.status || 500 }
    );
  }
}