import { createConfig, http, injected } from "wagmi";
import { keelChain, publicRpcUrl } from "@/lib/network";

export const wagmiConfig = createConfig({
  chains: [keelChain],
  connectors: [injected()],
  transports: {
    [keelChain.id]: http(publicRpcUrl),
  },
  ssr: true,
});
