# saas-starter

A multi-tenant SaaS skeleton built with the Next.js App Router. It covers the
plumbing most SaaS apps need on day one: authentication, organizations, role
based access control, plan limits and Stripe subscriptions with a webhook that
doesn't double-apply events.

Stack: Next.js 15, React 19 (server actions), Prisma + PostgreSQL, Tailwind,
TypeScript.

## What's included

- Tenancy: `User` ↔ `Membership` ↔ `Organization`. Every tenant-scoped page goes
  through `getOrgContext(slug)`, which checks the user actually belongs to the org.
- RBAC: `OWNER / ADMIN / MEMBER` mapped to permissions in `src/lib/rbac.ts`.
- Plans with seat/project limits enforced server-side (`src/lib/plans.ts`).
- Stripe checkout, customer portal and a webhook that records each event id
  before processing.
- Email/password auth with bcrypt and a signed JWT session cookie (jose).

## Getting started

```bash
cp .env.example .env          # set DATABASE_URL and AUTH_SECRET
docker compose up -d db       # or your own Postgres
npm install
npx prisma migrate dev
npm run db:seed               # demo org + owner@example.com / password123
npm run dev
```

## Stripe

Create two recurring prices and put their ids in `STRIPE_PRICE_PRO` /
`STRIPE_PRICE_SCALE`. Forward events while developing:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

The webhook stores every event id in `ProcessedWebhook` before acting, so a
re-delivered event is acknowledged without repeating side effects.

## Layout

```
src/
  app/
    page.tsx                marketing + pricing
    (auth)/                 login / register
    dashboard/[slug]/       overview, members, billing (tenant scoped)
    actions/                server actions (auth, org, billing)
    api/stripe/webhook/     stripe webhook
  lib/
    rbac.ts plans.ts billing.ts slug.ts   business logic (unit tested)
    auth.ts tenant.ts session.ts          auth + tenancy
    db.ts stripe.ts env.ts                infra
```

## Scripts

```bash
npm run dev
npm run build        # prisma generate + next build
npm test             # rbac, plans, billing, slug
npm run typecheck
npm run prisma:migrate
npm run db:seed
```

Secrets are read lazily, so `next build` runs without real credentials.

## License

MIT
