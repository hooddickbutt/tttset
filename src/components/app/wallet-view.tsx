"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useAccount } from "wagmi";
import { useAssetBalance } from "@/components/app/use-asset-balance";
import { formatAmount, shortAddress } from "@/lib/format";
import { explorerAddress, networkName, chainId } from "@/lib/network";

type TokenMeta = {
  configured?: boolean;
  readable?: boolean;
  address?: `0x${string}`;
  symbol?: string;
  decimals?: number;
  message?: string;
};

export function WalletView() {
  const { address, isConnected } = useAccount();
  const tokenQuery = useQuery({
    queryKey: ["token-meta"],
    queryFn: async () => (await fetch("/api/token")).json() as Promise<TokenMeta>,
  });
  const token = tokenQuery.data;
  const eth = useAssetBalance(address, "native");
  const tokenBalance = useAssetBalance(address, "erc20", token?.readable ? token.address : undefined);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-serif text-5xl tracking-tight">Wallet</h1>
      <p className="mt-3 text-sm leading-6 text-muted">
        {networkName()} · {chainId}. Values come from the RPC. There is no fiat total.
      </p>
      {!isConnected || !address ? (
        <p className="mt-8 rounded-3xl border border-line bg-elev p-6">Connect wallet to view live data.</p>
      ) : (
        <>
          <p className="mt-6 font-mono text-sm break-all">{address}</p>
          <a className="text-sm text-accent" href={explorerAddress(address)} target="_blank" rel="noreferrer">
            Open this address in the explorer
          </a>
          <div className="mt-6 grid gap-4">
            <AssetCard
              label="ETH"
              loading={eth.isLoading}
              error={eth.isError || !eth.data}
              value={eth.data ? `${formatAmount(eth.data.value, eth.data.decimals)} ETH` : ""}
            />
            <AssetCard
              label={token?.symbol || "Token"}
              loading={Boolean(token?.readable) && tokenBalance.isLoading}
              error={Boolean(token?.readable) && (tokenBalance.isError || !tokenBalance.data)}
              value={
                token?.readable && tokenBalance.data
                  ? `${formatAmount(tokenBalance.data.value, tokenBalance.data.decimals)} ${tokenBalance.data.symbol}`
                  : token?.message || "Token contract address will be published after deployment."
              }
              quiet={!token?.readable}
            />
          </div>
          <p className="mt-6 text-sm text-muted">
            Recent transfers recorded by this deployment are in <Link className="text-accent" href="/app/activity">Activity</Link>.
            Older history is not indexed here. {shortAddress(address)} can be inspected on the explorer.
          </p>
        </>
      )}
    </div>
  );
}

function AssetCard({
  label,
  value,
  loading,
  error,
  quiet,
}: {
  label: string;
  value: string;
  loading: boolean;
  error: boolean;
  quiet?: boolean;
}) {
  return (
    <article className="rounded-3xl border border-line bg-elev p-5">
      <p className="text-sm text-muted">{label}</p>
      <p className="mt-2 text-2xl tracking-tight">
        {loading ? "Reading balances from the network…" : quiet ? value : error ? "Live data unavailable." : value}
      </p>
    </article>
  );
}
