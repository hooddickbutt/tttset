import { getAddress, isAddress, verifyMessage } from "viem";
import { getDb } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { clearSessionCookie, getSessionAddress, setSessionCookie } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const address = await getSessionAddress();
  if (!address) return Response.json({ address: null, username: null });
  const user = getDb().prepare("SELECT username FROM users WHERE address = ?").get(address) as
    | { username: string | null }
    | undefined;
  return Response.json({ address, username: user?.username ?? null });
}

export async function DELETE() {
  await clearSessionCookie();
  return Response.json({ ok: true });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    address?: string;
    message?: string;
    signature?: `0x${string}`;
  } | null;

  if (!body?.address || !isAddress(body.address) || !body.message || !body.signature) {
    return jsonError("Sign-in details are incomplete.", 400);
  }

  const address = getAddress(body.address);
  const row = getDb().prepare("SELECT message, expires_at FROM nonces WHERE address = ?").get(address) as
    | { message: string; expires_at: string }
    | undefined;

  if (!row || row.message !== body.message || Date.parse(row.expires_at) < Date.now()) {
    return jsonError("This sign-in message expired. Request a new one.", 400);
  }

  const valid = await verifyMessage({
    address,
    message: body.message,
    signature: body.signature,
  }).catch(() => false);

  if (!valid) return jsonError("The wallet signature could not be verified.", 401);

  getDb().prepare("DELETE FROM nonces WHERE address = ?").run(address);
  getDb()
    .prepare("INSERT INTO users (address, username, created_at) VALUES (?, NULL, ?) ON CONFLICT(address) DO NOTHING")
    .run(address, new Date().toISOString());
  await setSessionCookie(address);
  return Response.json({ address });
}
