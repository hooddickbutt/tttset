"use client";

import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { useDemoMode, useDemoTxs } from "@/components/app/demo";
import { formatWhen, shortAddress } from "@/lib/format";
import { explorerAddress, explorerTx } from "@/lib/network";

type Tx = {
  hash: string;
  from: string;
  to: string;
  amount: string;
  assetSymbol: string;
  status: string;
  createdAt: string;
  note: string | null;
};

export function ActivityView() {
  const { address, isConnected } = useAccount();
  const demo = useDemoMode();
  const demoTxs = useDemoTxs();
  const activity = useQuery({
    queryKey: ["activity", address],
    enabled: Boolean(address),
    queryFn: async () => {
      const response = await fetch(`/api/transactions?address=${address}`);
      const body = (await response.json()) as { transactions?: Tx[]; indexer?: string; error?: string };
      if (!response.ok) throw new Error(body.error || "Live data unavailable.");
      return { transactions: body.transactions || [], indexer: body.indexer || null };
    },
  });
  const rows = activity.data?.transactions;
  const note = activity.data?.indexer;
  const error = activity.error instanceof Error ? activity.error.message : null;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-5xl tracking-tight">Activity</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Confirmed means this deployment read a successful transaction on the configured network. It is not a full history of the address.
      </p>
      {!isConnected || !address ? (
        <p className="mt-8 rounded-3xl border border-line p-6">Connect wallet to view live data.</p>
      ) : activity.isPending ? (
        <p className="mt-8">Loading records…</p>
      ) : error ? (
        <p className="mt-8">{error}</p>
      ) : !rows || rows.length === 0 ? (
        <div className="mt-8 rounded-3xl border border-line bg-elev p-6">
          <p>No transfers have been recorded for this wallet yet.</p>
          <a className="mt-3 inline-block text-sm text-accent" href={explorerAddress(address)} target="_blank" rel="noreferrer">
            View public history in the explorer
          </a>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {rows.map((row) => (
            <li key={row.hash} className="rounded-3xl border border-line bg-elev p-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <span className="uppercase tracking-[0.14em] text-muted">{labelStatus(row.status)}</span>
                <span>{row.amount} {row.assetSymbol}</span>
              </div>
              <p className="mt-2 font-mono text-xs">
                {shortAddress(row.from)} → {shortAddress(row.to)}
              </p>
              <p className="mt-1 text-muted">{formatWhen(row.createdAt)}</p>
              {row.note ? <p className="mt-2">Note stored in Keel: {row.note}</p> : null}
              <a className="mt-2 inline-block text-accent" href={explorerTx(row.hash)} target="_blank" rel="noreferrer">
                Explorer
              </a>
            </li>
          ))}
        </ul>
      )}
      {note ? <p className="mt-4 text-xs leading-5 text-muted">{note}</p> : null}
      {demo ? (
        <section className="mt-10 rounded-[28px] border border-warn bg-warn/10 p-5">
          <h2 className="text-xs tracking-[0.16em] uppercase">Demo transactions</h2>
          <p className="mt-2 text-sm">These transactions are simulated and have not been broadcast to the blockchain.</p>
          {demoTxs.length === 0 ? (
            <p className="mt-3 text-sm">No simulations on this device.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {demoTxs.map((tx) => (
                <li key={tx.id} className="text-sm">
                  <p className="font-medium">Demo transaction</p>
                  <p>{tx.amount} {tx.symbol} → {shortAddress(tx.to)}</p>
                  <p className="font-mono text-xs">Simulation id {tx.id}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      ) : null}
    </div>
  );
}

function labelStatus(status: string) {
  if (status === "confirmed") return "Confirmed";
  if (status === "pending" || status === "submitted") return "Pending";
  if (status === "failed") return "Failed";
  if (status === "preparing") return "Preparing";
  return status;
}
