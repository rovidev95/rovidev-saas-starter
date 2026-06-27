import { getOrgContext } from "@/lib/tenant";
import { can } from "@/lib/rbac";
import { PLANS } from "@/lib/plans";
import { grantsAccess } from "@/lib/billing";
import { TenantNav } from "@/components/TenantNav";
import { createCheckoutAction, createPortalAction } from "@/app/actions/billing";

export const dynamic = "force-dynamic";

export default async function BillingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const ctx = await getOrgContext(slug);
  const sub = ctx.subscription;
  const plan = sub?.plan ?? "FREE";
  const canManage = can(ctx.role, "billing:manage");
  const hasCustomer = Boolean(sub?.stripeCustomerId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{ctx.organization.name}</h1>
        <TenantNav slug={slug} />
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Current plan: {PLANS[plan].label}</h2>
            <p className="text-sm text-slate-500">
              Status:{" "}
              <span className="font-medium">
                {sub?.status ?? "ACTIVE"}
              </span>{" "}
              {sub && !grantsAccess(sub.status) ? (
                <span className="text-red-600">(payment required)</span>
              ) : null}
            </p>
          </div>
          {canManage && hasCustomer ? (
            <form action={createPortalAction.bind(null, slug)}>
              <button className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100">
                Manage in Stripe
              </button>
            </form>
          ) : null}
        </div>
      </section>

      {canManage ? (
        <section className="grid gap-4 sm:grid-cols-2">
          {(["PRO", "SCALE"] as const).map((tier) => (
            <div
              key={tier}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold">{PLANS[tier].label}</h3>
              <p className="mt-1 text-2xl font-bold">
                {PLANS[tier].priceMonthly}€
                <span className="text-base font-normal text-slate-500">/mo</span>
              </p>
              <ul className="mt-4 space-y-1 text-sm text-slate-600">
                {PLANS[tier].features.map((f) => (
                  <li key={f}>• {f}</li>
                ))}
              </ul>
              <form action={createCheckoutAction.bind(null, slug, tier)}>
                <button
                  disabled={plan === tier}
                  className="mt-6 w-full rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
                >
                  {plan === tier ? "Current plan" : `Upgrade to ${PLANS[tier].label}`}
                </button>
              </form>
            </div>
          ))}
        </section>
      ) : (
        <p className="text-sm text-slate-500">
          Only owners can manage billing.
        </p>
      )}
    </div>
  );
}
