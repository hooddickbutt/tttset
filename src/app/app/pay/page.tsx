import { Suspense } from "react";
import type { Metadata } from "next";
import { PayPanel } from "@/components/app/pay-panel";

export const metadata: Metadata = { title: "Pay" };

export default function PayPage() {
  return (
    <Suspense fallback={<p>Loading payment form…</p>}>
      <PayPanel initialMode="send" />
    </Suspense>
  );
}
