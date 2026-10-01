import { getDb } from "@/lib/db";
import { jsonError } from "@/lib/http";
import { listRequests, publicRequest } from "@/lib/records";
import { getSessionAddress } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cleanName(input: string) {
  const name = input.replace(/[\u0000-\u001F]/g, "").trim();
  if (name.length < 2 || name.length > 40) return null;
  return name;
}

export async function GET() {
  const session = await getSessionAddress();
  if (!session) return jsonError("Sign in with your wallet to open merchant tools.", 401);
  const merchant = getDb().prepare("SELECT address, name, created_at FROM merchants WHERE address = ?").get(session) as
    | { address: string; name: string; created_at: string }
    | undefined;
  const requests = listRequests(session).map(publicRequest);
  const confirmed = requests.filter((item) => item.status === "paid");
  return Response.json({
    merchant: merchant
      ? { address: merchant.address, name: merchant.name, createdAt: merchant.created_at }
      : null,
    requests,
    confirmed,
    note: "Totals below are calculated only from payment requests created in this Keel deployment and confirmed onchain. They are not network-wide revenue.",
  });
}

export async function POST(request: Request) {
  const session = await getSessionAddress();
  if (!session) return jsonError("Sign in with your wallet to create a merchant profile.", 401);
  const body = (await request.json().catch(() => null)) as { name?: string } | null;
  const name = cleanName(body?.name || "");
  if (!name) return jsonError("Use a merchant name between 2 and 40 characters.", 400);
  const now = new Date().toISOString();
  getDb()
    .prepare(
      "INSERT INTO merchants (address, name, created_at) VALUES (?, ?, ?) ON CONFLICT(address) DO UPDATE SET name = excluded.name",
    )
    .run(session, name, now);
  return Response.json({ merchant: { address: session, name } });
}
