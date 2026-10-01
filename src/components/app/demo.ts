"use client";

import { useSyncExternalStore } from "react";

export type DemoTx = {
  id: string;
  to: string;
  amount: string;
  symbol: string;
  note: string;
  createdAt: string;
};

const MODE = "keel.demo";
const TXS = "keel.demoTxs";
const EMPTY: DemoTx[] = [];
let cachedRaw = "";
let cachedTxs: DemoTx[] = EMPTY;

export function demoEnabled() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(MODE) === "1";
}

export function setDemoEnabled(on: boolean) {
  window.localStorage.setItem(MODE, on ? "1" : "0");
  window.dispatchEvent(new Event("keel-demo"));
}

export function readDemoTxs(): DemoTx[] {
  if (typeof window === "undefined") return EMPTY;
  const raw = window.localStorage.getItem(TXS) || "[]";
  if (raw === cachedRaw) return cachedTxs;
  cachedRaw = raw;
  try {
    const parsed = JSON.parse(raw) as DemoTx[];
    cachedTxs = Array.isArray(parsed) ? parsed : EMPTY;
  } catch {
    cachedTxs = EMPTY;
  }
  return cachedTxs;
}

function subscribe(callback: () => void) {
  window.addEventListener("keel-demo", callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener("keel-demo", callback);
    window.removeEventListener("storage", callback);
  };
}

export function useDemoMode() {
  return useSyncExternalStore(subscribe, demoEnabled, () => false);
}

export function useDemoTxs() {
  return useSyncExternalStore(subscribe, readDemoTxs, () => EMPTY);
}

export function saveDemoTx(tx: DemoTx) {
  const next = [tx, ...readDemoTxs()].slice(0, 20);
  window.localStorage.setItem(TXS, JSON.stringify(next));
  window.dispatchEvent(new Event("keel-demo"));
}
