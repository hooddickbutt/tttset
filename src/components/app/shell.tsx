"use client";

import { ArrowLeftRight, Home, Receipt, UserRound, Wallet } from "lucide-react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAccount, useChainId } from "wagmi";
import { Logo } from "@/components/brand/logo";
import { ConnectButton } from "@/components/app/connect-button";
import { useDemoMode } from "@/components/app/demo";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { chainId as expectedChainId, isTestnet, networkName } from "@/lib/network";

const primary = [
  { href: "/app", label: "Home", icon: Home },
  { href: "/app/pay", label: "Pay", icon: ArrowLeftRight },
  { href: "/app/wallet", label: "Wallet", icon: Wallet },
  { href: "/app/activity", label: "Activity", icon: Receipt },
  { href: "/app/profile", label: "Profile", icon: UserRound },
];

const extra = [
  { href: "/app/receive", label: "Receive" },
  { href: "/app/requests", label: "Requests" },
  { href: "/app/merchant", label: "Merchant" },
  { href: "/app/swap", label: "Swap" },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isConnected } = useAccount();
  const walletChainId = useChainId();
  const demo = useDemoMode();

  return (
    <div className="min-h-full md:grid md:grid-cols-[240px_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col border-r border-line px-4 py-5 md:flex">
        <Link href="/" aria-label="Keel home">
          <Logo />
        </Link>
        <p className="mt-3 text-xs leading-5 text-muted">Independent app. Not affiliated with Robinhood.</p>
        <nav className="mt-8 flex flex-col gap-1" aria-label="Application">
          {primary.map((item) => (
            <ShellLink key={item.href} href={item.href} active={isActive(pathname, item.href)}>
              {item.label}
            </ShellLink>
          ))}
          <div className="my-3 h-px bg-line" />
          {extra.map((item) => (
            <ShellLink key={item.href} href={item.href} active={isActive(pathname, item.href)}>
              {item.label}
            </ShellLink>
          ))}
        </nav>
      </aside>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-line bg-bg/90 px-4 backdrop-blur md:px-6">
          <Link href="/" className="md:hidden" aria-label="Keel home">
            <Logo compact />
          </Link>
          <p className="hidden text-sm text-muted md:block">
            {networkName()} · {expectedChainId}
            {isTestnet ? " · Testnet" : ""}
          </p>
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <ConnectButton />
          </div>
        </header>
        {demo ? (
          <p className="bg-warn/15 px-4 py-2 text-center text-sm text-warn">
            DEMO MODE. Simulated records stay on this device and are not broadcast to the blockchain.
          </p>
        ) : null}
        {isTestnet ? (
          <p className="bg-accent-soft px-4 py-2 text-center text-sm">
            Testnet. Balances and transfers on this network are not mainnet assets.
          </p>
        ) : null}
        {isConnected && walletChainId !== expectedChainId ? (
          <p className="bg-bad/10 px-4 py-2 text-center text-sm text-bad">
            This wallet is on chain {walletChainId}. Switch to {networkName()} ({expectedChainId}) before sending.
          </p>
        ) : null}
        <div id="content" className="flex-1 px-4 pt-6 pb-28 md:px-8 md:pb-10">
          {children}
        </div>
      </div>
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-bg/95 backdrop-blur md:hidden" aria-label="Mobile">
        <ul className="grid grid-cols-5 px-2 py-2">
          {primary.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-2xl py-2 text-[11px]",
                    item.label === "Pay" && "-mt-4",
                    active ? "text-ink" : "text-muted",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-full",
                      item.label === "Pay" ? "bg-ink text-bg" : active ? "bg-ink/8" : "",
                    )}
                  >
                    <Icon className="size-4" />
                  </span>
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );
}

function ShellLink({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={cn("rounded-full px-3 py-2 text-sm", active ? "bg-ink text-bg" : "text-muted hover:bg-ink/5 hover:text-ink")}
    >
      {children}
    </Link>
  );
}

function isActive(pathname: string, href: string) {
  if (href === "/app") return pathname === "/app";
  if (href === "/app/pay") return pathname === "/app/pay" || pathname === "/app/receive";
  return pathname === href || pathname.startsWith(`${href}/`);
}
