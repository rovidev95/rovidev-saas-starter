import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { CreateOrgForm } from "@/components/CreateOrgForm";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const user = await requireUser();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Your organizations</h1>
        <p className="text-sm text-slate-500">
          Each organization is an isolated tenant with its own members, projects
          and subscription.
        </p>
      </div>

      {user.memberships.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-2">
          {user.memberships.map((m) => (
            <li key={m.id}>
              <Link
                href={`/dashboard/${m.organization.slug}`}
                className="block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand-400"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{m.organization.name}</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {m.role}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  /{m.organization.slug}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-300 p-6 text-sm text-slate-500">
          You don&apos;t belong to any organization yet. Create your first one
          below.
        </p>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">New organization</h2>
        <CreateOrgForm />
      </div>
    </div>
  );
}
