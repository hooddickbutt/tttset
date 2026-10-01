"use client";

import { useQuery } from "@tanstack/react-query";
import { erc20Abi, isAddress } from "viem";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  useAccount,
  useChainId,
  usePublicClient,
  useSendTransaction,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useAssetBalance } from "@/components/app/use-asset-balance";
import { CopyButton, Qr } from "@/components/app/qr";
import { saveDemoTx, useDemoMode } from "@/components/app/demo";
import { useWalletSession } from "@/components/app/use-session";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { formatAmount, parseAmount, shortAddress } from "@/lib/format";
import { chainId as expectedChainId, explorerTx, keelChain, networkName, tokenSymbol } from "@/lib/network";

type RequestPayload = {
  id: string;
  recipient: `0x${string}`;
  assetKind: "native" | "erc20";
  assetSymbol: string;
  assetAddress: `0x${string}` | null;
  amount: string;
  amountBase: string;
  decimals: number;
  message: string | null;
  status: "open" | "paid" | "expired";
  chainId: number;
};

type TokenMeta = {
  configured?: boolean;
  readable?: boolean;
  address?: `0x${string}`;
  symbol?: string;
  decimals?: number;
  message?: string;
};

export function PayPanel({ initialMode }: { initialMode: "send" | "receive" }) {
  const [mode, setMode] = useState(initialMode);
  return (
    <div className="mx-auto max-w-xl">
      <div className="flex rounded-full border border-line p-1">
        <Tab active={mode === "send"} onClick={() => setMode("send")}>
          Send
        </Tab>
        <Tab active={mode === "receive"} onClick={() => setMode("receive")}>
          Receive
        </Tab>
      </div>
      <div className="mt-6">{mode === "send" ? <SendForm /> : <ReceiveForm />}</div>
    </div>
  );
}

