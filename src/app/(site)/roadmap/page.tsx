import type { Metadata } from "next";
import { Doc } from "@/components/doc";

export const metadata: Metadata = { title: "Roadmap" };

export default function RoadmapPage() {
  return (
    <Doc
      eyebrow="Roadmap"
      title="Now, and not yet."
      lede="A feature is listed as available only if this deployment can perform it. Everything else stays marked coming soon."
    >
      <h2 className="font-serif text-3xl text-ink">Available</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Connect an injected EVM wallet and switch to the configured network.</li>
        <li>Read ETH balances from the RPC, and token balances when a contract is configured and readable.</li>
        <li>Send ETH, or the configured token, after a wallet confirmation.</li>
        <li>Receive with an address and a QR code.</li>
        <li>Create payment links and invoices tied to the signed-in wallet.</li>
        <li>Mark a request paid only after an onchain match.</li>
        <li>Merchant export of those records.</li>
        <li>Optional username stored against the wallet.</li>
        <li>Admin view of this deployment’s own records, behind a server secret.</li>
      </ul>
      <h2 className="font-serif text-3xl text-ink">Coming soon</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>Swap, after a verified pool or router is configured. The swap screen does not simulate a fill.</li>
        <li>Rewards, after a contract can report a real claimable balance.</li>
        <li>WalletConnect, after a project id is provided.</li>
        <li>An indexer for older history. Until then, use the block explorer.</li>
      </ul>
    </Doc>
  );
}
