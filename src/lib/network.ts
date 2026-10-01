import { defineChain, isAddress } from "viem";

/**
 * Network parameters checked against Robinhood Chain documentation:
 * https://docs.robinhood.com/chain/connecting/
 * Mainnet chain id 4663 was also confirmed with eth_chainId on the public RPC.
 * Keel is not affiliated with Robinhood.
 */

const configuredId = Number(process.env.NEXT_PUBLIC_CHAIN_ID || "4663");

export const chainId =
  Number.isInteger(configuredId) && configuredId > 0 ? configuredId : 4663;

export const publicRpcUrl =
  process.env.NEXT_PUBLIC_RPC_URL || "https://rpc.mainnet.chain.robinhood.com";

export const explorerUrl = (
  process.env.NEXT_PUBLIC_EXPLORER_URL || "https://robinhoodchain.blockscout.com"
).replace(/\/$/, "");

export const tokenAddressRaw = (process.env.NEXT_PUBLIC_TOKEN_ADDRESS || "").trim();

export const tokenAddress = isAddress(tokenAddressRaw) ? tokenAddressRaw : undefined;

export const tokenAddressInvalid = Boolean(tokenAddressRaw) && !tokenAddress;

export const tokenName = (process.env.NEXT_PUBLIC_TOKEN_NAME || "Keel").trim() || "Keel";

export const tokenSymbol = (process.env.NEXT_PUBLIC_TOKEN_SYMBOL || "KEEL").trim() || "KEEL";

export const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "").replace(/\/$/, "");

export const contactEmail = (process.env.CONTACT_EMAIL || "").trim();

export const isDocumentedChain = chainId === 4663 || chainId === 46630;

export const isTestnet = chainId === 46630;

export function networkName(id = chainId) {
  if (id === 4663) return "Robinhood Chain";
  if (id === 46630) return "Robinhood Chain Testnet";
  return `Chain ${id}`;
}

export const keelChain = defineChain({
  id: chainId,
  name: networkName(),
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: [publicRpcUrl] },
  },
  blockExplorers: {
    default: {
      name: "Blockscout",
      url: explorerUrl,
    },
  },
  testnet: isTestnet,
});

export function explorerAddress(address: string) {
  return `${explorerUrl}/address/${address}`;
}

export function explorerTx(hash: string) {
  return `${explorerUrl}/tx/${hash}`;
}

export const independenceStatement =
  "This is an independent project and is not affiliated with, endorsed by, sponsored by, or officially connected with X, X Money, Robinhood, or Robinhood Markets, Inc.";
