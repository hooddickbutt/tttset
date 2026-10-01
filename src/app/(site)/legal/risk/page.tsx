import type { Metadata } from "next";
import { Doc } from "@/components/doc";
import { independenceStatement } from "@/lib/network";

export const metadata: Metadata = { title: "Risk disclosure" };

export default function RiskPage() {
  return (
    <Doc
      eyebrow="Risk disclosure"
      title="Risk disclosure"
      lede="Digital assets can lose all of their value. Nothing in Keel is a promise of profit, a brokerage service, or a recommendation to buy."
    >
      <p>{independenceStatement}</p>
      <p>Transactions on the configured network are generally irreversible. Sending to the wrong address, signing a malicious request, or paying a network fee on a failed transaction can lose assets. Keel cannot reverse a chain transaction.</p>
      <p>A token contract, including one created on an external launcher, can be unaudited, illiquid, or worthless. Keel shows contract fields it can read. Missing market data means the data is unavailable, not that a market is stable.</p>
      <p>The public RPC can fail or rate-limit. When that happens, Keel says live data is unavailable instead of showing a substitute number.</p>
      <p>This draft is not legal, tax, or investment advice. Review it with qualified counsel before relying on it.</p>
    </Doc>
  );
}
