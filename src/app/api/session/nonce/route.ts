import { getAddress, isAddress } from "viem";
import { getDb } from "@/lib/db";
import { jsonError, originFrom, rateLimit } from "@/lib/http";
import { sessionMessage } from "@/lib/messages";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") || "local";
  if (!rateLimit(`nonce:${ip}`, 30, 60_000)) {
    return jsonError("Too many sign-in attempts. Wait a minute and try again.", 429);
  }

  const body = (await request.json().catch(() => null)) as { address?: string } | null;
  if (!body?.address || !isAddress(body.address)) {
    return jsonError("Enter a valid wallet address.", 400);
  }

  const address = getAddress(body.address);
  const nonce = crypto.randomUUID();
  const issuedAt = new Date();
  const expiration = new Date(issuedAt.getTime() + 10 * 60 * 1000);
  const message = sessionMessage({
    origin: originFrom(request),
    address,
    nonce,
    issuedAt: issuedAt.toISOString(),
    expiration: expiration.toISOString(),
  });

  getDb()
    .prepare(
      "INSERT INTO nonces (address, message, expires_at) VALUES (?, ?, ?) ON CONFLICT(address) DO UPDATE SET message = excluded.message, expires_at = excluded.expires_at",
    )
    .run(address, message, expiration.toISOString());

  return Response.json({ message });
}
