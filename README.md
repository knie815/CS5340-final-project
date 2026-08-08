# BorrowIt — a Library of Things

## System Overview

**BorrowIt** is a web app for borrowing *things* from a network of partner public libraries. Most households buy tools they use once or twice a
year, and while "libraries of things" do exist, they are typically hard
to use due to
each branch keeping its inventory via different databases and 
checkout systems. BorrowIt fills
that gap with a single searchable catalog across partner libraries, a date-aware
availability calendar, and library-card sign-in so each borrower gets a
personal reservation history with pickup dates, return-by dates, and cancellation for all libraries.
The result is an smooth borrowing experience for community-owned equipment,
which lowers the barrier to sharing.

### Repository layout

| Path         | What's in it                                                                     |
| ------------ | -------------------------------------------------------------------------------- |
| `backend/`   | Flask REST API over **SQLite (SQLAlchemy)**. Catalog, users, reservations, availability. |
| `frontend/`  | React 19 single-page app built with Vite (home, search results, item detail, reserve flow with calendar, confirmation, my reservations, sign-in/register). |
| `prototype/` | The original single-file HTML prototype, kept for reference. Not part of the running app. |

The database (`backend/borrowit.db`) is created and seeded automatically from
`backend/seed.py` / `backend/seed_data.py` the first time the backend starts, so
there is no migration step. In development the Vite dev server proxies `/api/*` to
Flask on port 5000, so the frontend uses same-origin relative paths and there is no
CORS friction.

---

## Prerequisites & Dependencies

### Runtimes (install these yourself)

| Software     | Required version | Verified on | Notes                                       |
| ------------ | ---------------- | ----------- | ------------------------------------------- |
| **Python**   | 3.10 or newer    | 3.10.12     | Runs the Flask backend.                     |
| **pip**      | ships with Python | —          | `python3 -m ensurepip` if missing.          |
| **Node.js**  | 18 LTS or newer  | 24.18.0     | Required by Vite 8. See the nvm note below. |
| **npm**      | ships with Node  | 11.x        | Installs frontend packages.                 |
| **git**      | any recent       | —           | To clone the repo.                          |

Check what you have:

```bash
python3 --version    # need >= 3.10
node --version       # need >= 18
npm --version
```

### Backend packages (installed by `pip install -r backend/requirements.txt`)

| Package              | Version |
| -------------------- | ------- |
| `Flask`              | 3.1.0   |
| `flask-cors`         | 5.0.0   |
| `Flask-SQLAlchemy`   | 3.1.1   |

SQLite itself needs no installation — it ships inside Python's standard library.

### Frontend packages (installed by `npm install` in `frontend/`)

| Package                | Version  | Type |
| ---------------------- | -------- | ---- |
| `react`                | ^19.2.7  | dep  |
| `react-dom`            | ^19.2.7  | dep  |
| `vite`                 | ^8.1.1   | dev  |
| `@vitejs/plugin-react` | ^6.0.3   | dev  |
| `oxlint`               | ^1.71.0  | dev  |
| `@types/react`, `@types/react-dom` | ^19.2.x | dev |

Exact versions are pinned in `frontend/package-lock.json`.

### If your Node is older than 18

