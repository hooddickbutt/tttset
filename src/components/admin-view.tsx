"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function AdminView() {
  const queryClient = useQueryClient();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const overview = useQuery({
    queryKey: ["admin-overview"],
    queryFn: async () => {
      const response = await fetch("/api/admin/overview");
      const body = (await response.json()) as Record<string, unknown>;
      return { status: response.status, body };
    },
  });
  const status = overview.data?.status;
  const data = status === 200 ? overview.data?.body ?? null : null;

  return (
    <main className="mx-auto min-h-screen max-w-5xl px-5 py-8">
      <div className="flex items-center justify-between">
        <Link href="/" aria-label="Keel home"><Logo /></Link>
        <Link href="/app" className="text-sm text-muted">App</Link>
      </div>
      <h1 className="mt-8 font-serif text-5xl tracking-tight">Admin</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
        Counts are records in this deployment. They are not network-wide users, volume, or revenue.
      </p>
      {overview.isPending ? <p className="mt-8">Checking admin access…</p> : null}
      {status === 503 ? (
        <p className="mt-8 rounded-3xl border border-line p-6 text-sm leading-6">
          Admin authentication is not configured. Set ADMIN_SECRET on the server. There is no default password.
        </p>
      ) : null}
      {status === 401 ? (
        <form
          className="mt-8 max-w-sm"
          onSubmit={(event) => {
            event.preventDefault();
            void fetch("/api/admin/session", {
              method: "POST",
              headers: { "content-type": "application/json" },
              body: JSON.stringify({ password }),
            }).then(async (response) => {
              if (!response.ok) {
                const body = (await response.json()) as { error?: string };
                setError(body.error || "That password was not accepted.");
                return;
              }
              setPassword("");
              setError(null);
              await queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
            });
          }}
        >
          <label className="text-sm">
            Admin password
            <Input className="mt-2" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
          </label>
          <Button type="submit" className="mt-3">Sign in</Button>
        </form>
      ) : null}
      {status === 200 && data ? (
        <Overview
          data={data}
          onSignOut={() =>
            void fetch("/api/admin/session", { method: "DELETE" }).then(() =>
              queryClient.invalidateQueries({ queryKey: ["admin-overview"] }),
            )
          }
        />
      ) : null}
      {error ? <p className="mt-4 text-sm text-bad">{error}</p> : null}
    </main>
  );
}

function Overview({ data, onSignOut }: { data: Record<string, unknown>; onSignOut: () => void }) {
  const stats = [
    ["Users", data.users],
    ["Usernames", data.usernames],
    ["Merchants", data.merchants],
    ["Payment requests", data.requests],
    ["Open requests", data.openRequests],
    ["Paid requests", data.paidRequests],
    ["Recorded transactions", data.transactions],
    ["Confirmed", data.confirmed],
    ["Pending", data.pending],
    ["Failed", data.failed],
  ];
  const chain = data.chain as { ok?: boolean; blockNumber?: string; chainId?: number; message?: string } | undefined;
  return (
    <div className="mt-8">
      <p className="text-sm text-muted">{String(data.label || "")}</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {stats.map(([label, value]) => (
          <article key={String(label)} className="rounded-3xl border border-line p-4">
            <p className="text-xs text-muted">{String(label)}</p>
            <p className="mt-2 font-serif text-3xl">{String(value)}</p>
          </article>
        ))}
      </div>
      <p className="mt-6 text-sm">
        {chain?.ok
          ? `RPC chain id ${chain.chainId}. Latest block ${chain.blockNumber}.`
          : "Live data unavailable."}
      </p>
      <p className="mt-2 text-sm text-muted">{String(data.assetEditing || "")}</p>
      <pre className="mt-4 overflow-auto rounded-3xl border border-line p-4 text-xs leading-5">
        {JSON.stringify({ token: data.token, assets: data.assets, recentErrors: data.recentErrors, recentRequests: data.recentRequests, recentTransactions: data.recentTransactions }, null, 2)}
      </pre>
      <Button type="button" variant="outline" className="mt-4" onClick={onSignOut}>Sign out</Button>
    </div>
  );
}
