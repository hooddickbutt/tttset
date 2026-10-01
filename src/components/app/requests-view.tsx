"use client";

import { useQuery } from "@tanstack/react-query";
import { useWalletSession } from "@/components/app/use-session";
import { Button } from "@/components/ui/button";
import { formatWhen } from "@/lib/format";

type Row = {
  id: string;
  amount: string;
  assetSymbol: string;
  status: "open" | "paid" | "expired";
  createdAt: string;
  kind: string;
};

export function RequestsView() {
  const session = useWalletSession();
  const requests = useQuery({
    queryKey: ["requests", session.address],
    enabled: session.matches,
    queryFn: async () => {
      const response = await fetch("/api/requests");
      const body = (await response.json()) as { requests?: Row[]; error?: string };
      if (!response.ok) throw new Error(body.error || "Could not load requests.");
      return body.requests || [];
    },
  });
  const rows = requests.data ?? [];
  const error = requests.error instanceof Error ? requests.error.message : null;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-5xl tracking-tight">Requests</h1>
      {!session.isConnected ? (
        <p className="mt-6">Connect wallet to continue.</p>
      ) : !session.matches ? (
        <Button type="button" className="mt-6" onClick={() => void session.signIn()}>
          Sign in with wallet
        </Button>
      ) : requests.isPending ? (
        <p className="mt-6 text-sm text-muted">Loading requests…</p>
      ) : error ? (
        <p className="mt-6 text-sm text-bad">{error}</p>
      ) : rows.length === 0 ? (
        <p className="mt-6 text-sm text-muted">You have not created a payment request yet.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {rows.map((row) => (
            <li key={row.id} className="rounded-3xl border border-line p-4 text-sm">
              <p>{row.amount} {row.assetSymbol}</p>
              <p className="text-muted">{row.status === "paid" ? "Payment completed." : row.status === "expired" ? "Payment request expired." : "Open"} · {formatWhen(row.createdAt)}</p>
              <a className="text-accent" href={`/request/${row.id}`}>Payment link</a>
            </li>
          ))}
        </ul>
      )}
      {error ? <p className="mt-4 text-sm text-bad">{error}</p> : null}
    </div>
  );
}
