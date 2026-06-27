import Link from "next/link";
import { PLANS } from "@/lib/plans";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="text-lg font-bold tracking-tight">
          RoviDev<span className="text-brand-600">SaaS</span>
        </span>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/login" className="text-slate-600 hover:text-slate-900">
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700"
          >
            Get started
          </Link>
        </nav>
      </header>

      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="mb-4 inline-block rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
          Open-source SaaS starter
        </p>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          The multi-tenant SaaS foundation you don&apos;t have to rebuild.
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-600">
          Organizations, role-based access control, plan limits and Stripe
          subscriptions with idempotent webhooks — wired together with Next.js
          App Router and Prisma.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/register"
            className="rounded-lg bg-brand-600 px-6 py-3 font-medium text-white hover:bg-brand-700"
          >
            Create your workspace
          </Link>
          <a
            href="https://github.com/rovidev95/rovidev-saas-starter"
            className="rounded-lg border border-slate-300 px-6 py-3 font-medium text-slate-700 hover:bg-slate-100"
          >
            View on GitHub
          </a>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-24">
        <h2 className="mb-10 text-center text-2xl font-bold">Pricing</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {Object.values(PLANS).map((plan) => (
            <div
              key={plan.tier}
              className="flex flex-col rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
            >
              <h3 className="text-lg font-semibold">{plan.label}</h3>
              <p className="mt-2 text-3xl font-bold">
                {plan.priceMonthly}€
                <span className="text-base font-normal text-slate-500">/mo</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2 text-sm text-slate-600">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="text-brand-600">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className="mt-8 rounded-lg bg-slate-900 px-4 py-2 text-center text-sm font-medium text-white hover:bg-slate-700"
              >
                Start with {plan.label}
              </Link>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
        <a href="https://rovidev.com" className="font-medium text-brand-600">
          rovidev.com
        </a>
      </footer>
    </main>
  );
}
