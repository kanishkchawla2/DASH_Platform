'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-700/50 bg-slate-900/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-white">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-cyan-400"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>
            <span>DASH</span>
            <span className="hidden rounded border border-cyan-400/30 bg-cyan-400/10 px-1.5 text-[10px] font-semibold text-cyan-400 sm:inline">FUNDAMENTALS</span>
          </Link>
          <nav className="hidden items-center gap-1 sm:flex">
            <Link href="/dashboard" className="rounded-md px-3 py-1.5 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white">Dashboard</Link>
            <Link href="/pricing" className="rounded-md px-3 py-1.5 text-sm text-slate-300 transition hover:bg-slate-800 hover:text-white">Pricing</Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {session ? (
            <>
              <span className="hidden text-sm text-slate-400 sm:inline">{session.user.email}</span>
              <Link href="/dashboard" className="rounded-lg bg-cyan-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-cyan-400">
                Dashboard
              </Link>
              <button onClick={() => signOut()} className="text-sm text-slate-400 transition hover:text-white">
                Logout
              </button>
            </>
          ) : (
            <Link href="/login" className="rounded-lg bg-cyan-500 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-cyan-400">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
