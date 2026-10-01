"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useAccount, useSignMessage } from "wagmi";

type SessionPayload = { address: string | null; username: string | null };

export function useWalletSession() {
  const { address, isConnected } = useAccount();
  const sign = useSignMessage();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const session = useQuery({
    queryKey: ["keel-session"],
    queryFn: async () => {
      const response = await fetch("/api/session");
      return (await response.json()) as SessionPayload;
    },
  });

  const sessionAddress = session.data?.address ?? null;
  const username = session.data?.username ?? null;
  const matches = Boolean(
    address && sessionAddress && address.toLowerCase() === sessionAddress.toLowerCase(),
  );

  async function refresh() {
    await queryClient.invalidateQueries({ queryKey: ["keel-session"] });
  }

  async function signIn() {
    if (!address) return;
    setError(null);
    const nonce = await fetch("/api/session/nonce", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ address }),
    });
    const nonceBody = (await nonce.json()) as { message?: string; error?: string };
    if (!nonce.ok || !nonceBody.message) {
      setError(nonceBody.error || "Could not start sign-in.");
      return;
    }
    try {
      const signature = await sign.mutateAsync({ message: nonceBody.message });
      const response = await fetch("/api/session", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ address, message: nonceBody.message, signature }),
      });
      const body = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(body.error || "Sign-in failed.");
        return;
      }
      await refresh();
    } catch {
      setError("The wallet closed the sign-in request.");
    }
  }

  async function signOut() {
    await fetch("/api/session", { method: "DELETE" });
    await refresh();
  }

  return {
    address,
    isConnected,
    matches,
    username,
    ready: session.isFetched,
    error,
    signIn,
    signOut,
    refresh,
    signing: sign.isPending,
  };
}
