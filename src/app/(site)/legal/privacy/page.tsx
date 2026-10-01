import type { Metadata } from "next";
import { Doc } from "@/components/doc";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <Doc
      eyebrow="Privacy"
      title="Privacy"
      lede="Have counsel review this draft before a public launch. It describes what this version stores."
    >
      <p>Wallet addresses, optional usernames, merchant names, payment-request details, and transactions Keel has verified are stored in the deployment database. Sign-in uses a short-lived message and an httpOnly session cookie. Keel does not ask for or store seed phrases or private keys.</p>
      <p>Payment notes are stored with the request or, when you are signed in as the sender, with a recorded transaction. They are not written into the blockchain transfer.</p>
      <p>Demo transactions stay in your browser’s local storage. They are not sent to the database.</p>
      <p>Public payment links show the recipient address, amount, asset, network, optional message, and status. Do not put secrets in the message.</p>
      <p>RPC providers and the block explorer receive the queries needed to read balances and transactions. Those services have their own policies.</p>
    </Doc>
  );
}
