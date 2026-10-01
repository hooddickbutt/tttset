import { formatAmount } from "@/lib/format";
import {
  chainId,
  explorerAddress,
  explorerUrl,
  networkName,
  tokenAddress,
  tokenAddressInvalid,
  tokenAddressRaw,
  tokenName,
  tokenSymbol,
} from "@/lib/network";
import { readTokenContract } from "@/lib/rpc";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!tokenAddressRaw) {
    return Response.json({
      configured: false,
      name: tokenName,
      symbol: tokenSymbol,
      message: "Token contract address will be published after deployment.",
      network: networkName(),
      chainId,
      marketData: "Market data unavailable.",
      holders: "Holder count unavailable.",
      liquidity: "Liquidity data unavailable.",
      volume24h: "24h volume unavailable.",
      circulatingSupply: "Circulating supply is not verified.",
    });
  }

  if (tokenAddressInvalid || !tokenAddress) {
    return Response.json({
      configured: false,
      invalid: true,
      message: "NEXT_PUBLIC_TOKEN_ADDRESS is set, but it is not a valid address. Keel will not use it.",
    });
  }

  const onchain = await readTokenContract(tokenAddress);
  if (!onchain.ok) {
    const message =
      onchain.reason === "nocode"
        ? "No contract code was found at this address on the configured network."
        : onchain.reason === "not-erc20"
          ? "This address does not expose a standard ERC-20 name, symbol, decimals, and total supply."
          : onchain.reason === "mismatch"
            ? "The RPC chain id does not match the configured network."
            : "Live data unavailable.";
    return Response.json({
      configured: true,
      address: tokenAddress,
      readable: false,
      message,
      explorer: explorerAddress(tokenAddress),
      network: networkName(),
      chainId,
    });
  }

  return Response.json({
    configured: true,
    readable: true,
    address: tokenAddress,
    name: onchain.name,
    symbol: onchain.symbol,
    decimals: onchain.decimals,
    totalSupply: formatAmount(BigInt(onchain.totalSupply), onchain.decimals),
    totalSupplyRaw: onchain.totalSupply,
    network: networkName(),
    chainId,
    explorer: explorerAddress(tokenAddress),
    explorerRoot: explorerUrl,
    marketData: "Market data unavailable.",
    holders: "Holder count unavailable.",
    liquidity: "Liquidity data unavailable.",
    volume24h: "24h volume unavailable.",
    circulatingSupply: "Circulating supply is not verified.",
    source: "Read from the contract on the configured network. Keel does not estimate price, holders, or volume.",
  });
}
