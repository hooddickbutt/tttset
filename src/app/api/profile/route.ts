import { getAddress, isAddress } from "viem";
import { getDb } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { getSessionAddress } from "@/lib/session";
import { validateUsername } from "@/lib/username";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const address = url.searchParams.get("address");
  if (!address || !isAddress(address)) return Response.json({ username: null });
  const user = getDb().prepare("SELECT username FROM users WHERE address = ?").get(getAddress(address)) as
    | { username: string | null }
    | undefined;
  return Response.json({ username: user?.username ?? null });
}

export async function POST(request: Request) {
  const session = await getSessionAddress();
  if (!session) return jsonError("Sign in with your wallet before choosing a username.", 401);

  const body = (await request.json().catch(() => null)) as { username?: string } | null;
  const parsed = validateUsername(body?.username || "");
  if (!parsed.ok) return jsonError(parsed.error, 400);

  try {
    getDb()
      .prepare(
        "INSERT INTO users (address, username, created_at) VALUES (?, ?, ?) ON CONFLICT(address) DO UPDATE SET username = excluded.username",
      )
      .run(session, parsed.username, new Date().toISOString());
  } catch {
    return jsonError("That username is already taken.", 409);
  }

  return Response.json({ username: parsed.username });
}
