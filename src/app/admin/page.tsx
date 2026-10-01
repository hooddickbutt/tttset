import type { Metadata } from "next";
import Link from "next/link";
import { AdminView } from "@/components/admin-view";
import { Logo } from "@/components/brand/logo";
import { adminConfigured } from "@/lib/session";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default function AdminPage() {
  if (!adminConfigured()) {
    return (
      <main className="mx-auto min-h-screen max-w-5xl px-5 py-8">
        <div className="flex items-center justify-between">
          <Link href="/" aria-label="Keel home">
            <Logo />
          </Link>
          <Link href="/app" className="text-sm text-muted">
            App
          </Link>
        </div>
        <h1 className="mt-8 font-serif text-5xl tracking-tight">Admin</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Counts are records in this deployment. They are not network-wide users, volume, or revenue.
        </p>
        <p className="mt-8 rounded-3xl border border-line p-6 text-sm leading-6">
          Admin authentication is not configured. Set ADMIN_SECRET on the server. There is no default password.
        </p>
      </main>
    );
  }
  return <AdminView />;
}
