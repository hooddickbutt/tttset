import Link from "next/link";
import { explorerUrl, independenceStatement, isTestnet, networkName, chainId, publicRpcUrl } from "@/lib/network";
import { Button } from "@/components/ui/button";

const steps = [
  {
    n: "01",
    title: "Connect",
    body: "Connect a compatible wallet. Keel never asks for a seed phrase.",
  },
  {
    n: "02",
    title: "Pay",
    body: "Send assets you hold, or create a payment request for someone else to pay.",
  },
  {
    n: "03",
    title: "Verify",
    body: "Track the transaction on the public explorer. Keel does not invent confirmations.",
  },
];

const faqs = [
  {
    q: "What is Keel?",
    a: "Keel is an independent, non-custodial payment app. You connect a wallet, send or request assets, and confirm every transfer yourself.",
  },
  {
    q: "Does Keel hold my assets?",
    a: "No. Transfers go directly from your wallet to the recipient. Keel does not take custody and does not add a platform fee.",
  },
  {
    q: "Which network does it use?",
    a: `The default network is ${networkName()}, chain id ${chainId}. ETH is the gas token. Keel is not a Robinhood product.`,
  },
  {
    q: "Is this connected to X or X Money?",
    a: "No. Keel does not connect X accounts, and it does not claim an X payment integration.",
  },
  {
    q: "Where is the token?",
    a: "The contract address is published only after deployment. Until then, Keel shows that the address is unpublished. It does not invent a price, supply, or holder count.",
  },
  {
    q: "What does a payment cost?",
    a: "You pay the network fee in ETH. Keel estimates it when it can, and your wallet shows the fee before you sign.",
  },
  {
    q: "What if a payment request expires?",
    a: "The request page says it expired. Keel will not mark it paid after that, even if a transfer is later sent outside the request.",
  },
  {
    q: "Can I see the transaction on a block explorer?",
    a: "Yes. After your wallet submits a transaction, Keel links to the public explorer. A missing link means the transfer was not broadcast.",
  },
];

