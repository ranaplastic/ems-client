# EMS Client Portal - Rana Plastics

## 📋 Table of Contents
1. [Project Overview](#-project-overview)
2. [Technology Stack](#-technology-stack)
3. [Architecture](#-architecture)
4. [Project Structure](#-project-structure)
5. [Module Documentation](#-module-documentation)
6. [Routing & Navigation](#-routing--navigation)
7. [State Management](#-state-management)
8. [API Integration Layer](#-api-integration-layer)
9. [Domain Types](#-domain-types)
10. [Mock Data Mode](#-mock-data-mode)
11. [Security](#-security)
12. [Configuration](#-configuration)
13. [Build & Run](#-build--run)
14. [CI/CD Pipeline](#-cicd-pipeline)
15. [Quick Reference](#-quick-reference)

---

## 📖 Project Overview

### Purpose
The **EMS Client Portal** is the customer-facing web application for **Rana Plastics**.
It is a mobile-first single-page app that lets clients of the manufacturing business
self-serve: browse the product catalogue, place and track orders, review payment history,
and monitor their outstanding balance with aging analysis. It is the front end for the
[EMS API](EMS-API-COMPLETE-DOCUMENTATION.md) backend.

### Business Domain
Client self-service portal for Manufacturing & Supply Chain Management (plastic products).

### Key Features
- ✅ Lightweight client login (Client ID + registered phone number)
- ✅ Dashboard with order/balance summary and quick actions
- ✅ Product catalogue with search and type filtering
- ✅ Multi-line order placement with live line totals
- ✅ Order tracking with fulfilment status and cancellation of open orders
- ✅ Payment history with per-order attribution
- ✅ Outstanding receivable with 0–30 / 31–60 / 61–90 / 90+ aging breakdown
- ✅ Profile management (contact details)
- ✅ AES-encrypted session storage in the browser
- ✅ Built-in in-memory mock backend for demos / offline development
- ✅ Automated build + deploy to GitHub Pages

> **Note:** Payment *creation* is currently disabled in the UI (clients can view
> payment history but cannot record new payments). The payment API client and hooks
> remain in the codebase, so the flow can be re-enabled by restoring the entry points.
> See [Payments Module](#5-payments-module).

---

## 🛠 Technology Stack

### Core
- **React**: 18.3
- **Language**: TypeScript 5.x
- **Build Tool**: Vite 5
- **Package Manager**: npm

### Key Dependencies
| Concern | Library |
| --- | --- |
| UI framework | `react`, `react-dom` 18.3 |
| Routing | `react-router-dom` 6 (`HashRouter` — GitHub Pages safe) |
| Server state / data fetching | `@tanstack/react-query` 5 |
| HTTP client | `axios` 1.7 |
| Client/session state | `zustand` 4 (with `persist` middleware) |
| Forms | `react-hook-form` 7 |
| Validation helpers | `zod` 3 |
| Styling | `tailwindcss` 3 + `postcss` + `autoprefixer` |
| Icons | `lucide-react` |
| Dates | `date-fns` 3 |
| Toasts | `react-hot-toast` 2 |
| Charts | `recharts` 2 |
| Encryption | `crypto-js` 4 (AES) |
| Class merging | `clsx` |

### Tooling
- **ESLint** 8 (`@typescript-eslint`, `react-hooks`, `react-refresh`)
- **TypeScript** project references (`tsconfig.json` + `tsconfig.node.json`)
- Incremental build cache and TS emit redirected to `node_modules/.tmp` (kept out of VCS)

---

## 🏗 Architecture

### Layered Client Architecture

```
┌──────────────────────────────────────────────┐
│                Pages (routes)                 │  ← Screens / feature views
│   Login, Dashboard, Products, Orders, ...     │
└──────────────────────────────────────────────┘
                       ↓ use
┌──────────────────────────────────────────────┐
│           Hooks (TanStack Query)              │  ← Server-state: caching,
│   useOrders, usePayments, useProducts, ...    │    invalidation, mutations
└──────────────────────────────────────────────┘
                       ↓ call
┌──────────────────────────────────────────────┐
│            API modules (Axios)                │  ← Typed endpoint wrappers
│   ordersApi, paymentsApi, productsApi, ...    │
└──────────────────────────────────────────────┘
                       ↓ via
┌──────────────────────────────────────────────┐
│      Shared Axios instance (client.ts)        │  ← Base URL, error mapping,
│      + optional in-memory mock adapter         │    optional mock backend
└──────────────────────────────────────────────┘
                       ↓ HTTP (JSON)
┌──────────────────────────────────────────────┐
│                  EMS API                       │  ← Spring Boot backend
└──────────────────────────────────────────────┘

  Cross-cutting:
  • Zustand auth store (AES-encrypted localStorage) — current client identity
  • lib/ utilities — crypto, secure storage, formatting, query client
  • components/ — layout shell + reusable UI primitives
```

### Design Principles
1. **Separation of concerns** — pages render, hooks own server-state, api modules own transport.
2. **Server state vs client state** — TanStack Query for API data; Zustand only for session.
3. **Typed contracts** — a single `types/index.ts` mirrors the EMS API DTOs end-to-end.
4. **Query-key driven cache invalidation** — mutations invalidate related queries by key.
5. **Mobile-first, responsive UI** — Tailwind; sidebar on desktop, bottom nav on mobile.
6. **Encryption at rest** — session identity is AES-encrypted before touching `localStorage`.
7. **Static-host friendly** — `HashRouter` + configurable `base` path for GitHub Pages.
8. **Swappable backend** — a mock Axios adapter serves demo data with no code changes.

---

## 📁 Project Structure

```
src/
├── App.tsx                 # Route table (HashRouter)
├── main.tsx                # Entry: providers (QueryClient, Toaster)
├── index.css               # Tailwind layers + globals
│
├── api/                    # Transport layer
│   ├── client.ts           # Shared Axios instance + error mapping
│   ├── clients.ts          # Client endpoints
│   ├── orders.ts           # Order endpoints
│   ├── payments.ts         # Payment endpoints
│   ├── products.ts         # Product endpoints
│   ├── receivables.ts      # Receivable endpoints
│   └── mock/
│       ├── adapter.ts      # In-memory Axios adapter (VITE_USE_MOCK)
│       └── data.ts         # Demo dataset (mutated during session)
│
├── hooks/                  # TanStack Query hooks
│   ├── useOrders.ts
│   ├── usePayments.ts
│   ├── useProducts.ts
│   └── useReceivable.ts
│
├── store/
│   └── authStore.ts        # Zustand session store (encrypted persist)
│
├── lib/                    # Cross-cutting utilities
│   ├── crypto.ts           # AES encrypt/decrypt
│   ├── storage.ts          # Namespaced encrypted localStorage wrapper
│   ├── format.ts           # Currency / quantity / date / humanize helpers
│   ├── queryClient.ts      # QueryClient defaults
│   └── cn.ts               # clsx class-name helper
│
├── components/
│   ├── ProtectedRoute.tsx  # Auth guard (redirects to /login)
│   ├── OrderStatusBadge.tsx
│   ├── layout/
│   │   ├── AppLayout.tsx    # Shell: Sidebar + Header + BottomNav
│   │   ├── Sidebar.tsx      # Desktop nav (source of NAV_ITEMS)
│   │   ├── BottomNav.tsx    # Mobile nav
│   │   └── Header.tsx
│   └── ui/                  # Reusable primitives
│       ├── Badge.tsx   Button.tsx   ButtonLink.tsx  Card.tsx
│       ├── EmptyState.tsx  Input.tsx  Modal.tsx
│       └── Spinner.tsx  StatCard.tsx
│
├── pages/                  # Route screens
│   ├── Login.tsx        Dashboard.tsx  Products.tsx
│   ├── Orders.tsx       OrderDetail.tsx  CreateOrder.tsx
│   ├── Payments.tsx     CreatePayment.tsx
│   ├── Receivables.tsx  Profile.tsx  NotFound.tsx
│
└── types/
    └── index.ts            # Shared domain types & request payloads
```

---

## 📦 Module Documentation

### 1. Authentication / Session Module

#### Purpose
Provides a lightweight client-side "login" and holds the authenticated client identity
for the session.

#### Flow ([src/pages/Login.tsx](src/pages/Login.tsx))
```
1. User enters Client ID + registered phone number
2. clientsApi.getById(clientId) fetches the client record
3. If the record has a phone, it must match the entered phone (whitespace-insensitive)
4. On success → authStore.login(client) → redirect to /dashboard
5. On failure → toast with a normalised error message
```

#### Session store ([src/store/authStore.ts](src/store/authStore.ts))
- Zustand store with `persist` middleware, key `session`.
- Persisted via a **custom encrypted storage adapter**: values are AES-encrypted
  (`lib/crypto`) and namespaced under `ems.session` in `localStorage`.
- `partialize` persists only `{ client, isAuthenticated }`.
- Exposes `login`, `logout`, `setClient`.

#### Route guarding ([src/components/ProtectedRoute.tsx](src/components/ProtectedRoute.tsx))
- Wraps all authenticated routes; redirects to `/login` (preserving `from`) when
  `isAuthenticated` is false.

#### Business Rules
- ✅ Client ID must resolve to an existing client.
- ✅ Entered phone must match the stored phone (when a stored phone exists).
- ✅ Session persists across reloads but is encrypted at rest.
- ⚠️ This is a **client-side gate only** — the EMS API currently has no server-side auth.

---

### 2. Dashboard Module

#### Purpose
Landing screen after login; summarises the client's activity and surfaces quick actions.

#### Behaviour ([src/pages/Dashboard.tsx](src/pages/Dashboard.tsx))
- Aggregates data from `useOrders()` and `useReceivable()`.
- Renders `StatCard`s: outstanding balance, total orders, open orders, completed orders.
- Lists recent orders with status badges and deep links to order detail.
- Empty states guide first-time clients to place an order.

---

### 3. Products Module

#### Purpose
Browse and search the product catalogue and start an order.

#### Behaviour ([src/pages/Products.tsx](src/pages/Products.tsx))
- Data via `useProducts()` (`productsApi.getAll`, cached 5 min `staleTime`).
- Client-side search by name and filter by `ProductType` (FINISHED / SEMI_FINISHED / RAW_MATERIAL).
- Displays name, type badge, standard size and rate (`formatCurrency`).

#### Related types
`Product`, `ProductType` (see [Domain Types](#-domain-types)).

---

### 4. Orders Module

#### Purpose
Place multi-line orders, track fulfilment, view details, and cancel open orders.

#### Screens
| Screen | File | Responsibility |
| --- | --- | --- |
| Orders list | [src/pages/Orders.tsx](src/pages/Orders.tsx) | All of the client's orders with status |
| Order detail | [src/pages/OrderDetail.tsx](src/pages/OrderDetail.tsx) | Line items, fulfilment, balance, cancel |
| Create order | [src/pages/CreateOrder.tsx](src/pages/CreateOrder.tsx) | Multi-line order form |

#### Data hooks ([src/hooks/useOrders.ts](src/hooks/useOrders.ts))
- `useOrders()` — orders for the current client (`enabled` only when a client is present).
- `useOrder(orderId)` — single order detail.
- `useCreateOrder()` — mutation; on success invalidates `orders` and `receivable`.
- `useCancelOrder()` — mutation; on success invalidates `orders` and the single `order`.

#### Order lifecycle (mirrors the EMS API)
```
CREATED → COMPLETED → CANCELLED
```
- Each line shows `quantity`, `quantityFulfilled`, and `quantityForProduction`.
- `balanceDue = totalAmount − paidAmount`.
- Only `CREATED` orders can be cancelled (server enforces; mock returns 409 otherwise).

---

### 5. Payments Module

#### Purpose
View payment history (and, when enabled, record payments that reduce the receivable).

#### Screens
| Screen | File | Status |
| --- | --- | --- |
| Payments history | [src/pages/Payments.tsx](src/pages/Payments.tsx) | Active |
| Create payment | [src/pages/CreatePayment.tsx](src/pages/CreatePayment.tsx) | Present but unreachable (disabled) |

#### Data hooks ([src/hooks/usePayments.ts](src/hooks/usePayments.ts))
- `usePayments()` — payment history for the current client.
- `useCreatePayment()` — mutation; on success invalidates `payments`, `receivable`, `orders`.

#### Current state
The **"Make Payment"/"Pay Now" entry points and the `/payments/new` route are disabled.**
`/payments/new` redirects to `/payments`. History remains fully viewable. To re-enable,
restore the CTAs in `Payments`, `Dashboard`, `OrderDetail`, `Receivables` and the route
in [src/App.tsx](src/App.tsx).

#### Business Rules (enforced by API / mock)
- ✅ Amount must be greater than zero.
- ✅ Payment cannot exceed the outstanding receivable.
- ✅ Payment reduces receivable oldest-bucket-first and reflects on the linked order.

---

### 6. Receivables (Balance) Module

#### Purpose
Show the client's total outstanding and its aging composition.

#### Behaviour ([src/pages/Receivables.tsx](src/pages/Receivables.tsx))
- Data via `useReceivable()` (`retry: false` — a `404` means "no balance / owes nothing").
- Shows `totalDue` and a breakdown across `aging0To30`, `aging31To60`, `aging61To90`, `agingOver90`.

---

### 7. Profile Module

#### Purpose
Let clients review and update their contact details.

#### Behaviour ([src/pages/Profile.tsx](src/pages/Profile.tsx))
- Reads the current client from the auth store.
- Updates via `clientsApi.update(id, patch)`; refreshes the stored client on success.

---

## 🧭 Routing & Navigation

Defined in [src/App.tsx](src/App.tsx) using `HashRouter` (GitHub-Pages-safe — no server
rewrite needed).

| Path | Screen | Access |
| --- | --- | --- |
| `/login` | Login | Public |
| `/dashboard` | Dashboard | Protected |
| `/products` | Products | Protected |
| `/orders` | Orders list | Protected |
| `/orders/new` | Create order | Protected |
| `/orders/:id` | Order detail | Protected |
| `/payments` | Payments history | Protected |
| `/payments/new` | → redirects to `/payments` | Protected (disabled) |
| `/receivables` | Balance | Protected |
| `/profile` | Profile | Protected |
| `/` | → `/dashboard` | Redirect |
| `*` | NotFound | Public |

- Protected routes are nested under `<ProtectedRoute>` → `<AppLayout>`.
- **Navigation source of truth:** `NAV_ITEMS` in
  [src/components/layout/Sidebar.tsx](src/components/layout/Sidebar.tsx), shared by the
  desktop `Sidebar` and mobile `BottomNav`.

---

## 🗃 State Management

Two distinct kinds of state:

### 1. Server state — TanStack Query
- Central `QueryClient` ([src/lib/queryClient.ts](src/lib/queryClient.ts)):
  `retry: 1`, `refetchOnWindowFocus: false`, `staleTime: 30s`.
- Query keys are client-scoped so cache is naturally partitioned per session:

| Key | Source |
| --- | --- |
| `['orders', clientId]` | `useOrders` |
| `['order', orderId]` | `useOrder` |
| `['payments', clientId]` | `usePayments` |
| `['receivable', clientId]` | `useReceivable` |
| `['products']` | `useProducts` |

- Mutations invalidate related keys to keep the UI consistent (e.g. creating an order
  invalidates `orders` + `receivable`).

### 2. Session/client state — Zustand
- `useAuthStore` holds `client` + `isAuthenticated` and the login/logout actions.
- Persisted to `localStorage` **encrypted** (see [Security](#-security)).

---

## 🔌 API Integration Layer

### Shared client ([src/api/client.ts](src/api/client.ts))
- Single Axios instance with `baseURL = VITE_API_BASE_URL` (default
  `http://localhost:8080/api/v1`), JSON headers, 20s timeout.
- `extractErrorMessage(error)` normalises Axios/network errors into readable strings
  (uses the API's `{ status, error, message, path }` shape; special-cases 404, timeout,
  and network errors).
- When `VITE_USE_MOCK=true`, the in-memory `mockAdapter` is installed on the instance.

### Endpoint modules
Thin, typed wrappers that return `response.data`:

| Module | Methods |
| --- | --- |
| [clients.ts](src/api/clients.ts) | `getById`, `getAll`, `update` |
| [orders.ts](src/api/orders.ts) | `create`, `getById`, `getByClient`, `cancel` |
| [payments.ts](src/api/payments.ts) | `create`, `getByClient`, `getByOrder` |
| [products.ts](src/api/products.ts) | `getAll`, `getById`, `getByType`, `search` |
| [receivables.ts](src/api/receivables.ts) | `getByClient` |

### Consumed EMS API endpoints
```
GET  /clients/{id}                 # login + profile
PUT  /clients/{id}                 # profile update
GET  /products                     # catalogue
GET  /products/{id}
GET  /products/type/{type}
GET  /products/search?name=...
POST /orders                       # place order
GET  /orders/{id}
GET  /orders/client/{clientId}
POST /orders/{id}/cancel
POST /payments                     # (disabled in UI)
GET  /payments/client/{clientId}
GET  /payments/order/{orderId}
GET  /receivables/client/{clientId}
```

---

## 🧩 Domain Types

Defined in [src/types/index.ts](src/types/index.ts) — a direct mirror of the EMS API
contracts.

### Enums
```ts
type ProductType = 'FINISHED' | 'SEMI_FINISHED' | 'RAW_MATERIAL';
type OrderStatus = 'CREATED' | 'COMPLETED' | 'CANCELLED';
type PaymentMode = 'CASH' | 'CARD' | 'UPI' | 'BANK_TRANSFER' | 'CHEQUE';
```

### Entities (fields)
| Type | Key fields |
| --- | --- |
| `Client` | `clientId`, `name`, `phoneNo?`, `emailId?`, `address?`, `createdAt?`, `updatedAt?` |
| `Product` | `productId`, `productName`, `productType`, `standardSize?`, `rate` |
| `OrderBook` | `serialNo`, `productId`, `productName?`, `quantity`, `quantityFulfilled`, `quantityForProduction`, `rate`, `lineTotal` |
| `Order` | `orderId`, `clientId?`, `client?`, `date`, `totalAmount`, `paidAmount`, `status`, `balanceDue?`, `orderBooks[]` |
| `Payment` | `paymentId`, `clientId`, `orderId?`, `paymentDate`, `amountPaid`, `paymentMode`, `remarks?` |
| `Receivable` | `receivableId`, `clientId`, `totalDue`, `aging0To30`, `aging31To60`, `aging61To90`, `agingOver90` |

### Request payloads
```ts
interface CreateOrderLine  { productId: number; quantity: number; rate: number; }
interface CreateOrderRequest { clientId: number; date: string; orderBooks: CreateOrderLine[]; }
interface CreatePaymentRequest {
  clientId: number; orderId?: number | null; paymentDate: string;
  amountPaid: number; paymentMode: PaymentMode; remarks?: string | null;
}
interface ApiError { timestamp?; status?; error?; message?; path?; }
```

---

## 🎭 Mock Data Mode

To develop and demo without a running backend, set `VITE_USE_MOCK=true`.

- [src/api/mock/adapter.ts](src/api/mock/adapter.ts) is a custom `AxiosAdapter` that
  pattern-matches method + URL and serves data from
  [src/api/mock/data.ts](src/api/mock/data.ts) with a simulated ~350ms latency.
- The dataset is **mutated in-memory** during the session, so create/cancel/pay flows
  behave realistically; it **resets on page refresh**.
- Implements clients, products (list/search/type/by-id), orders (create/list/cancel/by-id),
  payments (create/list-by-client/by-order, with overpayment + oldest-bucket-first logic),
  and receivables (by client, `404` when none).

**Demo credentials:** Client ID **1001**, phone **9876543210** (Acme Traders).

---

## 🔒 Security

### Session encryption at rest
- [src/lib/crypto.ts](src/lib/crypto.ts) — AES `encrypt`/`decrypt` using
  `VITE_STORAGE_SECRET`.
- [src/lib/storage.ts](src/lib/storage.ts) — namespaced (`ems.`) encrypted `localStorage`
  wrapper; the auth store uses the same approach so client identity is never stored in
  plaintext.

### Transport
- All API traffic must be **HTTPS** in production. GitHub Pages is HTTPS-only, so any
  `http://` API base URL would be blocked as mixed content — point `VITE_API_BASE_URL`
  at an HTTPS endpoint.

### Important caveats
- ⚠️ A static SPA **cannot keep a secret** from a determined user inspecting the bundle.
  The AES key is defence-in-depth against casual inspection / other scripts reading
  `localStorage`, **not** a substitute for a server-side auth token.
- ⚠️ The EMS API currently ships **without authentication**. The Client ID + phone gate
  is client-side only. Before a public launch, add real auth (JWT/OAuth2) on the API and
  send tokens from this app.
- 🔁 Rotate `VITE_STORAGE_SECRET` per deployment.

---

## ⚙ Configuration

### Environment variables (`.env`; template in `.env.example`)
| Variable | Description | Example |
| --- | --- | --- |
| `VITE_PROFILE` | Active profile (Spring-style). Selects the backend base URL. Defaults to `dev` when unset. | `dev` / `prod` |
| `VITE_API_BASE_URL` | Optional explicit override of the profile's API base URL | `https://ems.ranaplastics.com/api/v1` |
| `VITE_STORAGE_SECRET` | Passphrase for AES session encryption | long random string |
| `VITE_BASE_PATH` | App base path (`/` local, `/<repo>/` on Pages) | `/` |
| `VITE_USE_MOCK` | Serve in-memory demo data instead of a real backend | `true` / `false` |

> `.env` is git-ignored (never commit real secrets); `.env.example` is the committed template.

### Profiles ([src/config/index.ts](src/config/index.ts))
Backend selection mirrors Spring's `spring.profiles.active`:

| Profile | Backend base URL |
| --- | --- |
| `dev` (default) | `http://localhost:8080` |
| `prod` | `https://ems.ranaplastics.com` |

- The resolved API base = `<profile host>` + `/api/v1`.
- If `VITE_PROFILE` is unset or unknown, `dev` is used.
- An explicit `VITE_API_BASE_URL` overrides the profile default (useful for CI/previews).
- CI builds set `VITE_PROFILE=prod` for the deployed artifact.

### Build configuration ([vite.config.ts](vite.config.ts))
- `base` = `VITE_BASE_PATH` or `/ems-client/` (project-Pages default).
- `@` alias → `src/`.
- Dev server on port **5173** (auto-opens).
- Build output → `dist/`.

### TypeScript
- [tsconfig.json](tsconfig.json) — app config (`strict`, `noUnusedLocals`,
  `noUnusedParameters`); build info cached under `node_modules/.tmp`.
- [tsconfig.node.json](tsconfig.node.json) — config for `vite.config.ts`; emit + build
  info redirected to `node_modules/.tmp` so no stray artifacts land at the repo root.

---

## 🚀 Build & Run

### Prerequisites
- Node.js 20+
- npm

### Commands ([package.json](package.json))
| Command | Description |
| --- | --- |
| `npm install` | Install dependencies (first run) |
| `npm run dev` | Start the Vite dev server (http://localhost:5173/) |
| `npm run build` | Type-check (`tsc -b`) and build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint (`--max-warnings 0`) |
| `npm run deploy` | Alias for `npm run build` |

### Local quick start
```bash
npm install
cp .env.example .env      # then edit values (or keep VITE_USE_MOCK=true)
npm run dev
```
Demo login (mock mode): **Client ID 1001 / phone 9876543210**.

---

## 🔁 CI/CD Pipeline

GitHub Actions under `.github/workflows/`, mirroring the backend branching strategy but
deploying to **GitHub Pages** instead of Docker.

### Branching Strategy
```
feature/**  ──PR──▶  develop  ──PR──▶  main  ──auto-deploy──▶  GitHub Pages
```
- `feature/**` — build + test (lint) only.
- `develop` — integration; build + test + publish build artifact.
- `main` — **production**; build + test + publish artifact, then auto-deploy to Pages.

### Workflows
#### 1. `build.yml` — Build (CI)
Triggers on pushes to `main`, `develop`, `feature/**` and PRs to `main`/`develop`.

| Job | Action |
| --- | --- |
| `build` | `npm ci` + `npm run build`; uploads the `site-dist` artifact **only on `develop`/`main`** |
| `test` | `npm ci` + `npm run lint` |

Build env: `VITE_API_BASE_URL` (variable), `VITE_STORAGE_SECRET` (secret),
`VITE_USE_MOCK` (variable), `VITE_BASE_PATH=/<repo>/`.

#### 2. `deploy.yml` — Deploy (CD, main only)
- **Trigger:** `workflow_run` after **Build** completes successfully on `main`
  (plus manual `workflow_dispatch`).
- **Guard:** runs only if `conclusion == 'success'` and `head_branch == 'main'`.
- **Auto path:** downloads the `site-dist` artifact from the triggering Build run.
- **Manual path:** rebuilds `main` from scratch.
- Publishes via `actions/upload-pages-artifact` + `actions/deploy-pages`
  (environment `github-pages`).

#### 3. `rollback.yml` — Rollback
- **Automatic:** runs when **Deploy** finishes with failure → rebuilds & redeploys the
  previous commit (`main~1`).
- **Manual:** `workflow_dispatch` with an optional `ref` (tag/branch/SHA) to redeploy.

### One-time GitHub setup
1. **Settings → Pages → Source: GitHub Actions.**
2. **Settings → Environments → `github-pages`:** restrict deployment branches to `main`.
3. **Settings → Secrets and variables → Actions:** add variable `VITE_API_BASE_URL`
   (and optional `VITE_USE_MOCK`) and secret `VITE_STORAGE_SECRET`.

### Deployment flow (main → production)
```
Merge/push to main
    ↓
Build workflow: build + lint, publish site-dist artifact (main)
    ↓ (on success, main only)
Deploy workflow: download artifact → upload-pages-artifact → deploy-pages
    ↓                                   ↘ (deploy fails)
  Published to Pages                  Rollback workflow → previous commit
```
Published at `https://<owner>.github.io/<repo>/` (e.g. `.../ems-client/`).

---

## 🎯 Quick Reference

### Key user flows
```
Login:            Client ID + phone → GET /clients/{id} → verify phone → session
Place order:      CreateOrder form → POST /orders → invalidate orders + receivable
Track order:      Orders list → OrderDetail (fulfilment, balance, cancel)
Cancel order:     OrderDetail (CREATED only) → POST /orders/{id}/cancel
View payments:    Payments → GET /payments/client/{clientId}
View balance:     Receivables → GET /receivables/client/{clientId} (aging buckets)
Update profile:   Profile → PUT /clients/{id}
```

### Conventions
- ✅ Server data via TanStack Query hooks; session via Zustand only.
- ✅ Query keys are client-scoped (`[resource, clientId]`); mutations invalidate by key.
- ✅ Types in `types/index.ts` mirror the EMS API DTOs.
- ✅ Currency via `formatCurrency` (INR, `en-IN`); dates via `formatDate` (`dd MMM yyyy`).
- ✅ Session identity is AES-encrypted in `localStorage` (namespaced `ems.`).
- ✅ `HashRouter` + `VITE_BASE_PATH` for GitHub Pages hosting.
- ✅ `VITE_USE_MOCK=true` swaps in the in-memory backend with zero code changes.

### Critical notes
- ⚠️ Payment creation is currently disabled in the UI (history stays viewable).
- ⚠️ No server-side auth yet — the login is a client-side gate only.
- ⚠️ Production `VITE_API_BASE_URL` must be HTTPS (Pages blocks mixed content).
