import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Simple, Transparent Pricing</h1>
        <p className="mt-4 text-lg text-slate-400">
          Start with 5 free reports. Subscribe when you need more.
        </p>
      </div>

      <div className="mt-12 grid gap-8 sm:grid-cols-3">
        {/* Free */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8">
          <h2 className="text-lg font-bold text-white">Starter</h2>
          <p className="mt-1 text-sm text-slate-400">For individual investors</p>
          <div className="mt-6">
            <span className="text-4xl font-extrabold text-white">₹0</span>
            <span className="text-slate-500"> / month</span>
          </div>
          <ul className="mt-6 space-y-3 text-sm text-slate-400">
            <li className="flex items-center gap-2">
              <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7"/></svg>
              5 free reports
            </li>
            <li className="flex items-center gap-2">
              <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7"/></svg>
              Full research packs
            </li>
            <li className="flex items-center gap-2">
              <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7"/></svg>
              Watchlist
            </li>
            <li className="flex items-center gap-2 text-slate-600">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7"/></svg>
              Priority queue
            </li>
          </ul>
          <Link href="/login" className="mt-8 flex w-full justify-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white">
            Get Started
          </Link>
        </div>

        {/* Pro */}
        <div className="relative rounded-xl border border-cyan-500/30 bg-slate-900 p-8 shadow-lg shadow-cyan-500/5">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-cyan-500 px-3 py-0.5 text-xs font-bold text-white">
            Popular
          </div>
          <h2 className="text-lg font-bold text-white">Pro</h2>
          <p className="mt-1 text-sm text-slate-400">For active traders</p>
          <div className="mt-6">
            <span className="text-4xl font-extrabold text-white">₹999</span>
            <span className="text-slate-500"> / month</span>
          </div>
          <ul className="mt-6 space-y-3 text-sm text-slate-400">
            <li className="flex items-center gap-2">
              <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7"/></svg>
              25 reports / month
            </li>
            <li className="flex items-center gap-2">
              <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7"/></svg>
              Priority processing
            </li>
            <li className="flex items-center gap-2">
              <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7"/></svg>
              PPTX export
            </li>
            <li className="flex items-center gap-2">
              <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7"/></svg>
              Email notifications
            </li>
          </ul>
          <Link href="/login" className="mt-8 flex w-full justify-center rounded-lg bg-cyan-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-400">
            Subscribe
          </Link>
        </div>

        {/* Enterprise */}
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8">
          <h2 className="text-lg font-bold text-white">Enterprise</h2>
          <p className="mt-1 text-sm text-slate-400">For institutions</p>
          <div className="mt-6">
            <span className="text-4xl font-extrabold text-white">Custom</span>
          </div>
          <ul className="mt-6 space-y-3 text-sm text-slate-400">
            <li className="flex items-center gap-2">
              <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7"/></svg>
              Unlimited reports
            </li>
            <li className="flex items-center gap-2">
              <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7"/></svg>
              Dedicated queue
            </li>
            <li className="flex items-center gap-2">
              <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7"/></svg>
              Bulk generation API
            </li>
            <li className="flex items-center gap-2">
              <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M5 13l4 4L19 7"/></svg>
              Custom integrations
            </li>
          </ul>
          <Link href="mailto:kanishkchawla2@gmail.com" className="mt-8 flex w-full justify-center rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:border-slate-500 hover:text-white">
            Contact Us
          </Link>
        </div>
      </div>
    </div>
  );
}
