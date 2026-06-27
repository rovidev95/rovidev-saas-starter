import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RoviDev SaaS Starter",
  description:
    "Multi-tenant SaaS starter with organizations, RBAC and Stripe billing. Built by RoviDev.",
  metadataBase: new URL("https://rovidev.com"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
