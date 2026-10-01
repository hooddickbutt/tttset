import { getAddress, isAddress, isHash } from "viem";
import { jsonError } from "@/lib/http";
import { listTransactions, publicTransaction, recordObservedTransaction } from "@/lib/records";
import { getSessionAddress } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const address = url.searchParams.get("address");
  if (!address || !isAddress(address)) {
    return jsonError("Connect wallet to view live data.", 400);
  }
  return Response.json({
    transactions: listTransactions(getAddress(address)).map(publicTransaction),
    indexer: "Historical chain indexing is not configured. This list contains transfers recorded by this Keel deployment after they were seen on the configured network.",
  });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { hash?: string; note?: string } | null;
  if (!body?.hash || !isHash(body.hash)) return jsonError("Enter a transaction hash.", 400);
  const session = await getSessionAddress();
  const result = await recordObservedTransaction({
    hash: body.hash,
    note: body.note,
    sessionAddress: session,
  });
  if (!result.ok) return jsonError(result.error, result.status);
  return Response.json({ transaction: result.transaction });
}
