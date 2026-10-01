import { isHash } from "viem";
import { jsonError } from "@/lib/http";
import { getRequest, publicRequest, recordObservedTransaction } from "@/lib/records";
import { getSessionAddress } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const existing = getRequest(id);
  if (!existing) return jsonError("Payment request not found.", 404);

  const body = (await request.json().catch(() => null)) as { hash?: string; note?: string } | null;
  if (!body?.hash || !isHash(body.hash)) return jsonError("Enter the transaction hash from your wallet.", 400);

  const session = await getSessionAddress();
  const result = await recordObservedTransaction({
    hash: body.hash,
    note: body.note,
    requestId: id,
    sessionAddress: session,
  });

  if (!result.ok) return jsonError(result.error, result.status);
  const updated = getRequest(id);
  return Response.json({
    transaction: result.transaction,
    request: updated ? publicRequest(updated) : null,
  });
}
