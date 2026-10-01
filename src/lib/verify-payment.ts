import { decodeFunctionData, erc20Abi, type Hex } from "viem";

export type ObservedTx = {
  hash: Hex;
  from: `0x${string}`;
  to: `0x${string}` | null;
  value: bigint;
  input: Hex;
  status: "success" | "reverted" | "pending";
  chainId: number;
};

export type ExpectedTransfer = {
  chainId: number;
  kind: "native" | "erc20";
  token?: `0x${string}`;
  to: `0x${string}`;
  amountBase: bigint;
};

export function matchTransfer(expected: ExpectedTransfer, tx: ObservedTx) {
  if (tx.status === "reverted") {
    return { ok: false as const, reason: "Transaction failed onchain." };
  }
  if (tx.chainId !== expected.chainId) {
    return { ok: false as const, reason: "Transaction is on a different network." };
  }

  if (expected.kind === "native") {
    if (!tx.to || tx.to.toLowerCase() !== expected.to.toLowerCase()) {
      return { ok: false as const, reason: "Recipient does not match this payment." };
    }
    if (tx.value !== expected.amountBase) {
      return { ok: false as const, reason: "Amount does not match this payment." };
    }
    if (tx.status === "pending") {
      return { ok: false as const, reason: "Transaction is still pending." };
    }
    return {
      ok: true as const,
      from: tx.from,
      to: tx.to,
      amountBase: tx.value,
      assetAddress: null,
    };
  }

  if (!expected.token || !tx.to || tx.to.toLowerCase() !== expected.token.toLowerCase()) {
    return { ok: false as const, reason: "Transaction does not call the expected token." };
  }

  try {
    const decoded = decodeFunctionData({ abi: erc20Abi, data: tx.input });
    if (decoded.functionName !== "transfer") {
      return { ok: false as const, reason: "Transaction is not a token transfer." };
    }
    const [recipient, amount] = decoded.args;
    if (recipient.toLowerCase() !== expected.to.toLowerCase()) {
      return { ok: false as const, reason: "Recipient does not match this payment." };
    }
    if (amount !== expected.amountBase) {
      return { ok: false as const, reason: "Amount does not match this payment." };
    }
    if (tx.status === "pending") {
      return { ok: false as const, reason: "Transaction is still pending." };
    }
    return {
      ok: true as const,
      from: tx.from,
      to: recipient,
      amountBase: amount,
      assetAddress: expected.token,
    };
  } catch {
    return { ok: false as const, reason: "Transaction data could not be read as a transfer." };
  }
}
