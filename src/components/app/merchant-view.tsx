"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useWalletSession } from "@/components/app/use-session";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { formatWhen } from "@/lib/format";
import { tokenSymbol } from "@/lib/network";

type RequestRow = {
  id: string;
  kind: string;
  amount: string;
  assetSymbol: string;
  status: "open" | "paid" | "expired";
  createdAt: string;
  paidTxHash: string | null;
  message: string | null;
};

export function MerchantView() {
  const session = useWalletSession();
  const queryClient = useQueryClient();
  const [nameDraft, setNameDraft] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [hours, setHours] = useState("72");
  const [asset, setAsset] = useState<"native" | "erc20">("native");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const merchant = useQuery({
    queryKey: ["merchant", session.address],
    enabled: session.matches,
    queryFn: async () => {
      const response = await fetch("/api/merchant");
      const body = (await response.json()) as {
        merchant?: { name: string } | null;
        requests?: RequestRow[];
        note?: string;
        error?: string;
      };
      if (!response.ok) throw new Error(body.error || "Merchant records are unavailable.");
      return body;
    },
  });
  const savedName = merchant.data?.merchant?.name ?? null;
  const requests = merchant.data?.requests ?? [];
  const note = merchant.data?.note ?? "";
  const nameValue = nameDraft ?? savedName ?? "";

  async function reload() {
    await queryClient.invalidateQueries({ queryKey: ["merchant"] });
  }

  const confirmed = requests.filter((row) => row.status === "paid");

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-5xl tracking-tight">Merchant</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        Invoices are payment requests from this wallet. Confirmed means Keel matched an onchain transfer. This is not a full accounting ledger.
      </p>
      {!session.isConnected ? (
        <p className="mt-8">Connect wallet to continue.</p>
      ) : !session.matches ? (
        <Button type="button" className="mt-6" onClick={() => void session.signIn()} disabled={session.signing}>
          {session.signing ? "Waiting for wallet" : "Sign in with wallet"}
        </Button>
      ) : (
        <>
          <form
            className="mt-6 flex flex-col gap-3 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              void fetch("/api/merchant", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ name: nameValue }),
              })
                .then(async (response) => {
                  const body = (await response.json()) as { error?: string };
                  if (!response.ok) setError(body.error || "Could not save the merchant name.");
                  else {
                    setError(null);
                    setNameDraft(null);
                    await reload();
                  }
                });
            }}
          >
            <Input value={nameValue} onChange={(event) => setNameDraft(event.target.value)} placeholder="Merchant name" />
            <Button type="submit">{savedName ? "Update name" : "Save name"}</Button>
          </form>
          <form
            className="mt-8 rounded-[28px] border border-line p-5"
            onSubmit={(event) => {
              event.preventDefault();
              void fetch("/api/requests", {
                method: "POST",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                  asset,
                  amount,
                  message,
                  expiresInHours: hours ? Number(hours) : undefined,
                  kind: "invoice",
                }),
              }).then(async (response) => {
                const body = (await response.json()) as { error?: string };
                if (!response.ok) setError(body.error || "Invoice was not created.");
                else {
                  setError(null);
                  setAmount("");
                  setMessage("");
                  await reload();
                }
              });
            }}
          >
            <h2 className="font-serif text-3xl">New invoice</h2>
            <label className="mt-4 block text-sm">Amount<Input className="mt-2" value={amount} onChange={(event) => setAmount(event.target.value)} /></label>
            <label className="mt-4 block text-sm">
              Asset
              <select className="mt-2 h-12 w-full rounded-2xl border border-line bg-bg px-4" value={asset} onChange={(event) => setAsset(event.target.value as "native" | "erc20")}>
                <option value="native">ETH</option>
                <option value="erc20">{tokenSymbol}</option>
              </select>
            </label>
            <label className="mt-4 block text-sm">Message<Textarea className="mt-2" value={message} onChange={(event) => setMessage(event.target.value)} /></label>
            <label className="mt-4 block text-sm">Expires in hours<Input className="mt-2" value={hours} onChange={(event) => setHours(event.target.value)} /></label>
            <Button type="submit" className="mt-4">Create invoice</Button>
          </form>
          <section className="mt-8">
            {requests.length === 0 ? (
              <p className="rounded-3xl border border-line p-6">Awaiting your first payment.</p>
            ) : confirmed.length === 0 ? (
              <p className="text-sm text-muted">No confirmed payments yet.</p>
            ) : (
              <p className="text-sm text-muted">
                Confirmed payments in this app’s records: {confirmed.length}. {note}
              </p>
            )}
            <ul className="mt-4 space-y-3">
              {requests.map((row) => (
                <li key={row.id} className="rounded-3xl border border-line p-4 text-sm">
                  <div className="flex justify-between gap-3">
                    <span>{row.kind === "invoice" ? "Invoice" : "Request"}</span>
                    <span>{row.status === "paid" ? "Payment completed." : row.status === "expired" ? "Payment request expired." : "Open"}</span>
                  </div>
                  <p className="mt-2">{row.amount} {row.assetSymbol}</p>
                  <p className="text-muted">{formatWhen(row.createdAt)}</p>
                  <a className="text-accent" href={`/request/${row.id}`}>Open link</a>
                </li>
              ))}
            </ul>
            <a className="mt-4 inline-block text-sm text-accent" href="/api/merchant/export">Export CSV</a>
          </section>
        </>
      )}
      {error || session.error || merchant.error instanceof Error ? (
        <p className="mt-4 text-sm text-bad">{error || session.error || (merchant.error instanceof Error ? merchant.error.message : "")}</p>
      ) : null}
    </div>
  );
}
