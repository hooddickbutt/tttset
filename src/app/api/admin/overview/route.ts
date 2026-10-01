import { getDb } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { chainId, networkName, tokenAddress, tokenAddressRaw, tokenSymbol } from "@/lib/network";
import { readChainHead } from "@/lib/rpc";
import { isAdmin } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.ADMIN_SECRET) {
    return jsonError("Admin authentication is not configured. Set ADMIN_SECRET on the server.", 503);
  }
  if (!(await isAdmin())) return jsonError("Admin sign-in required.", 401);

  const db = getDb();
  const count = (sql: string) => (db.prepare(sql).get() as { n: number }).n;
  const chain = await readChainHead();

  return Response.json({
    label: "Records stored by this Keel deployment. These are not network-wide statistics.",
    users: count("SELECT COUNT(*) AS n FROM users"),
    usernames: count("SELECT COUNT(*) AS n FROM users WHERE username IS NOT NULL"),
    merchants: count("SELECT COUNT(*) AS n FROM merchants"),
    requests: count("SELECT COUNT(*) AS n FROM payment_requests"),
    openRequests: count("SELECT COUNT(*) AS n FROM payment_requests WHERE status = 'open'"),
    paidRequests: count("SELECT COUNT(*) AS n FROM payment_requests WHERE status = 'paid'"),
    transactions: count("SELECT COUNT(*) AS n FROM transactions"),
    confirmed: count("SELECT COUNT(*) AS n FROM transactions WHERE status = 'confirmed'"),
    pending: count("SELECT COUNT(*) AS n FROM transactions WHERE status = 'pending'"),
    failed: count("SELECT COUNT(*) AS n FROM transactions WHERE status = 'failed'"),
    recentRequests: db
      .prepare(
        "SELECT id, recipient, amount, asset_symbol, status, created_at, paid_tx_hash FROM payment_requests ORDER BY created_at DESC LIMIT 20",
      )
      .all(),
    recentTransactions: db
      .prepare(
        "SELECT hash, from_address, to_address, amount, asset_symbol, status, created_at FROM transactions ORDER BY created_at DESC LIMIT 20",
      )
      .all(),
    recentErrors: db
      .prepare("SELECT id, message, path, created_at FROM errors ORDER BY created_at DESC LIMIT 20")
      .all(),
    merchantsList: db.prepare("SELECT address, name, created_at FROM merchants ORDER BY created_at DESC LIMIT 20").all(),
    chain,
    token: {
      configured: Boolean(tokenAddress),
      invalid: Boolean(tokenAddressRaw) && !tokenAddress,
      address: tokenAddress ?? null,
      symbol: tokenSymbol,
      message: tokenAddress ? null : "Token contract address will be published after deployment.",
    },
    assets: [
      { symbol: "ETH", kind: "native", network: networkName(), chainId },
      tokenAddress
        ? { symbol: tokenSymbol, kind: "erc20", address: tokenAddress, network: networkName(), chainId }
        : { symbol: tokenSymbol, kind: "erc20", address: null, message: "Not configured" },
    ],
    assetEditing: "Supported assets are set with environment variables. This screen does not edit them.",
  });
}
