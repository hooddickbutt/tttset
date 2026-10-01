import type { ReactNode } from "react";

export function Doc({
  eyebrow,
  title,
  lede,
  children,
}: {
  eyebrow?: string;
  title: string;
  lede: string;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      {eyebrow ? <p className="text-xs tracking-[0.18em] text-muted uppercase">{eyebrow}</p> : null}
      <h1 className="mt-3 font-serif text-5xl tracking-tight text-balance">{title}</h1>
      <p className="mt-4 text-lg leading-8 text-muted">{lede}</p>
      <div className="mt-10 space-y-5 text-[15px] leading-7 text-ink/90">{children}</div>
    </article>
  );
}
