import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("password123", 12);

  const user = await prisma.user.upsert({
    where: { email: "owner@example.com" },
    update: {},
    create: {
      email: "owner@example.com",
      name: "Demo Owner",
      passwordHash,
    },
  });

  const org = await prisma.organization.upsert({
    where: { slug: "acme" },
    update: {},
    create: {
      name: "Acme Inc.",
      slug: "acme",
      memberships: { create: { userId: user.id, role: "OWNER" } },
      subscription: { create: { plan: "PRO", status: "ACTIVE" } },
      projects: {
        create: [{ name: "Website revamp" }, { name: "Mobile app" }],
      },
    },
  });

  console.log(`Seeded user ${user.email} and org ${org.slug}`);
  console.log("Login with owner@example.com / password123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
