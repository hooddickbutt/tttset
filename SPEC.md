# Keel implementation specification

Keel is an independent non-custodial payment application aimed at Robinhood Chain. It is not affiliated with X, X Money, Robinhood, or Robinhood Markets, Inc. The interface may name Robinhood Chain only as the settlement network.

Live numbers come from the configured RPC, a readable contract, or rows this deployment stored. Missing data is labeled. Demo activity is labeled and is not broadcast.

## Sitemap

| Path | Purpose |
| --- | --- |
| `/` | Homepage |
| `/token` | Token facts |
| `/security` | Security notes |
| `/technology` | Stack and network |
| `/roadmap` | Available and coming soon |
| `/docs` | Local run notes |
| `/legal/terms` | Draft terms |
| `/legal/privacy` | Draft privacy |
| `/legal/risk` | Risk disclosure |
| `/request/[id]` | Public payment request |
| `/app` | Wallet home |
| `/app/pay` | Send, with optional `?request=` |
| `/app/receive` | Receive and payment links |
| `/app/wallet` | Balances |
| `/app/activity` | Recorded transfers and labeled demos |
| `/app/profile` | Username, demo mode, notifications |
| `/app/requests` | Requests created by the signed-in wallet |
| `/app/merchant` | Merchant name, invoices, CSV export |
| `/app/swap` | Coming soon. No simulated swap |
| `/admin` | Deployment records. Hidden from search |

Mobile app navigation: Home, Pay, Wallet, Activity, Profile. Pay stays in the bottom bar.

## User journeys

1. **Send.** Connect wallet, switch to the configured chain, enter recipient, amount, asset, and an optional note. Review shows network and a fee estimate when the RPC can produce one. The wallet signs the transfer. Keel polls the receipt and records the transaction only after the RPC returns it.
2. **Receive.** The connected address and an EIP-681 QR are shown. A payment link requires a sign-in signature and stores the request payable to that wallet.
3. **Pay a request.** `/request/[id]` shows recipient, amount, asset, network, and status. Open requests link to `/app/pay?request=id` with fields locked to the stored request.
4. **Merchant.** Sign in, save a name, create an invoice, export CSV of that wallet’s requests.
5. **Demo.** Profile toggle. Send can simulate. The result says it was not broadcast. Demo rows stay in local storage and render in a separate Activity section only while demo mode is on.

## States

Transaction UI states: Preparing, Awaiting signature, Pending, Confirmed, Failed.

Payment request states: open, expired (derived from `expires_at`), paid (only after an onchain match).

Empty and failure copy used in the product:

- Connect wallet to view live data.
- Connect wallet to continue.
- Live data unavailable.
- Token contract address will be published after deployment.
- Market data unavailable.
- Payment request expired.
- Payment completed.
- Swap integration coming soon.
- Awaiting your first payment.
- Admin authentication is not configured.
- Demo transaction: this transaction is simulated and has not been broadcast to the blockchain.

## Data

SQLite via `node:sqlite`. Default file `data/keel.db`.

Tables: `users`, `nonces`, `merchants`, `payment_requests`, `transactions`, `notifications`, `settings`, `errors`.

A request is marked paid only when `matchTransfer` succeeds for a successful transaction on the configured chain id: same recipient, same amount, and either native value or an ERC-20 `transfer` to the configured token. Pending matches stay pending. Expired requests are not marked paid.

Notes are application records. They are not calldata.

## Web3

- Chain defaults: Robinhood Chain mainnet, chain id 4663, ETH gas, public RPC `https://rpc.mainnet.chain.robinhood.com`, explorer `https://robinhoodchain.blockscout.com`. Testnet is chain id 46630 when configured.
- Wallet: wagmi injected connector. WalletConnect stays unavailable until `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set. The connect dialog does not draw a fake QR.
- Server reads use `RPC_URL` or the public RPC. If `eth_chainId` does not match `NEXT_PUBLIC_CHAIN_ID`, payments are not marked paid.
- Token metadata is `name`, `symbol`, `decimals`, and `totalSupply` from the contract. Price, holders, liquidity, volume, and circulating supply are not estimated.
- No settlement, rewards, or swap contract is deployed. Direct transfers keep custody with the wallet.

## API

| Method | Path | Auth |
| --- | --- | --- |
| GET | `/api/health` | Public |
| GET | `/api/token` | Public |
| POST | `/api/session/nonce` | Public |
| GET, POST, DELETE | `/api/session` | Signature on POST |
| GET, POST | `/api/profile` | Session for POST |
| GET, POST | `/api/requests` | Session |
| GET | `/api/requests/[id]` | Public |
| POST | `/api/requests/[id]/verify` | Public hash check. Notes require the sender session |
| GET, POST | `/api/transactions` | Public read of recorded rows for an address |
| GET, POST | `/api/merchant` | Session |
| GET | `/api/merchant/export` | Session |
| GET, POST | `/api/notifications` | Session |
| POST, DELETE | `/api/admin/session` | `ADMIN_SECRET` |
| GET | `/api/admin/overview` | Admin cookie |

Private keys are never accepted. `ADMIN_SECRET`, `SESSION_SECRET`, `RPC_URL`, and `DATABASE_URL` are server-only.

## Environment

See `.env.example`. A blank `NEXT_PUBLIC_TOKEN_ADDRESS` is valid. An invalid address is rejected and not used.

## Design

Original mark: a hull diamond, wordmark “Keel”. Copper accent on warm paper, with a dark theme. Instrument Serif for headlines, Instrument Sans for UI. No Robinhood green, no X logo, no fabricated activity feed.

## Not in this version

Swap, rewards, historical indexing, and WalletConnect. Each has an explicit unavailable state. PostgreSQL is a later move of the same tables, not a second source of truth.
