# CS5340-final-project — BorrowIt

**Library of Things digital platform.** Search and reserve tools, appliances, and
other items from partner libraries near you.

- **backend/** — Flask REST API backed by **SQLite (SQLAlchemy)**. Serves the catalog
  and manages reservations against live stock: reserving decrements availability,
  cancelling restores it. The DB (`backend/borrowit.db`) is created and seeded from
  `data.py` automatically on first run.
- **frontend/** — React app (Vite) that fetches from the API and renders every screen
  (home, results, item detail, reserve flow, confirmation, my reservations). It refetches
  after each reservation/cancellation so availability stays live across all screens.
- **prototype/** — the original single-file HTML prototype, kept for reference.

In development the Vite dev server proxies `/api/*` to Flask on port 5000, so the
frontend uses same-origin relative paths and there's no CORS friction.

---

## Prerequisites

| Tool       | Version         | Notes                                                        |
| ---------- | --------------- | ------------------------------------------------------------ |
| **Python** | 3.10+           | For the Flask backend.                                       |
| **Node.js**| 18+ (LTS)       | Vite requires 18+. If your system Node is older, use `nvm` (below). |
| **npm**    | ships with Node |                                                              |

### Installing a modern Node with nvm (if needed)

The system Node on this machine was too old for Vite, so Node is managed with
[`nvm`](https://github.com/nvm-sh/nvm). If `node --version` prints anything below
v18, install nvm + an LTS Node:

```bash
# install nvm (once)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash

# open a new terminal (or source it), then install + use Node LTS
source ~/.nvm/nvm.sh
nvm install --lts
nvm use --lts
```

**Every new terminal** that runs frontend commands needs Node on its `PATH`:

```bash
source ~/.nvm/nvm.sh && nvm use --lts
```

---

## First-time setup

Clone the repo, then set up each half once.

### Backend

```bash
cd backend

# Create an isolated Python environment.
python3 -m venv venv
#   If that fails with "ensurepip is not available" (Debian/Ubuntu without
#   python3-venv and no sudo), use virtualenv instead:
#     python3 -m pip install --user virtualenv
#     python3 -m virtualenv venv

# Install dependencies into the venv.
./venv/bin/pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
source ~/.nvm/nvm.sh && nvm use --lts   # only if you use nvm
npm install
```

---

## Running the app

You need **two terminals** — one per server. Start the backend first.

### Terminal 1 — Backend (Flask, port 5000)

```bash
cd backend
./venv/bin/flask --app app run --debug --port 5000
```

Expect: `Running on http://127.0.0.1:5000`. Leave it running.

### Terminal 2 — Frontend (Vite, port 5173)

```bash
cd frontend
source ~/.nvm/nvm.sh && nvm use --lts   # only if you use nvm
npm run dev
```

Expect: `Local: http://localhost:5173/`.

### Open it

Go to **http://localhost:5173** in your browser. The catalog data is served by
Flask and proxied through Vite.

---

## Useful commands

```bash
# Backend: quick API smoke test (with the server running)
curl http://localhost:5000/api/health
curl http://localhost:5000/api/items

# Frontend: production build (outputs to frontend/dist/)
cd frontend && npm run build

# Frontend: preview the production build locally
cd frontend && npm run preview
```

---

## API endpoints

| Method | Path                              | Description                                                   |
| ------ | --------------------------------- | ------------------------------------------------------------- |
| GET    | `/api/health`                     | Liveness check                                                |
| GET    | `/api/items`                      | All catalog items (with live per-library availability)        |
| GET    | `/api/items/<id>`                 | Single item (404 if not found)                                |
| GET    | `/api/libraries`                  | Library locations                                             |
| GET    | `/api/categories`                 | Item categories                                               |
| GET    | `/api/reservations`               | All reservations; optional `?status=reserved\|cancelled`      |
| POST   | `/api/reservations`               | Create a reservation — **decrements stock** (400 past date, 409 out of stock) |
| POST   | `/api/reservations/<code>/cancel` | Cancel a reservation — **restores stock** (idempotent)        |
| POST   | `/api/notify`                     | Register interest in an out-of-stock item                     |

**Reservation create body:** `{ "item_id", "lib", "pickup_date" (ISO yyyy-mm-dd), "days", "reminders" }`

> Reservations are persisted in SQLite. Stock is decremented on reserve and restored
> on cancel; cancelled reservations remain as history. To reset all data, delete
> `backend/borrowit.db` — it will be re-seeded on the next run.

---

## Troubleshooting

| Symptom                                          | Fix                                                                    |
| ------------------------------------------------ | --------------------------------------------------------------------- |
| Frontend shows "Could not reach the API."        | The Flask backend (Terminal 1) isn't running. Start it on port 5000.  |
| `npm: command not found` / engine/version errors | Node isn't loaded. Run `source ~/.nvm/nvm.sh && nvm use --lts`.        |
| `ensurepip is not available` creating the venv   | Use `virtualenv` instead (see backend setup above).                   |
| Port 5000 or 5173 already in use                 | Stop the other process, or change the port (`--port` / Vite `--port`).|
