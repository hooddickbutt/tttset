import { formatUnits, getAddress, isAddress } from "viem";

export function shortAddress(value: string, size = 4) {
  if (!value) return "";
  if (value.length <= size * 2 + 2) return value;
  return `${value.slice(0, size + 2)}…${value.slice(-size)}`;
}

export function checksum(value: string) {
  return isAddress(value) ? getAddress(value) : value;
}

export function formatAmount(value: bigint, decimals: number) {
  const raw = formatUnits(value, decimals);
  if (!raw.includes(".")) return raw;
  const [whole, fraction] = raw.split(".");
  const trimmed = fraction.replace(/0+$/, "").slice(0, 6);
  return trimmed ? `${whole}.${trimmed}` : whole;
}

export function formatWhen(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

const AMOUNT_PATTERN = /^\d+(\.\d+)?$/;

export function parseAmount(input: string, decimals: number) {
  const value = input.trim();
  if (!AMOUNT_PATTERN.test(value)) {
    return { ok: false as const, error: "Enter an amount using numbers only." };
  }
  const [, fraction = ""] = value.split(".");
  if (fraction.length > decimals) {
    return {
      ok: false as const,
      error: `This asset supports up to ${decimals} decimal places.`,
    };
  }
  const [whole, frac = ""] = value.split(".");
  const base = BigInt(whole) * 10n ** BigInt(decimals) + BigInt((frac + "0".repeat(decimals)).slice(0, decimals) || "0");
  if (base <= 0n) {
    return { ok: false as const, error: "Enter an amount greater than zero." };
  }
  return { ok: true as const, base, display: value };
}

export function requestStatus(
  row: { status: string; expires_at: string | null },
  now = Date.now(),
) {
  if (row.status === "paid") return "paid" as const;
  if (row.expires_at && Date.parse(row.expires_at) <= now) return "expired" as const;
  return "open" as const;
}
