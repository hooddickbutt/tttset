import { Suspense } from "react";
import type { Metadata } from "next";
import { PayPanel } from "@/components/app/pay-panel";

export const metadata: Metadata = { title: "Receive" };

export default function ReceivePage() {
  return (
    <Suspense fallback={<p>Loading receive form…</p>}>
      <PayPanel initialMode="receive" />
    </Suspense>
  );
}
