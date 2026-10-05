import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';
import { supabase } from '@/lib/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, whatsapp, age, gender, height, weight, place, healthIssues, password } = body;

    if (!name || !phone || !age || !gender || !height || !weight || !place || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'User with this phone number already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        name,
        phone,
        whatsapp,
        age: Number(age),
        gender,
        height: Number(height),
        weight: Number(weight),
        place,
        healthissues: healthIssues,
        password: hashedPassword,
      })
      .select()
      .single();

    if (error || !user) {
      console.error('Supabase insert error:', error);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    const token = await signToken({ userId: user.id, phone: user.phone });
    const cookieStore = await cookies();
    cookieStore.set('zealth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    return NextResponse.json({ message: 'User registered successfully', userId: user.id }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
