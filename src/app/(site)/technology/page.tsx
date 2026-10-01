import type { Metadata } from "next";
import { Doc } from "@/components/doc";
import { chainId, explorerUrl, networkName, publicRpcUrl } from "@/lib/network";

export const metadata: Metadata = { title: "Technology" };

export default function TechnologyPage() {
  return (
    <Doc
      eyebrow="Technology"
      title="What this deployment actually runs."
      lede="The interface is Next.js. Wallet access is wagmi and viem. Records live in SQLite. Settlement is a direct wallet transfer."
    >
      <p>Next.js was chosen because the marketing site, the signed-in app, and the payment APIs belong in one deployable project. Tailwind handles the visual system. wagmi connects injected EVM wallets. viem reads balances, estimates gas, and checks receipts.</p>
      <p>A custom settlement contract is not required for sending ETH or an ERC-20 token, so this version does not ship one. That keeps funds out of an unaudited proxy. Payment requests are off-chain records. They become “paid” only when a transaction on {networkName()} matches them.</p>
      <p>SQLite is the local database so the app runs without a separate database server. The schema covers users, usernames, merchants, payment requests, verified transactions, notifications, settings, and error logs. A later deployment can move the same tables to PostgreSQL. Do not point this process at a database that already contains unrelated data without migrating it.</p>
      <p>The default RPC is the public Robinhood Chain endpoint, which the network docs describe as rate-limited. Set <span className="font-mono">RPC_URL</span> on the server if you use a provider key. Do not put that key in a <span className="font-mono">NEXT_PUBLIC_</span> variable.</p>
      <p className="font-mono text-xs leading-6 break-all">
        Chain {chainId} · {publicRpcUrl} · {explorerUrl}
      </p>
      <p>Historical indexing is not connected. The activity view lists transfers this deployment has seen and verified, and it links to the public explorer for the rest. Swap and rewards stay on coming-soon screens until a real integration exists.</p>
    </Doc>
  );
}
