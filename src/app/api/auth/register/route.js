import { createUser, getUserByEmail } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';

export async function POST(req) {
  try {
    const { email, password, name } = await req.json();

    if (!email || !password) {
      return Response.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return Response.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existing = getUserByEmail(email);
    if (existing) {
      return Response.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const id = nanoid(16);

    createUser({
      id,
      email,
      name: name || email.split('@')[0],
      passwordHash,
    });

    return Response.json({ success: true, id });
  } catch (error) {
    console.error('Registration error:', error);
    return Response.json({ error: 'Registration failed' }, { status: 500 });
  }
}
