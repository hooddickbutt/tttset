"use client";

import Link from "next/link";
import { useAccount } from "wagmi";
import { useAssetBalance } from "@/components/app/use-asset-balance";
import { useWalletSession } from "@/components/app/use-session";
import { Button } from "@/components/ui/button";
import { formatAmount, shortAddress } from "@/lib/format";
import { networkName } from "@/lib/network";

export function Dashboard() {
  const { address, isConnected } = useAccount();
  const session = useWalletSession();
  const balance = useAssetBalance(address, "native");

  return (
    <div className="mx-auto max-w-3xl">
      <p className="text-xs tracking-[0.18em] text-muted uppercase">{networkName()}</p>
      <h1 className="mt-2 font-serif text-5xl tracking-tight">
        {session.username ? `@${session.username}` : address ? shortAddress(address) : "Your wallet"}
      </h1>
      <p className="mt-3 max-w-lg text-sm leading-6 text-muted">
        Balances are read from the configured network. Keel does not convert them to fiat, because no price source is configured.
      </p>
      <div className="mt-8 rounded-[28px] border border-line bg-elev p-6">
        <p className="text-sm text-muted">ETH balance</p>
        {!isConnected ? (
          <p className="mt-3 text-lg">Connect wallet to view live data.</p>
        ) : balance.isLoading ? (
          <p className="mt-3">Reading balances from the network…</p>
        ) : balance.isError || !balance.data ? (
          <p className="mt-3">Live data unavailable.</p>
        ) : (
          <p className="mt-3 font-serif text-5xl tracking-tight">
            {formatAmount(balance.data.value, balance.data.decimals)} <span className="text-2xl">ETH</span>
          </p>
        )}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Button asChild>
            <Link href="/app/pay">Send</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/app/receive">Receive</Link>
          </Button>
          <Button asChild variant="ghost">
            <Link href="/token">Token</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
