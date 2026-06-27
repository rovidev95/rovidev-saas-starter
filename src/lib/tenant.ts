import { notFound, redirect } from "next/navigation";
import { prisma } from "./db";
import { getSessionUserId } from "./session";

/**
 * Resolve the current user's membership in an organization by slug.
 * This is the tenant boundary: every tenant-scoped page should go through here
 * so a user can never read another organization's data.
 */
export async function getOrgContext(slug: string) {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const membership = await prisma.membership.findFirst({
    where: { userId, organization: { slug } },
    include: { organization: { include: { subscription: true } } },
  });

  if (!membership) notFound();
  return {
    userId,
    role: membership.role,
    organization: membership.organization,
    subscription: membership.organization.subscription,
  };
}

export type OrgContext = Awaited<ReturnType<typeof getOrgContext>>;
