import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { contactEmail, independenceStatement, networkName, chainId } from "@/lib/network";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-4 max-w-md text-sm leading-6 text-muted">{independenceStatement}</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted">
            Have counsel review this wording before a public launch. Settlement network: {networkName()} · chain id {chainId}.
          </p>
        </div>
        <div className="text-sm">
          <p className="font-medium">Product</p>
          <ul className="mt-3 space-y-2 text-muted">
            <li><Link href="/app">Launch app</Link></li>
            <li><Link href="/token">Token</Link></li>
            <li><Link href="/security">Security</Link></li>
            <li><Link href="/technology">Technology</Link></li>
            <li><Link href="/roadmap">Roadmap</Link></li>
            <li><Link href="/docs">Documentation</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-medium">Legal</p>
          <ul className="mt-3 space-y-2 text-muted">
            <li><Link href="/legal/terms">Terms</Link></li>
            <li><Link href="/legal/privacy">Privacy</Link></li>
            <li><Link href="/legal/risk">Risk disclosure</Link></li>
            <li><Link href="/admin">Admin</Link></li>
            <li>{contactEmail ? <a href={`mailto:${contactEmail}`}>{contactEmail}</a> : "Contact email is not configured."}</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
