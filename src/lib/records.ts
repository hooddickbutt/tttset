import "server-only";

import { randomBytes } from "node:crypto";
import { getAddress, isAddress, type Hex } from "viem";
import { getDb, logError, type PaymentRequestRow, type TransactionRow } from "@/lib/db";
import { formatAmount, requestStatus } from "@/lib/format";
import { chainId, tokenAddress, tokenSymbol } from "@/lib/network";
import { observeTransaction } from "@/lib/rpc";
import { matchTransfer } from "@/lib/verify-payment";

export function newId() {
  return randomBytes(9).toString("base64url");
}

export function publicRequest(row: PaymentRequestRow) {
  const status = requestStatus(row);
  return {
    id: row.id,
    recipient: row.recipient,
    kind: row.kind,
    assetKind: row.asset_kind,
    assetSymbol: row.asset_symbol,
    assetAddress: row.asset_address,
    amount: row.amount,
    amountBase: row.amount_base,
    decimals: row.decimals,
    message: row.message,
    expiresAt: row.expires_at,
    status,
    createdAt: row.created_at,
    paidTxHash: row.paid_tx_hash,
    paidAt: row.paid_at,
    payer: status === "paid" ? row.payer : null,
    chainId: row.chain_id,
  };
}

export function publicTransaction(row: TransactionRow) {
  return {
    hash: row.hash,
    chainId: row.chain_id,
    from: row.from_address,
    to: row.to_address,
    assetSymbol: row.asset_symbol,
    assetAddress: row.asset_address,
    amount: row.amount,
    amountBase: row.amount_base,
    note: row.note,
    requestId: row.request_id,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    simulated: false,
  };
}

export function getRequest(id: string) {
  return getDb().prepare("SELECT * FROM payment_requests WHERE id = ?").get(id) as
    | PaymentRequestRow
    | undefined;
}

export function listRequests(address: string) {
  return getDb()
    .prepare("SELECT * FROM payment_requests WHERE recipient = ? ORDER BY created_at DESC")
    .all(getAddress(address)) as PaymentRequestRow[];
}

export function listTransactions(address: string) {
  const checksum = getAddress(address);
  return getDb()
    .prepare(
      "SELECT * FROM transactions WHERE from_address = ? OR to_address = ? ORDER BY created_at DESC LIMIT 50",
    )
    .all(checksum, checksum) as TransactionRow[];
}

type RecordInput = {
  hash: Hex;
  note?: string | null;
  requestId?: string | null;
  sessionAddress?: string | null;
};

export async function recordObservedTransaction(input: RecordInput) {
  const observed = await observeTransaction(input.hash);
  if (!observed) {
    return {
      ok: false as const,
      status: 404,
      error: "Transaction was not found on the configured network yet.",
    };
  }

  const now = new Date().toISOString();
  const db = getDb();
  const request = input.requestId ? getRequest(input.requestId) : undefined;
  if (input.requestId && !request) {
    return { ok: false as const, status: 404, error: "Payment request not found." };
  }

  const expected = request
    ? {
        chainId: request.chain_id,
        kind: request.asset_kind,
        token: request.asset_address ? (request.asset_address as `0x${string}`) : undefined,
        to: request.recipient as `0x${string}`,
        amountBase: BigInt(request.amount_base),
      }
    : null;

  if (request && expected) {
    const status = requestStatus(request);
    if (status === "expired") {
      return { ok: false as const, status: 409, error: "Payment request expired." };
    }
    if (status === "paid" && request.paid_tx_hash && request.paid_tx_hash !== observed.hash) {
      return { ok: false as const, status: 409, error: "Payment already completed." };
    }
    const matched = matchTransfer(expected, observed);
    if (!matched.ok && matched.reason !== "Transaction is still pending.") {
      return { ok: false as const, status: 400, error: matched.reason };
    }
  }

  const assetSymbol = request?.asset_symbol ?? "ETH";
  const assetAddress = request?.asset_address ?? null;
  const amount = request?.amount ?? formatAmount(observed.value, 18);
  const amountBase = request?.amount_base ?? observed.value.toString();
  const toAddress = request?.recipient ?? observed.to ?? observed.from;
  const note =
    input.note &&
    input.sessionAddress &&
    input.sessionAddress.toLowerCase() === observed.from.toLowerCase()
      ? input.note.slice(0, 280)
      : null;

  const status =
    observed.status === "success" ? "confirmed" : observed.status === "reverted" ? "failed" : "pending";

  if (!request && observed.input !== "0x" && !assetAddress) {
    return {
      ok: false as const,
      status: 400,
      error: "Keel only records plain ETH transfers or payments tied to a Keel request.",
    };
  }

  db.prepare(
    `INSERT INTO transactions (
      hash, chain_id, from_address, to_address, asset_symbol, asset_address,
      amount, amount_base, note, request_id, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(hash) DO UPDATE SET
      status = excluded.status,
      note = COALESCE(excluded.note, transactions.note),
      request_id = COALESCE(excluded.request_id, transactions.request_id),
      updated_at = excluded.updated_at`,
  ).run(
    observed.hash,
    observed.chainId,
    getAddress(observed.from),
    getAddress(toAddress),
    assetSymbol,
    assetAddress,
    amount,
    amountBase,
    note,
    request?.id ?? null,
    status,
    now,
    now,
  );

  if (request && expected && observed.status === "success") {
    const matched = matchTransfer(expected, observed);
    if (matched.ok && requestStatus(request) !== "paid") {
      db.prepare(
        "UPDATE payment_requests SET status = ?, paid_tx_hash = ?, paid_at = ?, payer = ? WHERE id = ?",
      ).run("paid", observed.hash, now, getAddress(observed.from), request.id);
      db.prepare(
        "INSERT INTO notifications (id, address, title, body, created_at, read_at) VALUES (?, ?, ?, ?, ?, NULL)",
      ).run(
        newId(),
        request.recipient,
        "Payment completed",
        `${request.amount} ${request.asset_symbol} was confirmed onchain.`,
        now,
      );
    }
  }

  const stored = db.prepare("SELECT * FROM transactions WHERE hash = ?").get(observed.hash) as TransactionRow;
  return { ok: true as const, transaction: publicTransaction(stored) };
}

export function supportedAsset(kind: "native" | "erc20") {
  if (kind === "native") {
    return { kind, symbol: "ETH", address: null as string | null, decimals: 18 };
  }
  if (!tokenAddress || !isAddress(tokenAddress)) return null;
  return { kind, symbol: tokenSymbol, address: tokenAddress, decimals: null as number | null };
}

export function configuredChainId() {
  return chainId;
}

export function safeLog(error: unknown, path: string) {
  const message = error instanceof Error ? error.message : "Unknown error";
  logError(message, path);
}