export function HomePage({
  blockNumber,
  chainOk,
  chainMessage,
}: {
  blockNumber: string | null;
  chainOk: boolean;
  chainMessage: string | null;
}) {
  return (
    <div>
      <section className="mx-auto grid max-w-6xl items-end gap-12 px-5 pt-16 pb-20 md:grid-cols-[1.15fr_0.85fr] md:pt-24">
        <div className="rise">
          <p className="text-xs tracking-[0.18em] text-muted uppercase">Independent payment app</p>
          <h1 className="mt-4 max-w-xl font-serif text-[3.2rem] leading-[0.95] tracking-tight text-balance sm:text-7xl">
            Payments, Built Onchain.
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-muted">
            Send, receive and manage digital assets through a simple, transparent payment experience.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href="/app">Launch App</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/token">Explore Token</Link>
            </Button>
          </div>
          <p className="mt-6 max-w-md text-sm leading-6 text-muted">
            Non-custodial. You approve every transfer in your wallet. {independenceStatement}
          </p>
        </div>
        <div className="rounded-[28px] border border-line bg-elev p-5 shadow-[var(--shadow)]">
          <div className="flex items-center justify-between text-xs tracking-[0.14em] text-muted uppercase">
            <span>Interface preview</span>
            <span>Not live balances</span>
          </div>
          <div className="mt-6 rounded-3xl border border-line bg-bg p-5">
            <p className="text-sm text-muted">Review</p>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted">To</dt>
                <dd>Connect wallet to view live data</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Asset</dt>
                <dd>ETH</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Network</dt>
                <dd>
                  {networkName()} · {chainId}
                  {isTestnet ? " · Testnet" : ""}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted">Fee</dt>
                <dd>Estimated in your wallet</dd>
              </div>
            </dl>
            <div className="mt-6 rounded-2xl bg-ink px-4 py-3 text-center text-sm text-bg">
              No simulated confirmation
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted">
            {chainOk && blockNumber
              ? `Public RPC responded. Latest block ${blockNumber}.`
              : chainMessage || "Live data unavailable."}{" "}
            This number is a chain head, not payment volume.
          </p>
        </div>
      </section>

      <section id="product" className="border-y border-line">
        <div className="mx-auto grid max-w-6xl gap-px bg-line md:grid-cols-3">
          {[
            ["What you can do", "Send, receive, and request assets you already control."],
            ["What you need", "A compatible EVM wallet and ETH for the network fee."],
            ["How settlement works", "The transfer is signed in your wallet and checked onchain."],
          ].map(([title, body]) => (
            <div key={title} className="bg-bg px-5 py-8">
              <h2 className="font-serif text-3xl tracking-tight">{title}</h2>
              <p className="mt-3 text-sm leading-6 text-muted">{body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-6xl px-5 py-20">
        <p className="text-xs tracking-[0.18em] text-muted uppercase">How it works</p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <article key={step.n} className="relative rounded-3xl border border-line bg-elev p-6">
              <p className="font-mono text-xs text-accent">{step.n}</p>
              <h3 className="mt-4 font-serif text-4xl tracking-tight">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="payments" className="mx-auto grid max-w-6xl gap-6 px-5 pb-20 md:grid-cols-2">
        <article className="rounded-[28px] border border-line bg-elev p-7">
          <p className="text-xs tracking-[0.18em] text-muted uppercase">Send</p>
          <h2 className="mt-3 font-serif text-4xl tracking-tight">A review before the wallet opens.</h2>
          <ol className="mt-6 space-y-3 text-sm leading-6 text-muted">
            <li>1. Choose a recipient and an asset.</li>
            <li>2. Add an optional note. Notes stay in Keel. They are not written into the transfer.</li>
            <li>3. Review the network and the fee estimate.</li>
            <li>4. Confirm in your wallet. Keel then waits for the chain.</li>
          </ol>
        </article>
        <article id="wallet" className="rounded-[28px] border border-line bg-elev p-7">
          <p className="text-xs tracking-[0.18em] text-muted uppercase">Receive</p>
          <h2 className="mt-3 font-serif text-4xl tracking-tight">An address, a QR code, or a payment link.</h2>
          <p className="mt-6 text-sm leading-6 text-muted">
            Your receive screen shows the connected wallet address. A payment link stores the amount, asset, and optional note in Keel, then shows whether that request is open, paid, or expired. Paid means a matching transaction was found on the configured network.
          </p>
          <Button asChild className="mt-6" variant="outline">
            <Link href="/app/pay">Open payments</Link>
          </Button>
        </article>
      </section>

      <section id="token" className="border-y border-line bg-elev/60">
        <div className="mx-auto grid max-w-6xl gap-8 px-5 py-20 md:grid-cols-[1fr_1fr] md:items-center">
          <div>
            <p className="text-xs tracking-[0.18em] text-muted uppercase">Token</p>
            <h2 className="mt-3 font-serif text-5xl tracking-tight">An ecosystem asset, published when it exists.</h2>
            <p className="mt-4 text-sm leading-6 text-muted">
              Keel can read a token contract after the operator sets its address. Until that address is configured, the token page says the contract will be published after deployment. There is no price target and no claim screen.
            </p>
          </div>
          <div className="rounded-3xl border border-line bg-bg p-6">
            <dl className="space-y-4 text-sm">
              <div className="flex justify-between gap-4"><dt className="text-muted">Name</dt><dd>Keel</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted">Symbol</dt><dd>KEEL</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted">Network</dt><dd>{networkName()}</dd></div>
              <div className="flex justify-between gap-4"><dt className="text-muted">Contract</dt><dd className="text-right">Published after deployment</dd></div>
            </dl>
            <Button asChild className="mt-6 w-full">
              <Link href="/token">View token</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="merchant" className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-start">
          <div>
            <p className="text-xs tracking-[0.18em] text-muted uppercase">Merchants</p>
            <h2 className="mt-3 font-serif text-5xl tracking-tight">Invoices only after a real request exists.</h2>
          </div>
          <div className="space-y-4 text-sm leading-7 text-muted">
            <p>
              A merchant profile is a name tied to the signed-in wallet. Invoices are payment requests. Confirmed totals add up only those requests whose payment was matched onchain.
            </p>
            <p>If nothing has been paid, the dashboard says so. It does not fill the gap with sample revenue.</p>
            <Button asChild variant="outline">
              <Link href="/app/merchant">Merchant tools</Link>
            </Button>
          </div>
        </div>
      </section>

      <section id="security" className="border-y border-line">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <p className="text-xs tracking-[0.18em] text-muted uppercase">Security</p>
          <h2 className="mt-3 max-w-2xl font-serif text-5xl tracking-tight">You sign. The chain settles. Keel does not hold the key.</h2>
          <ul className="mt-8 grid gap-3 text-sm md:grid-cols-2">
            {[
              "Wallet signatures for sign-in. No seed phrase field.",
              "Direct transfers. No custody contract in this version.",
              "Chain id is checked before a payment is marked complete.",
              "Payment notes are app records, labeled as such.",
              "Demo activity stays on your device and is labeled simulated.",
              "Admin access requires a server secret. There is no default password.",
            ].map((item) => (
              <li key={item} className="rounded-2xl border border-line bg-elev px-4 py-4">{item}</li>
            ))}
          </ul>
          <Button asChild variant="outline" className="mt-6">
            <Link href="/security">Security notes</Link>
          </Button>
        </div>
      </section>

      <section id="technology" className="mx-auto max-w-6xl px-5 py-20">
        <p className="text-xs tracking-[0.18em] text-muted uppercase">Technology</p>
        <h2 className="mt-3 font-serif text-5xl tracking-tight">A small stack with a hard line around live data.</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <article className="rounded-3xl border border-line p-5">
            <h3 className="font-medium">Wallet and chain</h3>
            <p className="mt-2 text-sm leading-6 text-muted">wagmi and viem talk to an injected EVM wallet. The public RPC is the default read endpoint and is rate-limited.</p>
          </article>
          <article className="rounded-3xl border border-line p-5">
            <h3 className="font-medium">Records</h3>
            <p className="mt-2 text-sm leading-6 text-muted">Payment requests, usernames, and verified transfers are stored in SQLite on this deployment. They are reconciled against the chain before a request is marked paid.</p>
          </article>
          <article className="rounded-3xl border border-line p-5">
            <h3 className="font-medium">What is not included</h3>
            <p className="mt-2 text-sm leading-6 text-muted">Swap, rewards, and a historical indexer are marked coming soon. They are not simulated as successful.</p>
          </article>
        </div>
        <p className="mt-6 font-mono text-xs leading-6 break-all text-muted">
          {networkName()} · chain {chainId} · RPC {publicRpcUrl} · Explorer {explorerUrl}
        </p>
        <Button asChild variant="ghost" className="mt-4 px-0">
          <Link href="/technology">Read the architecture</Link>
        </Button>
      </section>

      <section id="roadmap" className="border-t border-line">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 md:grid-cols-2">
          <div>
            <p className="text-xs tracking-[0.18em] text-muted uppercase">Roadmap</p>
            <h2 className="mt-3 font-serif text-5xl tracking-tight">Shipped is labeled shipped.</h2>
          </div>
          <div className="space-y-6 text-sm leading-7">
            <p><span className="font-medium">Available now.</span> Wallet connection, ETH transfers, payment links, QR codes, receipt checks, merchant records, and a token page that waits for a real contract.</p>
            <p><span className="font-medium">Coming soon.</span> Swap, rewards, WalletConnect when a project id is configured, and an indexer for older history.</p>
            <Link href="/roadmap" className="inline-block text-accent">Full roadmap</Link>
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-3xl px-5 py-20">
        <h2 className="font-serif text-5xl tracking-tight">Questions</h2>
        <div className="mt-8 divide-y divide-line border-y border-line">
          {faqs.map((item) => (
            <details key={item.q} className="group py-4">
              <summary className="cursor-pointer list-none font-medium">{item.q}</summary>
              <p className="mt-2 text-sm leading-6 text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}
