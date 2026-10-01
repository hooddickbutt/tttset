import { jsonError } from "@/lib/http";
import { getRequest, publicRequest } from "@/lib/records";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const row = getRequest(id);
  if (!row) return jsonError("Payment request not found.", 404);
  return Response.json({ request: publicRequest(row) });
}
