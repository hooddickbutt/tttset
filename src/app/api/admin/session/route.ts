import { jsonError } from "@/lib/http";
import {
  adminConfigured,
  clearAdminCookie,
  passwordsMatch,
  setAdminCookie,
} from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!adminConfigured() || !process.env.ADMIN_SECRET) {
    return jsonError("Admin authentication is not configured. Set ADMIN_SECRET on the server.", 503);
  }
  const body = (await request.json().catch(() => null)) as { password?: string } | null;
  if (!body?.password || !passwordsMatch(body.password, process.env.ADMIN_SECRET)) {
    return jsonError("That password was not accepted.", 401);
  }
  await setAdminCookie();
  return Response.json({ ok: true });
}

export async function DELETE() {
  await clearAdminCookie();
  return Response.json({ ok: true });
}
