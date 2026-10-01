"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { setDemoEnabled, useDemoMode } from "@/components/app/demo";
import { useWalletSession } from "@/components/app/use-session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatWhen } from "@/lib/format";

type Note = { id: string; title: string; body: string; createdAt: string; readAt: string | null };

export function ProfileView() {
  const session = useWalletSession();
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const demo = useDemoMode();
  const name = draft ?? session.username ?? "";
  const notesQuery = useQuery({
    queryKey: ["notifications", session.address],
    enabled: session.matches,
    queryFn: async () => {
      const response = await fetch("/api/notifications");
      const body = (await response.json()) as { notifications?: Note[] };
      return body.notifications || [];
    },
  });
  const notes = notesQuery.data ?? [];

  async function saveUsername() {
    setMessage(null);
    const response = await fetch("/api/profile", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ username: name }),
    });
    const body = (await response.json()) as { username?: string; error?: string };
    setMessage(response.ok ? `Username saved as @${body.username}.` : body.error || "Could not save that username.");
    if (response.ok) await session.refresh();
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="font-serif text-5xl tracking-tight">Profile</h1>
      {!session.isConnected ? (
        <p className="mt-6 text-sm leading-6 text-muted">Connect wallet to view live data.</p>
      ) : (
        <>
          <p className="mt-4 font-mono text-sm break-all">{session.address}</p>
          {!session.matches ? (
            <div className="mt-4">
              <p className="text-sm leading-6 text-muted">
                Sign a message to attach a username and read notifications. This does not spend funds or approve a token.
              </p>
              <Button type="button" className="mt-3" onClick={() => void session.signIn()} disabled={session.signing}>
                {session.signing ? "Waiting for wallet" : "Sign in with wallet"}
              </Button>
            </div>
          ) : (
            <form
              className="mt-6"
              onSubmit={(event) => {
                event.preventDefault();
                void saveUsername();
              }}
            >
              <label className="text-sm">
                Username
                <Input className="mt-2" value={name} onChange={(event) => setDraft(event.target.value)} placeholder="alex" />
              </label>
              <Button type="submit" className="mt-3">Save username</Button>
            </form>
          )}
          <div className="mt-8 rounded-3xl border border-line p-4">
            <label className="flex items-start gap-3 text-sm leading-6">
              <input
                type="checkbox"
                className="mt-1"
                checked={demo}
                onChange={(event) => setDemoEnabled(event.target.checked)}
              />
              <span>
                <span className="font-medium">Demo mode</span>
                <span className="mt-1 block text-muted">
                  Shows a persistent DEMO MODE banner and lets Send simulate a transfer. Simulated records stay in this browser and are not broadcast.
                </span>
              </span>
            </label>
          </div>
          <section className="mt-8">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-3xl">Notifications</h2>
              {session.matches ? (
                <button
                  type="button"
                  className="text-sm text-accent"
                  onClick={() => {
                    void fetch("/api/notifications", { method: "POST" }).then(() =>
                      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
                    );
                  }}
                >
                  Mark read
                </button>
              ) : null}
            </div>
            {!session.matches ? (
              <p className="mt-3 text-sm text-muted">Sign in to read notifications for this wallet.</p>
            ) : notes.length === 0 ? (
              <p className="mt-3 text-sm text-muted">No notifications yet.</p>
            ) : (
              <ul className="mt-4 space-y-3">
                {notes.map((note) => (
                  <li key={note.id} className="rounded-2xl border border-line p-3 text-sm">
                    <p className="font-medium">{note.title}</p>
                    <p className="text-muted">{note.body}</p>
                    <p className="mt-1 text-xs text-muted">{formatWhen(note.createdAt)}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>
          {session.matches ? (
            <Button type="button" variant="outline" className="mt-6" onClick={() => void session.signOut()}>
              Sign out of Keel
            </Button>
          ) : null}
        </>
      )}
      {session.error ? <p className="mt-4 text-sm text-bad">{session.error}</p> : null}
      {message ? <p className="mt-4 text-sm">{message}</p> : null}
    </div>
  );
}
