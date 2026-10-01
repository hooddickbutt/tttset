"use client";

import { useState, useSyncExternalStore } from "react";
import { useAccount, useChainId, useConnect, useConnectors, useDisconnect, useSwitchChain } from "wagmi";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { shortAddress } from "@/lib/format";
import { chainId as expectedChainId, explorerUrl, keelChain, networkName, publicRpcUrl } from "@/lib/network";

export function ConnectButton() {
  const { address, isConnected } = useAccount();
  const walletChainId = useChainId();
  const connectors = useConnectors();
  const connect = useConnect();
  const disconnect = useDisconnect();
  const switchChain = useSwitchChain();
  const [open, setOpen] = useState(false);
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false);
  const [error, setError] = useState<string | null>(null);

  if (!mounted) {
    return (
      <Button type="button" disabled>
        Connect wallet
      </Button>
    );
  }

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        {walletChainId !== expectedChainId ? (
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => switchChain.mutate({ chainId: keelChain.id })}
          >
            Switch network
          </Button>
        ) : null}
        <Button type="button" size="sm" variant="outline" onClick={() => disconnect.mutate()}>
          {shortAddress(address)}
        </Button>
      </div>
    );
  }

  const hasInjected = typeof window !== "undefined" && "ethereum" in window;

  return (
    <>
      <Button type="button" onClick={() => setOpen(true)}>
        Connect wallet
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent title="Connect a wallet">
          <p className="text-sm leading-6 text-muted">
            Keel uses an injected EVM wallet. It never asks for your seed phrase or password. Connecting does not spend funds.
          </p>
          <div className="mt-4 flex flex-col gap-2">
            {connectors.map((connector) => (
              <Button
                key={connector.uid}
                type="button"
                variant="outline"
                disabled={connect.isPending}
                onClick={async () => {
                  setError(null);
                  try {
                    await connect.mutateAsync({ connector });
                    setOpen(false);
                  } catch {
                    setError("The wallet could not connect.");
                  }
                }}
              >
                {connector.name}
              </Button>
            ))}
          </div>
          {!hasInjected ? (
            <p className="mt-4 text-sm leading-6 text-muted">No injected wallet was found in this browser.</p>
          ) : null}
          <p className="mt-4 text-sm leading-6 text-muted">
            WalletConnect is not configured. Set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID before expecting a WalletConnect QR code. Keel will not show a placeholder code.
          </p>
          {error ? <p className="mt-3 text-sm text-bad">{error}</p> : null}
          <dl className="mt-5 space-y-2 font-mono text-[11px] leading-5 text-muted">
            <div>Network {networkName()}</div>
            <div>Chain id {expectedChainId}</div>
            <div className="break-all">RPC {publicRpcUrl}</div>
            <div>Symbol ETH</div>
            <div className="break-all">Explorer {explorerUrl}</div>
          </dl>
        </DialogContent>
      </Dialog>
    </>
  );
}
