import assert from "node:assert/strict";
import test from "node:test";
import { formatAmount, parseAmount, requestStatus } from "../src/lib/format.ts";
import { sessionMessage } from "../src/lib/messages.ts";
import { validateUsername } from "../src/lib/username.ts";
import { matchTransfer, type ObservedTx } from "../src/lib/verify-payment.ts";

const tx = (overrides: Partial<ObservedTx> = {}): ObservedTx => ({
  hash: "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
  from: "0x1111111111111111111111111111111111111111",
  to: "0x2222222222222222222222222222222222222222",
  value: 1500000000000000000n,
  input: "0x",
  status: "success",
  chainId: 4663,
  ...overrides,
});

test("parseAmount rejects empty, zero, and extra decimals", () => {
  assert.equal(parseAmount("", 18).ok, false);
  assert.equal(parseAmount("0", 18).ok, false);
  assert.equal(parseAmount("1.000", 2).ok, false);
  const parsed = parseAmount("1.5", 18);
  assert.equal(parsed.ok, true);
  if (parsed.ok) assert.equal(parsed.base, 1500000000000000000n);
});

test("formatAmount trims trailing zeros", () => {
  assert.equal(formatAmount(1500000000000000000n, 18), "1.5");
  assert.equal(formatAmount(2000000000000000000n, 18), "2");
});

test("request status expires without rewriting paid", () => {
  assert.equal(requestStatus({ status: "paid", expires_at: "2000-01-01T00:00:00.000Z" }), "paid");
  assert.equal(requestStatus({ status: "open", expires_at: "2000-01-01T00:00:00.000Z" }), "expired");
  assert.equal(requestStatus({ status: "open", expires_at: null }), "open");
});

test("usernames stay plain", () => {
  assert.equal(validateUsername("Alex_1").ok, true);
  assert.equal(validateUsername("keel").ok, false);
  assert.equal(validateUsername("ab").ok, false);
});

test("native payments must match recipient, amount, and success", () => {
  const expected = {
    chainId: 4663,
    kind: "native" as const,
    to: "0x2222222222222222222222222222222222222222" as const,
    amountBase: 1500000000000000000n,
  };
  assert.equal(matchTransfer(expected, tx()).ok, true);
  assert.equal(matchTransfer(expected, tx({ status: "pending" })).ok, false);
  assert.equal(matchTransfer(expected, tx({ value: 1n })).ok, false);
  assert.equal(matchTransfer(expected, tx({ chainId: 1 })).ok, false);
});

test("sign-in copy does not ask for a secret", () => {
  const message = sessionMessage({
    origin: "http://127.0.0.1:43123",
    address: "0x2222222222222222222222222222222222222222",
    nonce: "abc",
    issuedAt: "2026-10-01T00:00:00.000Z",
    expiration: "2026-10-01T00:10:00.000Z",
  });
  assert.match(message, /does not spend funds/);
  assert.doesNotMatch(message, /seed|password/i);
});
