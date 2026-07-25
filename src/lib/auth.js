import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { cookies } from 'next/headers';
import { nanoid } from 'nanoid';
import { getUserByEmail, getUserById } from './db';

if (process.env.NEXTAUTH_URL && !/^https?:\/\//.test(process.env.NEXTAUTH_URL)) {
  process.env.NEXTAUTH_URL = 'https://' + process.env.NEXTAUTH_URL;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;

        if (!email || !password) return null;

        const user = getUserByEmail(email);
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role;
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
});

export async function getUserId() {
  const session = await auth();
  if (session?.user?.id) {
    return { userId: session.user.id, email: session.user.email, name: session.user.name };
  }

  const cookieStore = await cookies();
  let guestId = cookieStore.get('guest_id')?.value;
  if (!guestId) {
    guestId = nanoid(16);
    cookieStore.set('guest_id', guestId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    });
  }
  return { userId: guestId, email: null, name: 'Guest' };
}
