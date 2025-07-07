# Simple Messaging App

A bare‑bones clone of Facebook Messenger / WhatsApp built for a take‑home assignment.
The goal is **code quality and real‑time behaviour**, not pixel‑perfect design or enterprise‑grade security.

---

## Requirements
- **Node.js v20 or later** (v22 recommended).
- **Docker**

## 📦 Tech Stack

| Layer | Tech                              |
|-------|-----------------------------------|
| Front‑end | **React + TypeScript + Vite**     |
| Styling/UI | **Tailwind** + **shadcn/ui**      |
| Data fetching | **tRPC + TanStack Query**         |
| Real‑time | **tRPC subscriptions over WebSocket** |
| Back‑end | **Node + Express + tRPC**         |
| ORM | **Prisma** → PostgreSQL           |
| DB | **PostgreSQL (Docker)**           |

---

## 🚀 Quick Start (local dev)

### 1. Back‑end
```bash
# at repo root
cd server

# start database
docker compose up -d db

# install dependencies
npm i

# run migrations & generate Prisma client
npx prisma migrate deploy

# seed demo users
npx ts-node prisma/seed.ts

# start server
npx ts-node src/server.ts
```

### 2. Front‑end
In a separate terminal:
```bash
# at repo root
cd web

# install dependencies
npm i

# start frontend
npm run dev
```
Navigate to http://localhost:5173 — you’ll land on the Login screen.

---

## 🔑 Demo Credentials (from seed script)

| id | username  | password      |
|----|-----------|---------------|
| 1  | **alice** | `password123` |
| 2  | **bob**   | `password456` |
| 2  | **nils**  | `password789` |

*Log in as either user in two browser windows to see real‑time chat across sessions.*

---

## 💬 Starting a Chat

1. **Log in** as *alice*, *bob* or *nils*.
2. Click the input field in the top left sidebar.
3. **Type another user’s username** (e.g.`bob`) and press **Enter** or the `+` button.
4. A new thread appears instantly and is auto‑selected.
5. Type your message in the composer at the bottom and hit **Send** — it pops up in the other user’s window in real time.
6. Log-out is not implemented yet, so to log in as another user clear cookies and refresh the page.

---

Happy chatting! 🚀

