import type { Metadata } from "next";
import { Doc } from "@/components/doc";
import { independenceStatement } from "@/lib/network";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <Doc
      eyebrow="Terms"
      title="Terms of use"
      lede="This is a plain-language draft for the software in this repository. Have counsel review it before a public launch."
    >
      <p>{independenceStatement}</p>
      <p>Keel provides an interface for wallet owners to prepare transfers and payment requests. You are responsible for the addresses, amounts, and approvals you sign. Keel does not custody assets and does not guarantee that a transaction will be included, that a token will have value, or that the app will be available without interruption.</p>
      <p>You may not use Keel to misrepresent a payment, fabricate a balance, or imply an affiliation that the footer statement rejects.</p>
      <p>The software is provided as available. Network fees are charged by the chain, not by this interface.</p>
    </Doc>
  );
}
