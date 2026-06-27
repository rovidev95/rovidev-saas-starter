import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/auth";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="font-bold">
            RoviDev<span className="text-brand-600">SaaS</span>
          </Link>
          <div className="flex items-center gap-4 text-sm">
            <span className="text-slate-500">{user.email}</span>
            <form action={logoutAction}>
              <button className="rounded-lg border border-slate-300 px-3 py-1.5 hover:bg-slate-100">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
