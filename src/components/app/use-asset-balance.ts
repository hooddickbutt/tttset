"use client";

import { erc20Abi } from "viem";
import { useBalance, useReadContracts } from "wagmi";
import { keelChain } from "@/lib/network";

export function useAssetBalance(
  owner?: `0x${string}`,
  kind: "native" | "erc20" = "native",
  token?: `0x${string}`,
) {
  const native = useBalance({
    address: owner,
    chainId: keelChain.id,
    query: { enabled: Boolean(owner) && kind === "native" },
  });

  const enabled = Boolean(owner && token && kind === "erc20");
  const contracts = useReadContracts({
    allowFailure: true,
    contracts: enabled
      ? [
          {
            address: token!,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [owner!],
            chainId: keelChain.id,
          },
          {
            address: token!,
            abi: erc20Abi,
            functionName: "decimals",
            chainId: keelChain.id,
          },
          {
            address: token!,
            abi: erc20Abi,
            functionName: "symbol",
            chainId: keelChain.id,
          },
        ]
      : [],
    query: { enabled },
  });

  if (kind === "native") {
    return {
      isLoading: native.isLoading,
      isError: native.isError || !native.data,
      data: native.data
        ? { value: native.data.value, decimals: native.data.decimals, symbol: native.data.symbol }
        : null,
    };
  }

  const [balance, decimals, symbol] = contracts.data ?? [];
  const ready =
    balance?.status === "success" && decimals?.status === "success" && symbol?.status === "success";

  return {
    isLoading: enabled && contracts.isLoading,
    isError: enabled && (contracts.isError || !ready),
    data: ready
      ? { value: balance.result, decimals: decimals.result, symbol: symbol.result }
      : null,
  };
}
