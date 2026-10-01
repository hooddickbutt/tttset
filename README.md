# Keel

Keel is an independent, non-custodial payment app for Robinhood Chain. You connect a wallet, send or request assets, and confirm every transfer yourself.

Keel is not affiliated with, endorsed by, sponsored by, or officially connected with X, X Money, Robinhood, or Robinhood Markets, Inc. Robinhood Chain is the settlement network. Keel does not use Robinhood branding.

The app does not invent users, balances, payments, prices, or eligibility. If a value cannot be read, the screen says so.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://127.0.0.1:43123](http://127.0.0.1:43123).

```bash
npm test
npm run lint
```

## Network

Defaults match the [Robinhood Chain connection docs](https://docs.robinhood.com/chain/connecting/):

| | Mainnet | Testnet |
| --- | --- | --- |
| Chain ID | 4663 | 46630 |
| Gas token | ETH | ETH |
| Public RPC | `https://rpc.mainnet.chain.robinhood.com` | `https://rpc.testnet.chain.robinhood.com` |
| Explorer | `https://robinhoodchain.blockscout.com` | `https://explorer.testnet.chain.robinhood.com` |

The public RPC is rate-limited. For production, set a server-only `RPC_URL` from a provider. Do not put a provider key in `NEXT_PUBLIC_RPC_URL`.

## Token

Leave `NEXT_PUBLIC_TOKEN_ADDRESS` empty until a contract is deployed. The token page then says the address will be published after deployment. Keel does not deploy a token and does not show a price, holder count, or volume it cannot read.

## What this version does

- Connect an injected EVM wallet and add or switch to the configured chain.
- Read ETH balances, and token balances when the contract is configured and readable.
- Send ETH or that token after a wallet confirmation.
- Show a receive address and QR code.
- Create payment links and merchant invoices for the signed-in wallet.
- Mark a request paid only when a transaction on the configured network matches the recipient, asset, and amount.
- Store an optional username against a wallet after a sign-in signature.
- Admin records for this deployment, after `ADMIN_SECRET` is set. There is no default password.

Swap, rewards, WalletConnect, and historical indexing are marked coming soon. Demo mode is labeled and never broadcasts.

## Data

SQLite file from `DATABASE_URL` (default `file:./data/keel.db`) stores users, usernames, merchants, payment requests, verified transactions, notifications, and error logs. Blockchain state is re-read before a request is marked paid.

Payment notes stay in Keel. They are not written into the transfer.

Have counsel review the terms, privacy, and risk pages before a public launch.
