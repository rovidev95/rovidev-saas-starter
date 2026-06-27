import { prisma } from "@/lib/db";
import { getOrgContext } from "@/lib/tenant";
import { can } from "@/lib/rbac";
import { PLANS, remaining } from "@/lib/plans";
import { TenantNav } from "@/components/TenantNav";
import { CreateProjectForm } from "@/components/CreateProjectForm";
import { createProjectAction, deleteProjectAction } from "@/app/actions/org";

export const dynamic = "force-dynamic";

export default async function OrgOverview({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ctx = await getOrgContext(slug);
  const plan = ctx.subscription?.plan ?? "FREE";

  const [projects, seatCount] = await Promise.all([
    prisma.project.findMany({
      where: { organizationId: ctx.organization.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.membership.count({ where: { organizationId: ctx.organization.id } }),
  ]);

  const boundCreate = createProjectAction.bind(null, slug);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{ctx.organization.name}</h1>
        <TenantNav slug={slug} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Plan" value={PLANS[plan].label} />
        <Stat
          label="Projects left"
          value={`${remaining(plan, "projects", projects.length)}`}
        />
        <Stat
          label="Seats left"
          value={`${remaining(plan, "seats", seatCount)}`}
        />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Projects</h2>

        {can(ctx.role, "projects:create") ? (
          <div className="mb-6">
            <CreateProjectForm action={boundCreate} />
          </div>
        ) : null}

        {projects.length === 0 ? (
          <p className="text-sm text-slate-500">No projects yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {projects.map((p) => (
              <li
                key={p.id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <span className="font-medium">{p.name}</span>
                {can(ctx.role, "projects:delete") ? (
                  <form action={deleteProjectAction.bind(null, slug, p.id)}>
                    <button className="text-xs text-red-600 hover:underline">
                      Delete
                    </button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}
