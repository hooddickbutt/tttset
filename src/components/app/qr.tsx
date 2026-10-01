"use client";

import QRCode from "qrcode";
import { useEffect, useState } from "react";

export function Qr({ value, label }: { value: string; label: string }) {
  const [svg, setSvg] = useState("");

  useEffect(() => {
    let cancel = false;
    QRCode.toString(value, {
      type: "svg",
      margin: 1,
      width: 220,
      color: { dark: "#1b1e18", light: "#ffffff" },
    })
      .then((markup) => {
        if (!cancel) setSvg(markup);
      })
      .catch(() => {
        if (!cancel) setSvg("");
      });
    return () => {
      cancel = true;
    };
  }, [value]);

  return (
    <figure className="w-fit">
      <div
        className="rounded-2xl bg-white p-3 [&_svg]:h-auto [&_svg]:w-44"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <figcaption className="mt-2 max-w-44 text-xs leading-5 text-muted">{label}</figcaption>
    </figure>
  );
}

export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      className="text-sm text-accent"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setCopied(true);
        } catch {
          setCopied(false);
        }
      }}
    >
      {copied ? "Copied" : label}
    </button>
  );
}
