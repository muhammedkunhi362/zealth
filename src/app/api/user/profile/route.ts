import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, phone, whatsapp, age, gender, height, weight, place, healthIssues, role, created_at')
      .eq('id', session.userId)
      .single();
    
    if (error || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Mapping created_at to createdAt for frontend compatibility
    return NextResponse.json({ ...user, createdAt: user.created_at });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
