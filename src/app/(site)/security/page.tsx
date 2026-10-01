import type { Metadata } from "next";
import { Doc } from "@/components/doc";
import { chainId, networkName } from "@/lib/network";

export const metadata: Metadata = { title: "Security" };

export default function SecurityPage() {
  return (
    <Doc
      eyebrow="Security"
      title="Built so the wallet stays in charge."
      lede="Keel does not claim to be perfectly secure. These are the controls in this version, and the responsibilities that stay with you."
    >
      <h2 className="font-serif text-3xl text-ink">Non-custodial</h2>
      <p>Keel does not hold assets and does not ask for a seed phrase or private key. A transfer leaves your wallet only after you confirm it there.</p>
      <h2 className="font-serif text-3xl text-ink">Sign-in</h2>
      <p>Creating a payment request or a username requires a wallet signature. The message says it does not spend funds. The signature is checked on the server, then discarded with its nonce.</p>
      <h2 className="font-serif text-3xl text-ink">Network check</h2>
      <p>
        This deployment expects {networkName()}, chain id {chainId}. Before a request is marked paid, Keel reads the transaction from the configured RPC and checks the chain id, recipient, asset, and amount. A matching pending transaction stays pending.
      </p>
      <h2 className="font-serif text-3xl text-ink">Contracts</h2>
      <p>Version one settles with a native transfer or an ERC-20 transfer. There is no upgradeable custody contract in this repository. If a token address is configured, compare it with the address published by the operator before you add it to a wallet.</p>
      <h2 className="font-serif text-3xl text-ink">Phishing</h2>
      <p>Check the site address before you connect. Keel will not ask you to type a recovery phrase. A page that does is not this app.</p>
      <h2 className="font-serif text-3xl text-ink">What you still own</h2>
      <p>You choose the recipient. You confirm the fee. A wrong address or a signed malicious transaction cannot be reversed by Keel. Demo mode never broadcasts, and it is labeled on screen.</p>
    </Doc>
  );
}
