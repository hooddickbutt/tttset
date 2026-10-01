import "server-only";

import { createPublicClient, erc20Abi, http, isAddress } from "viem";
import { chainId, keelChain, publicRpcUrl } from "@/lib/network";
import type { ObservedTx } from "@/lib/verify-payment";

const rpcUrl = process.env.RPC_URL || publicRpcUrl;

export function getPublicClient() {
  return createPublicClient({
    chain: keelChain,
    transport: http(rpcUrl),
  });
}

export async function readChainHead() {
  try {
    const client = getPublicClient();
    const [reportedId, blockNumber] = await Promise.all([
      client.getChainId(),
      client.getBlockNumber(),
    ]);
    return {
      ok: reportedId === chainId,
      chainId: reportedId,
      expectedChainId: chainId,
      blockNumber: blockNumber.toString(),
      mismatch: reportedId !== chainId,
    };
  } catch {
    return { ok: false as const, mismatch: false, expectedChainId: chainId };
  }
}

export async function observeTransaction(hash: `0x${string}`): Promise<ObservedTx | null> {
  const head = await readChainHead();
  if (!head.ok) return null;
  const client = getPublicClient();
  const tx = await client.getTransaction({ hash }).catch(() => null);
  if (!tx) return null;
  const receipt = await client.getTransactionReceipt({ hash }).catch(() => null);
  return {
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    value: tx.value,
    input: tx.input,
    status: receipt ? (receipt.status === "success" ? "success" : "reverted") : "pending",
    chainId: tx.chainId ?? chainId,
  };
}

export async function readTokenContract(address: string) {
  if (!isAddress(address)) {
    return { ok: false as const, reason: "invalid" as const };
  }
  const head = await readChainHead();
  if (!("blockNumber" in head) || !head.ok) {
    return { ok: false as const, reason: head.mismatch ? ("mismatch" as const) : ("unavailable" as const) };
  }
  const client = getPublicClient();
  const code = await client.getBytecode({ address }).catch(() => undefined);
  if (!code || code === "0x") {
    return { ok: false as const, reason: "nocode" as const };
  }
  try {
    const [name, symbol, decimals, totalSupply] = await Promise.all([
      client.readContract({ address, abi: erc20Abi, functionName: "name" }),
      client.readContract({ address, abi: erc20Abi, functionName: "symbol" }),
      client.readContract({ address, abi: erc20Abi, functionName: "decimals" }),
      client.readContract({ address, abi: erc20Abi, functionName: "totalSupply" }),
    ]);
    return {
      ok: true as const,
      name,
      symbol,
      decimals,
      totalSupply: totalSupply.toString(),
    };
  } catch {
    return { ok: false as const, reason: "not-erc20" as const };
  }
}
