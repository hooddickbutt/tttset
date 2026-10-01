const RESERVED = new Set([
  "admin",
  "keel",
  "support",
  "help",
  "root",
  "system",
  "merchant",
  "security",
  "wallet",
]);

export function validateUsername(input: string) {
  const username = input.trim().toLowerCase();
  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return {
      ok: false as const,
      error: "Use 3–20 characters: lowercase letters, numbers, or underscores.",
    };
  }
  if (RESERVED.has(username)) {
    return { ok: false as const, error: "That username is reserved." };
  }
  return { ok: true as const, username };
}
