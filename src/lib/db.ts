import "server-only";

import fs from "node:fs";
import path from "node:path";
import { DatabaseSync } from "node:sqlite";

const globalForDb = globalThis as unknown as { keelDb?: DatabaseSync };

function databaseFile() {
  const configured = process.env.DATABASE_URL;
  if (configured === ":memory:") return ":memory:";
  if (configured?.startsWith("file:")) {
    const file = configured.slice("file:".length);
    return path.isAbsolute(file) ? file : path.join(process.cwd(), file);
  }
  return path.join(process.cwd(), "data", "keel.db");
}

function createDatabase() {
  const file = databaseFile();
  if (file !== ":memory:") {
    fs.mkdirSync(path.dirname(file), { recursive: true });
  }
  const db = new DatabaseSync(file);
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      address TEXT PRIMARY KEY,
      username TEXT UNIQUE,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS nonces (
      address TEXT PRIMARY KEY,
      message TEXT NOT NULL,
      expires_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS merchants (
      address TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS payment_requests (
      id TEXT PRIMARY KEY,
      recipient TEXT NOT NULL,
      kind TEXT NOT NULL,
      asset_kind TEXT NOT NULL,
      asset_symbol TEXT NOT NULL,
      asset_address TEXT,
      amount TEXT NOT NULL,
      amount_base TEXT NOT NULL,
      decimals INTEGER NOT NULL,
      message TEXT,
      expires_at TEXT,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      paid_tx_hash TEXT,
      paid_at TEXT,
      payer TEXT,
      chain_id INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS transactions (
      hash TEXT PRIMARY KEY,
      chain_id INTEGER NOT NULL,
      from_address TEXT NOT NULL,
      to_address TEXT NOT NULL,
      asset_symbol TEXT NOT NULL,
      asset_address TEXT,
      amount TEXT NOT NULL,
      amount_base TEXT NOT NULL,
      note TEXT,
      request_id TEXT,
      status TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      address TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TEXT NOT NULL,
      read_at TEXT
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS errors (
      id TEXT PRIMARY KEY,
      message TEXT NOT NULL,
      path TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_requests_recipient ON payment_requests(recipient);
    CREATE INDEX IF NOT EXISTS idx_tx_from ON transactions(from_address);
    CREATE INDEX IF NOT EXISTS idx_tx_to ON transactions(to_address);
    CREATE INDEX IF NOT EXISTS idx_notes_address ON notifications(address);
  `);
  return db;
}

export function getDb() {
  if (!globalForDb.keelDb) globalForDb.keelDb = createDatabase();
  return globalForDb.keelDb;
}

export type PaymentRequestRow = {
  id: string;
  recipient: string;
  kind: "request" | "invoice";
  asset_kind: "native" | "erc20";
  asset_symbol: string;
  asset_address: string | null;
  amount: string;
  amount_base: string;
  decimals: number;
  message: string | null;
  expires_at: string | null;
  status: string;
  created_at: string;
  paid_tx_hash: string | null;
  paid_at: string | null;
  payer: string | null;
  chain_id: number;
};

export type TransactionRow = {
  hash: string;
  chain_id: number;
  from_address: string;
  to_address: string;
  asset_symbol: string;
  asset_address: string | null;
  amount: string;
  amount_base: string;
  note: string | null;
  request_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
};

export function logError(message: string, path?: string) {
  try {
    getDb()
      .prepare("INSERT INTO errors (id, message, path, created_at) VALUES (?, ?, ?, ?)")
      .run(crypto.randomUUID(), message.slice(0, 500), path ?? null, new Date().toISOString());
  } catch {
    // Logging must not hide the original failure.
  }
}
