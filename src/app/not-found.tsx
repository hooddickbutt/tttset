import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-xl flex-col justify-center px-5">
      <p className="text-xs tracking-[0.18em] text-muted uppercase">404</p>
      <h1 className="mt-3 font-serif text-5xl tracking-tight">This page is not in Keel.</h1>
      <p className="mt-4 text-muted">The link may be mistyped, or the payment request may never have been created.</p>
      <Button asChild className="mt-8 w-fit">
        <Link href="/">Back home</Link>
      </Button>
    </main>
  );
}
