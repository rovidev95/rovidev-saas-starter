import Link from "next/link";

export function TenantNav({ slug }: { slug: string }) {
  const tabs = [
    { href: `/dashboard/${slug}`, label: "Overview" },
    { href: `/dashboard/${slug}/members`, label: "Members" },
    { href: `/dashboard/${slug}/billing`, label: "Billing" },
  ];
  return (
    <nav className="flex gap-1 border-b border-slate-200">
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className="border-b-2 border-transparent px-4 py-2 text-sm font-medium text-slate-600 hover:border-brand-400 hover:text-slate-900"
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
