import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { Button } from "@/components/ui/button";
import { getDb } from "@/lib/db";
import { formatWhen, shortAddress } from "@/lib/format";
import { appUrl, chainId, explorerTx, networkName } from "@/lib/network";
import { getRequest, publicRequest } from "@/lib/records";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `Payment ${id}` };
}

export default async function RequestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = getRequest(id);
  if (!row) notFound();
  const request = publicRequest(row);
  const user = getDb().prepare("SELECT username FROM users WHERE address = ?").get(request.recipient) as
    | { username: string | null }
    | undefined;
  const linkLabel = request.status === "paid" ? "Payment completed." : request.status === "expired" ? "Payment request expired." : "Connect wallet to continue.";
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host");
  const proto = headerList.get("x-forwarded-proto") || "http";
  const origin = appUrl || (host ? `${proto}://${host}` : "");
  const qr = origin
    ? await QRCode.toString(`${origin}/request/${request.id}`, {
        type: "svg",
        margin: 1,
        width: 220,
        color: { dark: "#1b1e18", light: "#ffffff" },
      })
    : "";

  return (
    <article className="mx-auto max-w-xl px-5 py-16">
      <p className="text-xs tracking-[0.18em] text-muted uppercase">Payment request</p>
      <h1 className="mt-3 font-serif text-5xl tracking-tight">
        {request.amount}
        <span className="ml-3">{request.assetSymbol}</span>
      </h1>
      <p className="mt-4 text-lg">{linkLabel}</p>
      <dl className="mt-8 space-y-4 text-sm">
        <div>
          <dt className="text-muted">Requested by</dt>
          <dd className="mt-1 font-mono break-all">{user?.username ? `@${user.username}` : shortAddress(request.recipient)}</dd>
          <dd className="font-mono text-xs break-all text-muted">{request.recipient}</dd>
        </div>
        <div>
          <dt className="text-muted">Asset</dt>
          <dd>{request.assetSymbol}{request.assetAddress ? ` · ${request.assetAddress}` : " · native ETH"}</dd>
        </div>
        <div>
          <dt className="text-muted">Network</dt>
          <dd>
            {request.chainId === chainId ? networkName() : `Chain ${request.chainId}`} · {request.chainId}
          </dd>
        </div>
        <div>
          <dt className="text-muted">Recipient</dt>
          <dd className="font-mono text-xs break-all">{request.recipient}</dd>
        </div>
        {request.message ? (
          <div>
            <dt className="text-muted">Message</dt>
            <dd>{request.message}</dd>
          </div>
        ) : null}
        {request.expiresAt ? (
          <div>
            <dt className="text-muted">Expires</dt>
            <dd>{formatWhen(request.expiresAt)}</dd>
          </div>
        ) : null}
        {request.status === "paid" && request.paidTxHash ? (
          <div>
            <dt className="text-muted">Transaction</dt>
            <dd>
              <a className="text-accent" href={explorerTx(request.paidTxHash)} target="_blank" rel="noreferrer">
                {request.paidTxHash}
              </a>
            </dd>
          </div>
        ) : null}
      </dl>
      {request.chainId !== chainId ? (
        <p className="mt-6 text-sm text-bad">This request was created for a different network than the one this deployment is configured to use.</p>
      ) : null}
      <div className="mt-8">
        {qr ? (
          <figure className="w-fit">
            <div
              className="rounded-2xl bg-white p-3 [&_svg]:h-auto [&_svg]:w-44"
              aria-label="Payment request QR code"
              dangerouslySetInnerHTML={{ __html: qr }}
            />
            <figcaption className="mt-2 max-w-44 text-xs leading-5 text-muted">This QR encodes the payment-request URL.</figcaption>
          </figure>
        ) : null}
      </div>
      {request.status === "open" && request.chainId === chainId ? (
        <Button asChild className="mt-8">
          <Link href={`/app/pay?request=${request.id}`}>Connect wallet to continue</Link>
        </Button>
      ) : null}
    </article>
  );
}
