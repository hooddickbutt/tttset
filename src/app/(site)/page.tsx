import { HomePage } from "@/components/home-page";
import { readChainHead } from "@/lib/rpc";

export const dynamic = "force-dynamic";

export default async function Page() {
  const head = await readChainHead();
  return (
    <HomePage
      blockNumber={"blockNumber" in head ? head.blockNumber ?? null : null}
      chainOk={head.ok}
      chainMessage={
        head.ok
          ? null
          : head.mismatch
            ? "The RPC chain id does not match the configured network."
            : "Live data unavailable."
      }
    />
  );
}
