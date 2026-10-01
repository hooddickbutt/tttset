import { getDb } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { getSessionAddress } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getSessionAddress();
  if (!session) return jsonError("Sign in with your wallet to view notifications.", 401);
  const rows = getDb()
    .prepare(
      "SELECT id, title, body, created_at, read_at FROM notifications WHERE address = ? ORDER BY created_at DESC LIMIT 30",
    )
    .all(session) as {
    id: string;
    title: string;
    body: string;
    created_at: string;
    read_at: string | null;
  }[];
  return Response.json({
    notifications: rows.map((row) => ({
      id: row.id,
      title: row.title,
      body: row.body,
      createdAt: row.created_at,
      readAt: row.read_at,
    })),
  });
}

export async function POST() {
  const session = await getSessionAddress();
  if (!session) return jsonError("Sign in with your wallet to update notifications.", 401);
  getDb()
    .prepare("UPDATE notifications SET read_at = ? WHERE address = ? AND read_at IS NULL")
    .run(new Date().toISOString(), session);
  return Response.json({ ok: true });
}
