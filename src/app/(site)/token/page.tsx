import type { Metadata } from "next";
import Link from "next/link";
import { AddTokenButton } from "@/components/add-token-button";
import { Button } from "@/components/ui/button";
import { formatAmount } from "@/lib/format";
import {
  chainId,
  explorerAddress,
  networkName,
  tokenAddress,
  tokenAddressInvalid,
  tokenAddressRaw,
  tokenName,
  tokenSymbol,
} from "@/lib/network";
import { readTokenContract } from "@/lib/rpc";

export const metadata: Metadata = { title: "Token" };
export const dynamic = "force-dynamic";

export default async function TokenPage() {
  const onchain = tokenAddress ? await readTokenContract(tokenAddress) : null;
  const name = onchain?.ok ? onchain.name : tokenName;
  const symbol = onchain?.ok ? onchain.symbol : tokenSymbol;

  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-xs tracking-[0.18em] text-muted uppercase">Ecosystem asset</p>
      <h1 className="mt-3 font-serif text-6xl tracking-tight">{name}</h1>
      <p className="mt-4 text-lg text-muted">
        {symbol} is the token Keel can display after a contract address is configured. Holding it is optional. Keel does not promise profit, yield, or a listing.
      </p>

      <section className="mt-10 rounded-[28px] border border-line bg-elev p-6">
        <dl className="space-y-4 text-sm">
          <Row label="Symbol" value={symbol} />
          <Row label="Network" value={`${networkName()} · ${chainId}`} />
          <Row
            label="Contract"
            value={
              tokenAddress
                ? tokenAddress
                : tokenAddressInvalid
                  ? "The configured value is not a valid address."
                  : "Token contract address will be published after deployment."
            }
          />
          <Row
            label="Total supply"
            value={
              onchain?.ok
                ? `${formatAmount(BigInt(onchain.totalSupply), onchain.decimals)} reported by the contract`
                : tokenAddress
                  ? "Live data unavailable."
                  : "Unavailable until a contract is published."
            }
          />
          <Row label="Circulating supply" value="Circulating supply is not verified." />
          <Row label="Holders" value="Holder count unavailable." />
          <Row label="Market data" value="Market data unavailable." />
          <Row label="Liquidity" value="Liquidity data unavailable." />
          <Row label="24h volume" value="24h volume unavailable." />
        </dl>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          {tokenAddress ? (
            <Button asChild variant="outline">
              <a href={explorerAddress(tokenAddress)} target="_blank" rel="noreferrer">
                View contract
              </a>
            </Button>
          ) : (
            <Button type="button" variant="outline" disabled>
              View contract
            </Button>
          )}
          <AddTokenButton
            address={onchain?.ok ? tokenAddress : undefined}
            symbol={onchain?.ok ? onchain.symbol : undefined}
            decimals={onchain?.ok ? onchain.decimals : undefined}
          />
        </div>
        {tokenAddress && onchain && !onchain.ok ? (
          <p className="mt-4 text-sm text-bad">
            {onchain.reason === "nocode"
              ? "No contract code was found at this address on the configured network."
              : onchain.reason === "not-erc20"
                ? "This address does not expose a standard ERC-20 name, symbol, decimals, and total supply."
                : onchain.reason === "mismatch"
                  ? "The RPC chain id does not match the configured network."
                  : "Live data unavailable."}
          </p>
        ) : null}
      </section>

      <section className="mt-10 space-y-4 text-sm leading-7 text-muted">
        <h2 className="font-serif text-3xl text-ink">Utility</h2>
        <p>
          The intended uses are payment inside Keel, a visible ecosystem asset, and future access or merchant incentives if a contract for that purpose is actually deployed. Nothing on this page is claimable today.
        </p>
        <h2 className="font-serif text-3xl text-ink">Deployment</h2>
        <p>
          This app does not deploy a token. After an independent deployment, set <span className="font-mono text-ink">NEXT_PUBLIC_TOKEN_ADDRESS</span> and restart. Keel will read the contract. It will not estimate a market.
          {tokenAddressRaw ? "" : " No address is configured."}
        </p>
        <h2 className="font-serif text-3xl text-ink">Risk</h2>
        <p>
          Token prices can fall to zero. Transfers are irreversible. A contract can be faulty. Read the <Link className="text-accent" href="/legal/risk">risk disclosure</Link> before treating {symbol} as something you want to hold.
        </p>
      </section>
    </article>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[180px_1fr] sm:gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="font-mono text-[13px] break-all">{value}</dd>
    </div>
  );
}
