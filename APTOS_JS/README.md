# APTOS_JS — Express + Aptos SDK + MongoDB backend

An Express 5 backend for creating Aptos wallets, transferring APT, checking balances, and issuing on-chain rewards via a custom Move module. Includes a simple EJS-powered admin panel for manual operations.

## Overview

- REST API under `/api/aptos` for programmatic access
- Admin panel under `/admin` with session auth (demo creds) and EJS views
- MongoDB persistence for users, transfers, and rewards
- Aptos integration via `@aptos-labs/ts-sdk`
- CORS allowlist via `CORS_ORIGINS`

## Tech stack

- Node.js (ES Modules) + Express 5
- EJS (server-rendered admin UI)
- MongoDB + Mongoose
- Aptos TypeScript SDK (`@aptos-labs/ts-sdk`)

## Requirements

- Node.js 18+
- MongoDB (local or hosted)
- Aptos account for the platform wallet (private key)

## Quick start

1. Install dependencies
   ```powershell
   npm install
   ```
2. Create a `.env` file in the project root (see template below)
3. Start the server
   ```powershell
   npm start
   ```
4. Open:
   - API: http://localhost:4000/api/aptos
   - Admin panel: http://localhost:4000/admin

> Default port is 4000; configure via `PORT`.

## Environment variables

Create a `.env` file with the following keys. Values shown are examples; replace with your own.

```ini
# Server
PORT=4000
SESSION_SECRET=replace-with-a-long-random-string

# CORS (comma-separated origins)
CORS_ORIGINS=http://localhost:3001,http://localhost:5173

# MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/aptos_platform

# Aptos network: mainnet | testnet | devnet | local
APTOS_NETWORK=testnet

# Your deployed Move module address (hex address, 0x-prefixed)
MODULE_ADDRESS=0xYOUR_MODULE_ADDRESS

# Platform wallet private key (ed25519) used to sign reward transactions
PLATFORM_PRIVATE_KEY=0xYOUR_ED25519_PRIVATE_KEY
```

Notes:
- `MODULE_ADDRESS` must point to the account where your Move module is published; the controller calls `${MODULE_ADDRESS}::biasbounty::reward_user`.
- `PLATFORM_PRIVATE_KEY` is used to sign the reward transaction. Keep this secure and never commit `.env`.

## Scripts

- `npm start` — runs `node index.js`
- `npm test` — placeholder (no tests defined)

## API reference

Base URL: `http://localhost:4000/api/aptos`

Amounts are in Octas (1 APT = 100,000,000 Octas). Pass `amount` as an integer string or number representing Octas.

- POST `/create-account`
  - Body: `{ "userId": "u1", "username": "Alice", "email": "alice@example.com", "role": "COMPANY" | "RESEARCHER" }`
  - Creates an Aptos account and stores it in MongoDB.

- GET `/user/:userId`
  - Fetch user profile by `userId` (private key is never returned).

- POST `/transfer`
  - Body: `{ "userId": "u1", "receiverAddress": "0x...", "amount": 1000000 }`
  - Transfers APT from the sender (fetched by `userId`, using stored private key) to `receiverAddress`.
  - Stores a Transaction record on success/failure.

- GET `/balance/:address`
  - Returns `{ balance_octas, balance_APT }` for any Aptos address.

- POST `/reward`
  - Body: `{ "receiver": "0x...", "amount": 1000000, "reason": "optional" }`
  - Calls your Move function `${MODULE_ADDRESS}::biasbounty::reward_user` as the platform wallet to reward a user.
  - Stores a Reward record on success/failure.

Common success response (transfer/reward):
```json
{
  "success": true,
  "message": "...",
  "hash": "0x...",
  "explorer": "https://explorer.aptoslabs.com/txn/0x...?network=testnet"
}
```

## Admin panel (demo)

- URL: `http://localhost:4000/admin`
- Login credentials (hardcoded for demo):
  - Username: `admin`
  - Password: `admin@123`
- Features:
  - Transfer between accounts (uses API under the hood)
  - Check balance for any address
  - Send reward from the platform wallet
- Session is backed by `express-session`. Update creds/flow before production use.

## Data models (MongoDB)

- `User`
  - `userId` (unique), `username`, `email` (unique), `role` (COMPANY|RESEARCHER)
  - `wallet_address` (unique)
  - `private_key` (hidden by default via `select: false`)

- `Transaction`
  - `userId`, `senderAddress`, `receiverAddress`, `amount` (Octas)
  - `hash` (unique), `explorerUrl`, `status` (SUCCESS|FAILED)

- `Reward`
  - `userId`, `receiverAddress`, `amount` (Octas)
  - `hash` (unique), `explorerUrl`, `status` (SUCCESS|FAILED), `reason`

## CORS

- Only applied to `/api` routes.
- Configure allowed origins via `CORS_ORIGINS` (comma-separated list). Requests without an origin (curl/Postman) are allowed.

## Project structure

```
index.js                  # App entry (Express, sessions, views, CORS, routes)
config/db.js              # MongoDB connection
controller/
  admin.controller.js     # Admin panel actions (renders EJS)
  aptos.controller.js     # API handlers (Aptos SDK + DB)
models/
  user.model.js           # User schema
  transaction.model.js    # Transaction schema
  reward.model.js         # Reward schema
routes/
  admin.routes.js         # /admin routes (EJS)
  aptos.routes.js         # /api/aptos routes (REST)
views/
  admin-dashboard.ejs     # Admin dashboard
  admin-login.ejs         # Admin login
```

## Security and production notes

- Replace demo admin credentials and move them out of source.
- Use HTTPS and set `session.cookie.secure = true` behind TLS.
- Never log or expose private keys; ensure `.env` is ignored by Git.
- Consider a KMS/HSM or vault for the platform key in production.
- Validate inputs rigorously and rate-limit sensitive endpoints.

## Troubleshooting

- Missing env: The server may crash on start if `MODULE_ADDRESS` or `PLATFORM_PRIVATE_KEY` is not set.
- Explorer links: Network is derived from `APTOS_NETWORK` (default `testnet`).
- Amounts: Be sure to pass Octas. Convert APT to Octas by multiplying by 1e8.
- CORS errors: Ensure your frontend origin is listed in `CORS_ORIGINS`.

## License

ISC (see `package.json`).
