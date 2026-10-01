import { jsonError } from "@/lib/http";
import { listRequests, publicRequest } from "@/lib/records";
import { getSessionAddress } from "@/lib/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function cell(value: string | null) {
  const text = value ?? "";
  if (/[",\n]/.test(text)) return `"${text.replaceAll('"', '""')}"`;
  return text;
}

export async function GET() {
  const session = await getSessionAddress();
  if (!session) return jsonError("Sign in with your wallet to export records.", 401);
  const rows = listRequests(session).map(publicRequest);
  const header = [
    "id",
    "kind",
    "status",
    "amount",
    "asset",
    "created_at",
    "expires_at",
    "paid_tx_hash",
    "payer",
    "message",
  ];
  const lines = [
    header.join(","),
    ...rows.map((row) =>
      [
        row.id,
        row.kind,
        row.status,
        row.amount,
        row.assetSymbol,
        row.createdAt,
        row.expiresAt,
        row.paidTxHash,
        row.payer,
        row.message,
      ]
        .map((value) => cell(value))
        .join(","),
    ),
  ];
  return new Response(lines.join("\n"), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": "attachment; filename=keel-payments.csv",
    },
  });
}
