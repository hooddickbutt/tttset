import "server-only";

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getAddress, isAddress } from "viem";
import { getDb } from "@/lib/db";

const SESSION_COOKIE = "keel_session";
const ADMIN_COOKIE = "keel_admin";

function sessionSecret() {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  const db = getDb();
  const existing = db.prepare("SELECT value FROM settings WHERE key = ?").get("session_secret") as
    | { value: string }
    | undefined;
  if (existing?.value) return existing.value;
  const secret = randomBytes(32).toString("hex");
  db.prepare("INSERT INTO settings (key, value) VALUES (?, ?)").run("session_secret", secret);
  return secret;
}

function sign(payload: string, secret: string) {
  const body = Buffer.from(payload).toString("base64url");
  const mac = createHmac("sha256", secret).update(body).digest("base64url");
  return `${body}.${mac}`;
}

function unsign(token: string, secret: string) {
  const [body, mac] = token.split(".");
  if (!body || !mac) return null;
  const expected = createHmac("sha256", secret).update(body).digest("base64url");
  const a = Buffer.from(mac);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    return Buffer.from(body, "base64url").toString("utf8");
  } catch {
    return null;
  }
}

export function createSessionToken(address: string) {
  const payload = JSON.stringify({
    a: getAddress(address),
    e: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });
  return sign(payload, sessionSecret());
}

export function readSessionToken(token: string | undefined) {
  if (!token) return null;
  const raw = unsign(token, sessionSecret());
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { a?: string; e?: number };
    if (!parsed.a || !parsed.e || !isAddress(parsed.a) || parsed.e < Date.now()) return null;
    return getAddress(parsed.a);
  } catch {
    return null;
  }
}

export async function getSessionAddress() {
  const jar = await cookies();
  return readSessionToken(jar.get(SESSION_COOKIE)?.value);
}

export async function setSessionCookie(address: string) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, createSessionToken(address), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  });
}

export async function clearSessionCookie() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
}

export function adminConfigured() {
  return Boolean(process.env.ADMIN_SECRET);
}

export function createAdminToken() {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return null;
  return sign(JSON.stringify({ r: "admin", e: Date.now() + 12 * 60 * 60 * 1000 }), secret);
}

export function readAdminToken(token: string | undefined) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || !token) return false;
  const raw = unsign(token, secret);
  if (!raw) return false;
  try {
    const parsed = JSON.parse(raw) as { r?: string; e?: number };
    return parsed.r === "admin" && typeof parsed.e === "number" && parsed.e >= Date.now();
  } catch {
    return false;
  }
}

export async function setAdminCookie() {
  const token = createAdminToken();
  if (!token) return false;
  const jar = await cookies();
  jar.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 12 * 60 * 60,
  });
  return true;
}

export async function clearAdminCookie() {
  const jar = await cookies();
  jar.delete(ADMIN_COOKIE);
}

export async function isAdmin() {
  const jar = await cookies();
  return readAdminToken(jar.get(ADMIN_COOKIE)?.value);
}

export function passwordsMatch(input: string, secret: string) {
  const a = Buffer.from(input);
  const b = Buffer.from(secret);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