function Tab({ active, onClick, children }: { active: boolean; onClick: () => void; children: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-10 flex-1 rounded-full text-sm ${active ? "bg-ink text-bg" : "text-muted"}`}
    >
      {children}
    </button>
  );
}

function SendForm() {
  const requestId = useSearchParams().get("request");
  const session = useWalletSession();
  const { address, isConnected } = useAccount();
  const walletChainId = useChainId();
  const client = usePublicClient({ chainId: keelChain.id });
  const send = useSendTransaction();
  const write = useWriteContract();
  const demoOn = useDemoMode();
  const tokenQuery = useQuery({
    queryKey: ["token-meta"],
    queryFn: async () => (await fetch("/api/token")).json() as Promise<TokenMeta>,
  });
  const requestQuery = useQuery({
    queryKey: ["payment-request", requestId],
    enabled: Boolean(requestId),
    queryFn: async () => {
      const response = await fetch(`/api/requests/${requestId}`);
      const body = (await response.json()) as { request?: RequestPayload; error?: string };
      if (!response.ok || !body.request) throw new Error(body.error || "Payment request not found.");
      return body.request;
    },
  });
  const token = tokenQuery.data ?? null;
  const request = requestQuery.data ?? null;
  const requestError = requestQuery.error instanceof Error ? requestQuery.error.message : null;
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [asset, setAsset] = useState<"native" | "erc20">("native");
  const [note, setNote] = useState("");
  const [phase, setPhase] = useState<"edit" | "review" | "signing">("edit");
  const [error, setError] = useState<string | null>(null);
  const [fee, setFee] = useState<string | null>(null);
  const [hash, setHash] = useState<`0x${string}` | undefined>();
  const [demoResult, setDemoResult] = useState<string | null>(null);
  const locked = Boolean(request);
  const toValue = locked && request ? request.recipient : to;
  const amountValue = locked && request ? request.amount : amount;
  const assetValue = locked && request ? request.assetKind : asset;
  const noteValue = locked && request ? request.message || "" : note;
  const decimals = assetValue === "native" ? 18 : request?.decimals ?? token?.decimals ?? 18;
  const symbol = assetValue === "native" ? "ETH" : request?.assetSymbol || token?.symbol || tokenSymbol;
  const balance = useAssetBalance(address, assetValue, assetValue === "erc20" ? token?.address : undefined);
  const receipt = useWaitForTransactionReceipt({
    hash,
    chainId: keelChain.id,
    query: { enabled: Boolean(hash) && !demoResult },
  });
  const chainPhase = demoResult
    ? "confirmed"
    : receipt.data?.status === "success"
      ? "confirmed"
      : receipt.data?.status === "reverted" || receipt.isError
        ? "failed"
        : hash
          ? "pending"
          : phase;

  useEffect(() => {
    if (!hash || !receipt.data) return;
    const endpoint = request?.id ? `/api/requests/${request.id}/verify` : "/api/transactions";
    void fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ hash, note: noteValue }),
    });
  }, [hash, receipt.data, request?.id, noteValue]);

  const parsed = useMemo(() => parseAmount(amountValue || "0", decimals), [amountValue, decimals]);

  async function review() {
    setError(null);
    setDemoResult(null);
    if (!isConnected || !address) {
      setError("Connect wallet to continue.");
      return;
    }
    if (walletChainId !== expectedChainId) {
      setError(`Switch to ${networkName()} before sending.`);
      return;
    }
    if (request && request.status !== "open") {
      setError(request.status === "paid" ? "Payment completed." : "Payment request expired.");
      return;
    }
    if (request && request.chainId !== expectedChainId) {
      setError("This request was created for a different network.");
      return;
    }
    if (!isAddress(toValue)) {
      setError("Enter a valid wallet address.");
      return;
    }
    if (assetValue === "erc20" && !token?.readable && !request?.assetAddress) {
      setError(token?.message || "Token contract address will be published after deployment.");
      return;
    }
    const next = parseAmount(amountValue, decimals);
    if (!next.ok) {
      setError(next.error);
      return;
    }
    setPhase("review");
    setFee(null);
    if (!client) {
      setFee(null);
      return;
    }
    try {
      const recipient = toValue as `0x${string}`;
      const tokenAddress = request?.assetAddress || token?.address;
      const gas =
        assetValue === "native"
          ? await client.estimateGas({ account: address, to: recipient, value: next.base })
          : await client.estimateContractGas({
              address: tokenAddress!,
              abi: erc20Abi,
              functionName: "transfer",
              args: [recipient, next.base],
              account: address,
            });
      const fees = await client.estimateFeesPerGas();
      const unit = fees.maxFeePerGas ?? fees.gasPrice ?? 0n;
      setFee(formatAmount(gas * unit, 18));
    } catch {
      setFee(null);
    }
  }

  async function confirm() {
    if (!address || !parsed.ok || !isAddress(toValue)) return;
    if (demoOn) {
      const id = `demo-${crypto.randomUUID()}`;
      saveDemoTx({
        id,
        to: toValue,
        amount: amountValue,
        symbol,
        note: noteValue,
        createdAt: new Date().toISOString(),
      });
      setDemoResult(id);
      return;
    }
    setPhase("signing");
    setError(null);
    try {
      const recipient = toValue as `0x${string}`;
      const tokenAddress = request?.assetAddress || token?.address;
      const txHash =
        assetValue === "native"
          ? await send.mutateAsync({ to: recipient, value: parsed.base, chainId: keelChain.id })
          : await write.mutateAsync({
              address: tokenAddress!,
              abi: erc20Abi,
              functionName: "transfer",
              args: [recipient, parsed.base],
              chainId: keelChain.id,
            });
      setHash(txHash);
    } catch {
      setPhase("review");
      setError("The wallet rejected the request or the network did not accept it.");
    }
  }

  return (
    <section className="rounded-[28px] border border-line bg-elev p-5">
      <h1 className="font-serif text-4xl tracking-tight">Send</h1>
      <p className="mt-2 text-sm leading-6 text-muted">
        Review the transfer here, then confirm it in your wallet. Keel does not take a fee.
      </p>
      {request ? (
        <p className="mt-4 rounded-2xl bg-bg px-3 py-3 text-sm">
          Payment request {request.id} · {request.status === "open" ? "Open" : request.status === "paid" ? "Payment completed." : "Payment request expired."}
        </p>
      ) : null}
      {requestError ? <p className="mt-4 text-sm text-bad">{requestError}</p> : null}

      <label className="mt-5 block text-sm">
        Recipient
        <Input className="mt-2 font-mono text-sm" value={toValue} disabled={locked || chainPhase !== "edit"} onChange={(event) => setTo(event.target.value.trim())} placeholder="0x" />
      </label>
      <label className="mt-4 block text-sm">
        Amount
        <Input className="mt-2" inputMode="decimal" value={amountValue} disabled={locked || chainPhase !== "edit"} onChange={(event) => setAmount(event.target.value)} placeholder="0.00" />
      </label>
      <label className="mt-4 block text-sm">
        Asset
        <select
          className="mt-2 h-12 w-full rounded-2xl border border-line bg-bg px-4"
          value={assetValue}
          disabled={locked || chainPhase !== "edit"}
          onChange={(event) => setAsset(event.target.value as "native" | "erc20")}
        >
          <option value="native">ETH</option>
          <option value="erc20">{token?.symbol || tokenSymbol}</option>
        </select>
      </label>
      <label className="mt-4 block text-sm">
        Note, optional
        <Textarea className="mt-2" maxLength={280} value={noteValue} disabled={locked || chainPhase !== "edit"} onChange={(event) => setNote(event.target.value)} placeholder="Stored in Keel, not written onchain." />
      </label>
      <p className="mt-3 text-xs leading-5 text-muted">The note is an app record. It is not part of the blockchain transfer.</p>

      <div className="mt-4 text-sm">
        {!isConnected ? (
          <p>Connect wallet to view live data.</p>
        ) : balance.isLoading ? (
          <p>Reading balances from the network…</p>
        ) : balance.isError || balance.data == null ? (
          <p>Live data unavailable.</p>
        ) : (
          <p>
            Wallet balance: {formatAmount(balance.data.value, balance.data.decimals)} {balance.data.symbol}
          </p>
        )}
      </div>

      {chainPhase === "edit" ? (
        <Button type="button" className="mt-5 w-full" onClick={() => void review()}>
          Review
        </Button>
      ) : null}

      {chainPhase !== "edit" && !demoResult ? (
        <div className="mt-5 rounded-3xl border border-line bg-bg p-4 text-sm">
          <p className="text-xs tracking-[0.14em] text-muted uppercase">{statusLabel(chainPhase)}</p>
          <dl className="mt-3 space-y-2">
            <div className="flex justify-between gap-3"><dt className="text-muted">To</dt><dd className="font-mono">{isAddress(toValue) ? shortAddress(toValue) : toValue}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">Amount</dt><dd>{amountValue} {symbol}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">Network</dt><dd>{networkName()} · {expectedChainId}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-muted">Network fee</dt><dd>{fee ? `About ${fee} ETH` : "Fee estimate unavailable. Your wallet will show the network fee before you confirm."}</dd></div>
          </dl>
          {chainPhase === "review" ? (
            <div className="mt-4 flex gap-2">
              <Button type="button" variant="outline" onClick={() => setPhase("edit")}>Back</Button>
              <Button type="button" onClick={() => void confirm()}>{demoOn ? "Simulate transfer" : "Confirm in wallet"}</Button>
            </div>
          ) : null}
          {hash ? (
            <p className="mt-4">
              <a className="text-accent" href={explorerTx(hash)} target="_blank" rel="noreferrer">
                View transaction
              </a>
            </p>
          ) : null}
        </div>
      ) : null}

      {demoResult ? (
        <div className="mt-5 rounded-3xl border border-warn bg-warn/10 p-4">
          <p className="text-xs tracking-[0.14em] uppercase">Demo transaction</p>
          <p className="mt-2 text-sm leading-6">This transaction is simulated and has not been broadcast to the blockchain.</p>
          <p className="mt-2 font-mono text-xs">Simulation id {demoResult}</p>
          <Button type="button" variant="outline" className="mt-4" onClick={() => { setDemoResult(null); setPhase("edit"); }}>
            Close simulation
          </Button>
        </div>
      ) : null}

      {error ? <p className="mt-4 text-sm text-bad">{error}</p> : null}
      {session.error ? <p className="mt-2 text-sm text-bad">{session.error}</p> : null}
    </section>
  );
}

function statusLabel(phase: "edit" | "review" | "signing" | "pending" | "confirmed" | "failed") {
  if (phase === "signing") return "Awaiting signature";
  if (phase === "pending") return "Pending";
  if (phase === "confirmed") return "Confirmed";
  if (phase === "failed") return "Failed";
  return "Preparing";
}

function ReceiveForm() {
  const session = useWalletSession();
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [hours, setHours] = useState("72");
  const [asset, setAsset] = useState<"native" | "erc20">("native");
  const [error, setError] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const address = session.address;
  const personal = address ? `ethereum:${address}@${expectedChainId}` : "";

  async function createRequest() {
    setError(null);
    setLink(null);
    if (!session.isConnected) {
      setError("Connect wallet to continue.");
      return;
    }
    if (!session.matches) {
      await session.signIn();
      return;
    }
    setBusy(true);
    const response = await fetch("/api/requests", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        asset,
        amount,
        message: note,
        expiresInHours: hours ? Number(hours) : undefined,
        kind: "request",
      }),
    });
    const body = (await response.json()) as { request?: { id: string }; error?: string };
    setBusy(false);
    if (!response.ok || !body.request) {
      setError(body.error || "The payment request was not created.");
      return;
    }
    setLink(`${window.location.origin}/request/${body.request.id}`);
  }

  return (
    <section className="rounded-[28px] border border-line bg-elev p-5">
      <h1 className="font-serif text-4xl tracking-tight">Receive</h1>
      {!session.isConnected || !address ? (
        <p className="mt-4 text-sm leading-6 text-muted">Connect wallet to view your address.</p>
      ) : (
        <>
          <p className="mt-4 font-mono text-sm break-all">{address}</p>
          <CopyButton value={address} label="Copy address" />
          <div className="mt-5">
            <Qr value={personal} label="Personal QR. It encodes this address on the configured chain." />
          </div>
          <div className="mt-8 border-t border-line pt-6">
            <h2 className="font-serif text-2xl">Payment link</h2>
            <p className="mt-2 text-sm leading-6 text-muted">
              A link stores the request in this deployment. Creating one requires a sign-in signature, which does not spend funds.
            </p>
            {!session.matches ? (
              <Button type="button" className="mt-4" onClick={() => void session.signIn()} disabled={session.signing}>
                {session.signing ? "Waiting for wallet" : "Sign in with wallet"}
              </Button>
            ) : null}
            <label className="mt-4 block text-sm">
              Amount
              <Input className="mt-2" inputMode="decimal" value={amount} onChange={(event) => setAmount(event.target.value)} />
            </label>
            <label className="mt-4 block text-sm">
              Asset
              <select className="mt-2 h-12 w-full rounded-2xl border border-line bg-bg px-4" value={asset} onChange={(event) => setAsset(event.target.value as "native" | "erc20")}>
                <option value="native">ETH</option>
                <option value="erc20">{tokenSymbol}</option>
              </select>
            </label>
            <label className="mt-4 block text-sm">
              Note, optional
              <Textarea className="mt-2" maxLength={280} value={note} onChange={(event) => setNote(event.target.value)} />
            </label>
            <label className="mt-4 block text-sm">
              Expires in hours
              <Input className="mt-2" inputMode="numeric" value={hours} onChange={(event) => setHours(event.target.value)} />
            </label>
            <Button type="button" className="mt-4 w-full" disabled={busy} onClick={() => void createRequest()}>
              {busy ? "Creating" : session.matches ? "Create payment link" : "Sign in, then create"}
            </Button>
            {link ? (
              <div className="mt-5">
                <p className="font-mono text-xs break-all">{link}</p>
                <CopyButton value={link} label="Copy payment link" />
                <div className="mt-4">
                  <Qr value={link} label="Payment-request QR. It encodes this Keel payment link." />
                </div>
              </div>
            ) : null}
          </div>
        </>
      )}
      {session.error ? <p className="mt-4 text-sm text-bad">{session.error}</p> : null}
      {error ? <p className="mt-4 text-sm text-bad">{error}</p> : null}
    </section>
  );
}
