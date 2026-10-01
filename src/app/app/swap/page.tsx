import type { Metadata } from "next";

export const metadata: Metadata = { title: "Swap" };

export default function SwapPage() {
  return (
    <div className="mx-auto max-w-xl">
      <p className="text-xs tracking-[0.18em] text-muted uppercase">Coming soon</p>
      <h1 className="mt-3 font-serif text-5xl tracking-tight">Swap integration coming soon.</h1>
      <p className="mt-4 text-sm leading-6 text-muted">
        Keel does not have a verified exchange route configured, so this screen cannot quote or submit a swap. It will not simulate a successful trade.
      </p>
    </div>
  );
}
