# Rana Plastics — Client Portal

A mobile-first, client-facing web app for the **EMS (Enterprise Management System)** API.
Clients can browse the product catalog, place and track orders, make payments, and view
their outstanding balance with aging breakdown.

Built with **React + TypeScript + Vite**, deployable to **GitHub Pages**.

---

## ✨ Features

| Module | What clients can do |
| --- | --- |
| **Login** | Sign in with Client ID + registered phone number |
| **Dashboard** | Overview of orders, balance and quick actions |
| **Products** | Browse/search the catalog, filter by type, start an order |
| **Orders** | Place multi-item orders, track fulfilment, cancel open orders |
| **Payments** | View payment history and record new payments |
| **Balance** | Outstanding total with 0–30 / 31–60 / 61–90 / 90+ aging |
| **Profile** | Update contact details |

## 🛠 Tech Stack

- **React 18 + TypeScript + Vite**
- **React Router** (HashRouter — GitHub Pages safe)
- **TanStack Query** + **Axios** — data fetching & caching
- **Tailwind CSS** — responsive, mobile-first UI
- **Zustand** — session state (AES-encrypted at rest)
- **React Hook Form** — forms
- **crypto-js** — encrypts session data stored in the browser

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
#    then edit .env with your API URL and a storage secret

# 3. Run the dev server
npm run dev
```

### Environment variables (`.env`)

| Variable | Description |
| --- | --- |
| `VITE_API_BASE_URL` | Base URL of the EMS API (e.g. `https://api.example.com/api/v1`). Must be **HTTPS** in production. |
| `VITE_STORAGE_SECRET` | Long random passphrase used to AES-encrypt session data in the browser. |
| `VITE_BASE_PATH` | GitHub Pages base path — `"/<repo-name>/"`. Use `"/"` for local dev. |

---

## 🔒 Security Notes

- Session data (client identity) is **AES-encrypted** before being written to
  `localStorage` via a custom Zustand storage adapter.
- All API traffic must be served over **HTTPS**. GitHub Pages is HTTPS-only, so the
  browser will block any `http://` API calls (mixed content) — point `VITE_API_BASE_URL`
  at an HTTPS endpoint.
- ⚠️ The EMS API currently ships **without server-side authentication**. The Client
  ID + phone "login" here is a lightweight client-side gate only. Before a real public
  launch, add proper auth (JWT/OAuth2) on the API and send tokens from this app.

---

## 📦 Deploy to GitHub Pages

Deployment is automated via GitHub Actions ([.github/workflows/deploy.yml](.github/workflows/deploy.yml)).

1. Push this project to a GitHub repository.
2. In **Settings → Pages**, set **Source** to **GitHub Actions**.
3. In **Settings → Secrets and variables → Actions** add:
   - **Variable** `VITE_API_BASE_URL` — your HTTPS API URL.
   - **Secret** `VITE_STORAGE_SECRET` — a long random string.
4. Push to `main`. The workflow builds and publishes to
   `https://<user>.github.io/<repo>/`.

> `VITE_BASE_PATH` is set automatically in CI from the repository name.

---

## 📁 Project Structure

```
src/
├── api/          # Axios client + typed endpoint modules
├── components/   # Layout + reusable UI primitives
├── hooks/        # TanStack Query hooks
├── lib/          # crypto, storage, formatting, query client
├── pages/        # Route screens
├── store/        # Zustand auth/session store
└── types/        # Shared domain types
```

## 📜 Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint |