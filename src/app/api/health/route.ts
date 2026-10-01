import { getDb } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { readChainHead } from "@/lib/rpc";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  let database: { ok: boolean } = { ok: false };
  try {
    getDb().prepare("SELECT 1 AS ok").get();
    database = { ok: true };
  } catch {
    database = { ok: false };
  }

  const chain = await readChainHead();
  if (!database.ok && !chain.ok) {
    return jsonError("Live data unavailable.", 503);
  }

  return Response.json({
    database,
    chain: chain.ok
      ? {
          ok: true,
          chainId: chain.chainId,
          blockNumber: chain.blockNumber,
        }
      : {
          ok: false,
          message: chain.mismatch
            ? "The RPC chain id does not match the configured network."
            : "Live data unavailable.",
        },
  });
}
