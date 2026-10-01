"use client";

import { useState } from "react";
import { useAccount, useWatchAsset } from "wagmi";
import { Button } from "@/components/ui/button";

export function AddTokenButton({
  address,
  symbol,
  decimals,
}: {
  address?: `0x${string}`;
  symbol?: string;
  decimals?: number;
}) {
  const { isConnected } = useAccount();
  const watch = useWatchAsset();
  const [message, setMessage] = useState<string | null>(null);

  if (!address || !symbol || decimals == null) {
    return (
      <Button type="button" variant="outline" disabled>
        Add to wallet
      </Button>
    );
  }

  return (
    <div>
      <Button
        type="button"
        variant="outline"
        disabled={!isConnected || watch.isPending}
        onClick={() => {
          setMessage(null);
          watch.mutate(
            { type: "ERC20", options: { address, symbol, decimals } },
            {
              onSuccess: () => setMessage("The wallet accepted the asset request."),
              onError: () => setMessage("The wallet did not add the asset."),
            },
          );
        }}
      >
        Add to wallet
      </Button>
      {!isConnected ? <p className="mt-2 text-xs text-muted">Connect wallet to view live data.</p> : null}
      {message ? <p className="mt-2 text-xs text-muted">{message}</p> : null}
    </div>
  );
}
