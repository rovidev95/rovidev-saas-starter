"use server";

import { randomBytes } from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getSessionUserId } from "@/lib/session";
import { getOrgContext } from "@/lib/tenant";
import { assertCan } from "@/lib/rbac";
import { isWithinLimit } from "@/lib/plans";
import { slugify, withSuffix } from "@/lib/slug";

const orgSchema = z.object({ name: z.string().min(2).max(80) });

export async function createOrgAction(
  _prev: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const userId = await getSessionUserId();
  if (!userId) redirect("/login");

  const parsed = orgSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: "Organization name is too short" };

  const base = slugify(parsed.data.name);
  let slug = base || "org";
  // Ensure unique slug.
  if (await prisma.organization.findUnique({ where: { slug } })) {
    slug = withSuffix(base, randomBytes(3).toString("hex"));
  }

  await prisma.organization.create({
    data: {
      name: parsed.data.name,
      slug,
      memberships: { create: { userId, role: "OWNER" } },
      subscription: { create: { plan: "FREE", status: "ACTIVE" } },
    },
  });

  redirect(`/dashboard/${slug}`);
}

const projectSchema = z.object({ name: z.string().min(1).max(80) });

export async function createProjectAction(
  slug: string,
  _prev: { error?: string },
  formData: FormData,
): Promise<{ error?: string }> {
  const ctx = await getOrgContext(slug);
  assertCan(ctx.role, "projects:create");

  const parsed = projectSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) return { error: "Project name is required" };

  const count = await prisma.project.count({
    where: { organizationId: ctx.organization.id },
  });
  const plan = ctx.subscription?.plan ?? "FREE";
  if (!isWithinLimit(plan, "projects", count)) {
    return {
      error: `Project limit reached for the ${plan} plan. Upgrade to add more.`,
    };
  }

  await prisma.project.create({
    data: { name: parsed.data.name, organizationId: ctx.organization.id },
  });
  revalidatePath(`/dashboard/${slug}`);
  return {};
}

export async function deleteProjectAction(
  slug: string,
  projectId: string,
): Promise<void> {
  const ctx = await getOrgContext(slug);
  assertCan(ctx.role, "projects:delete");
  await prisma.project.deleteMany({
    where: { id: projectId, organizationId: ctx.organization.id },
  });
  revalidatePath(`/dashboard/${slug}`);
}
