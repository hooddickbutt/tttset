import { getAddress } from "viem";
import { getDb, type PaymentRequestRow } from "@/lib/db";
import { parseAmount } from "@/lib/format";
import { jsonError } from "@/lib/http";
import { chainId, tokenAddress, tokenSymbol } from "@/lib/network";
import { listRequests, newId, publicRequest } from "@/lib/records";
import { readTokenContract } from "@/lib/rpc";
import { getSessionAddress } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSessionAddress();
  if (!session) return jsonError("Sign in with your wallet to view your payment requests.", 401);
  const rows = listRequests(session).map(publicRequest);
  return Response.json({ requests: rows });
}

export async function POST(request: Request) {
  const session = await getSessionAddress();
  if (!session) return jsonError("Sign in with your wallet to create a payment request.", 401);

  const body = (await request.json().catch(() => null)) as {
    asset?: "native" | "erc20";
    amount?: string;
    message?: string;
    expiresInHours?: number;
    kind?: "request" | "invoice";
  } | null;

  if (!body?.asset || (body.asset !== "native" && body.asset !== "erc20")) {
    return jsonError("Choose ETH or the configured token.", 400);
  }

  let symbol = "ETH";
  let decimals = 18;
  let assetAddress: string | null = null;

  if (body.asset === "erc20") {
    if (!tokenAddress) {
      return jsonError("Token contract address will be published after deployment.", 400);
    }
    const token = await readTokenContract(tokenAddress);
    if (!token.ok) return jsonError("Live token data is unavailable, so this request was not created.", 503);
    symbol = token.symbol || tokenSymbol;
    decimals = token.decimals;
    assetAddress = getAddress(tokenAddress);
  }

  const parsed = parseAmount(body.amount || "", decimals);
  if (!parsed.ok) return jsonError(parsed.error, 400);

  let expiresAt: string | null = null;
  if (body.expiresInHours != null && body.expiresInHours !== 0) {
    if (!Number.isFinite(body.expiresInHours) || body.expiresInHours < 1 || body.expiresInHours > 24 * 30) {
      return jsonError("Expiration must be between 1 hour and 30 days.", 400);
    }
    expiresAt = new Date(Date.now() + body.expiresInHours * 60 * 60 * 1000).toISOString();
  }

  const message = (body.message || "").trim().slice(0, 280) || null;
  const id = newId();
  const now = new Date().toISOString();
  const kind = body.kind === "invoice" ? "invoice" : "request";

  getDb()
    .prepare(
      `INSERT INTO payment_requests (
        id, recipient, kind, asset_kind, asset_symbol, asset_address, amount, amount_base,
        decimals, message, expires_at, status, created_at, chain_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'open', ?, ?)`,
    )
    .run(
      id,
      session,
      kind,
      body.asset,
      symbol,
      assetAddress,
      parsed.display,
      parsed.base.toString(),
      decimals,
      message,
      expiresAt,
      now,
      chainId,
    );

  const row = getDb().prepare("SELECT * FROM payment_requests WHERE id = ?").get(id) as PaymentRequestRow;
  return Response.json({ request: publicRequest(row) }, { status: 201 });
}