Vite 8 will refuse to start. Install a modern Node with
[`nvm`](https://github.com/nvm-sh/nvm):

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
source ~/.nvm/nvm.sh
nvm install --lts
nvm use --lts
```

**Every new terminal** that runs frontend commands then needs:
`source ~/.nvm/nvm.sh && nvm use --lts`

---

## Setup & Execution Instructions

Sequential, from nothing to a running app.

### 1. Clone the repository

```bash
git clone https://github.com/knie815/CS5340-final-project.git
cd CS5340-final-project
```

### 2. Install backend dependencies (once)

```bash
cd backend
python3 -m venv venv
./venv/bin/pip install --upgrade pip
./venv/bin/pip install -r requirements.txt
cd ..
```

> If `python3 -m venv venv` fails with `ensurepip is not available` (Debian/Ubuntu
> without `python3-venv` and no sudo), use virtualenv instead:
> ```bash
> python3 -m pip install --user virtualenv
> python3 -m virtualenv venv
> ```
> On Windows the interpreter paths are `venv\Scripts\pip` and `venv\Scripts\flask`.

### 3. Install frontend dependencies (once)

```bash
cd frontend
npm install          # prefix with: source ~/.nvm/nvm.sh && nvm use --lts   (if you use nvm)
cd ..
```

### 4. Launch the backend — Terminal 1 (Flask, port 5000)

```bash
cd backend
./venv/bin/flask --app app run --debug --port 5000
```

Expect `Running on http://127.0.0.1:5000`. On this first run the app creates
`borrowit.db` and seeds 5 libraries, 6 categories, 9 items, the demo account, and a
few demo reservations. **Leave this terminal running.**

### 5. Launch the frontend — Terminal 2 (Vite, port 5173)

```bash
cd frontend
source ~/.nvm/nvm.sh && nvm use --lts   # only if you use nvm
npm run dev
```

Expect `Local: http://localhost:5173/`.

### 6. Open the app

Go to **<http://localhost:5173>** in your browser. Browsing works signed-out;
sign in with the credentials below to reserve.

---

## Test Credentials

A demo library card is seeded automatically on first run. Sign in at the **Sign in**
button in the top bar (the login screen also shows this hint).

| Field                   | Value       |
| ----------------------- | ----------- |
| **Library card number** | `1001`      |
| **Password**            | `borrow123` |

This account belongs to *Katherine Nie* at Cambridge Central Library and starts with
four seeded reservations so **My Reservations** is populated immediately — one
currently borrowed, two upcoming, and one cancelled.

You can also create your own account: **Register a library card** on the sign-in
screen. Pick any partner library, invent any unused card number and password, and
you're in — new accounts start with an empty reservation list, which is useful for
seeing the flow from scratch.

> **Resetting the demo data:** stop the backend, delete `backend/borrowit.db`, and
> start it again. Everything (including the demo account and its reservations) is
> re-seeded relative to the current date.

---

## What to try as a grader

1. **Browse & search** — search "drill" or pick a category from the home page.
2. **Reserve** — open an item, choose a library and a pickup date on the calendar
   (fully booked days are greyed out), pick a loan length, confirm. You'll be sent
   to sign-in first if you're not logged in.
3. **See availability change** — after reserving the last copy for a date range,
   revisit the item; those dates are now unavailable at that library.
4. **My Reservations** — view your bookings with reservation codes and return-by
   dates, and cancel one. The freed dates immediately become bookable again.

---

## API reference

| Method | Path                                       | Description                                                                 |
| ------ | ------------------------------------------ | --------------------------------------------------------------------------- |
| GET    | `/api/health`                              | Liveness check                                                              |
| POST   | `/api/login`                               | Sign in — `{ card_number, password }` (401 on bad credentials)              |
| POST   | `/api/register`                            | Create an account — `{ name, lib, card_number, password }` (409 if the card exists) |
| GET    | `/api/libraries`                           | Partner libraries with distance and hours                                   |
| GET    | `/api/categories`                          | Item categories                                                             |
| GET    | `/api/items`                               | All catalog items, with copies available *today* per library                |
| GET    | `/api/items/<id>`                          | A single item (404 if unknown)                                              |
| GET    | `/api/items/<id>/availability?lib=&days=`  | Fully-booked upcoming dates at a library — powers the calendar              |
| GET    | `/api/reservations?user=<card>&status=`    | That user's reservations (empty without `user`)                             |
| POST   | `/api/reservations`                        | Create a reservation (401 signed-out, 400 past date, 409 no free copy)      |
| POST   | `/api/reservations/<code>/cancel`          | Cancel a reservation (idempotent)                                           |
| POST   | `/api/notify`                              | Register interest in an out-of-stock item                                   |

**Create-reservation body:** `{ "item_id", "lib", "pickup_date" (ISO yyyy-mm-dd), "days", "reminders", "user" }`

### How availability works

Each `(item, library)` pair has a fixed **capacity** — the number of physical copies
that branch owns. Copies are never mutated. Availability for a given day is computed
at request time by subtracting the reservations that overlap that day. A loan
occupies `[pickup_date, return_date)`, so the return day is free again for the next
borrower. Cancelling a reservation simply marks it `cancelled`, and the dates it held
become available again automatically. This is why an item with zero copies free today
can still be booked for next month.

Errors are returned as JSON (`{"error": ..., "description": ...}`) so the UI can show
the real message.

---

## Useful commands

```bash
# Backend smoke test (with the server running)
curl http://localhost:5000/api/health
curl http://localhost:5000/api/items
curl -X POST http://localhost:5000/api/login \
  -H 'Content-Type: application/json' \
  -d '{"card_number":"1001","password":"borrow123"}'

# Frontend: lint
cd frontend && npm run lint

# Frontend: production build (outputs to frontend/dist/) and preview it
cd frontend && npm run build && npm run preview
```

---

## Troubleshooting

| Symptom                                           | Fix                                                                     |
| ------------------------------------------------- | ----------------------------------------------------------------------- |
| Frontend shows "Could not reach the API."         | The Flask backend (Terminal 1) isn't running. Start it on port 5000.    |
| `npm: command not found` / engine or version errors | Node isn't loaded or is too old. `source ~/.nvm/nvm.sh && nvm use --lts`. |
| `ensurepip is not available` creating the venv    | Use `virtualenv` instead — see step 2.                                  |
| Port 5000 or 5173 already in use                  | Stop the other process, or pass a different `--port`.                   |
| Sign-in rejects `1001` / `borrow123`              | The DB predates the demo account. Delete `backend/borrowit.db` and restart the backend. |
| Calendar shows everything greyed out              | You picked a library that doesn't carry that item — switch libraries.   |
