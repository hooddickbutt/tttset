import type { Metadata } from "next";
import { Doc } from "@/components/doc";

export const metadata: Metadata = { title: "Documentation" };

export default function DocsPage() {
  return (
    <Doc
      eyebrow="Documentation"
      title="Run Keel locally."
      lede="Copy the environment file, start the app, and connect a wallet on the configured network. No contract address is required to try ETH payments."
    >
      <ol className="list-decimal space-y-2 pl-5">
        <li>Install dependencies with npm.</li>
        <li>Copy <span className="font-mono">.env.example</span> to <span className="font-mono">.env.local</span>.</li>
        <li>Leave the token address empty until a contract is deployed.</li>
        <li>Run <span className="font-mono">npm run dev</span>. The app listens on port 43123.</li>
        <li>Open Launch App, connect an injected wallet, and switch to the network Keel shows.</li>
      </ol>
      <p>Payment requests require a wallet signature. That signature is a sign-in, not a transfer. The transfer happens only on the send screen, inside your wallet.</p>
      <p>Demo mode is in Profile. It is labeled, stored in this browser, and it cannot broadcast. Turn it off before you send a real transfer.</p>
      <p>Set <span className="font-mono">ADMIN_SECRET</span> before expecting the admin screen to open. There is no built-in password.</p>
      <p>Server-only values, including <span className="font-mono">RPC_URL</span>, <span className="font-mono">DATABASE_URL</span>, <span className="font-mono">SESSION_SECRET</span>, and <span className="font-mono">ADMIN_SECRET</span>, must not be prefixed with <span className="font-mono">NEXT_PUBLIC_</span>.</p>
    </Doc>
  );
}
