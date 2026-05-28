# StockFlow — Inventory & Order Management System

A full-stack Inventory & Order Management System built with **FastAPI**, **React**, and **PostgreSQL**, fully containerized with Docker.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.12, FastAPI, SQLAlchemy |
| Frontend | React 18, React Router v6, Axios |
| Database | PostgreSQL 16 |
| Containerization | Docker, Docker Compose |
| Frontend Server | Nginx (Alpine) |

---

## Features

- **Product Management** — Add, view, update, delete products with SKU/price/stock tracking
- **Customer Management** — Register and manage customers with unique email validation
- **Order Management** — Create orders with multi-item support, automatic stock deduction
- **Inventory Control** — Prevents orders when stock is insufficient; restores stock on cancellation
- **Dashboard** — System-wide stats and low-stock alerts (≤ 10 units)
- **Business Rules** — Unique SKUs, unique emails, non-negative quantities enforced at API + DB level

---

## Quick Start (Docker Compose)

### Prerequisites
- Docker ≥ 24
- Docker Compose ≥ 2

### Run locally

```bash
# 1. Clone
git clone <your-repo-url>
cd inventory-system

# 2. Copy env file
cp .env.example .env
# Edit .env if needed (default credentials work for local dev)

# 3. Start all services
docker compose up --build

# 4. Open in browser
#    Frontend:  http://localhost:3000
#    API docs:  http://localhost:8000/docs
```

---

## API Reference

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/products` | Create product |
| `GET` | `/products` | List all products |
| `GET` | `/products/{id}` | Get product by ID |
| `PUT` | `/products/{id}` | Update product |
| `DELETE` | `/products/{id}` | Delete product |

### Customers

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/customers` | Create customer |
| `GET` | `/customers` | List all customers |
| `GET` | `/customers/{id}` | Get customer by ID |
| `DELETE` | `/customers/{id}` | Delete customer |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/orders` | Create order (reduces stock) |
| `GET` | `/orders` | List all orders |
| `GET` | `/orders/{id}` | Get order details |
| `DELETE` | `/orders/{id}` | Cancel order (restores stock) |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/dashboard` | Summary stats + low stock |

---

## Project Structure

```
inventory-system/
├── backend/
│   ├── main.py          # FastAPI app & routes
│   ├── models.py        # SQLAlchemy ORM models
│   ├── schemas.py       # Pydantic request/response schemas
│   ├── crud.py          # Database operations
│   ├── database.py      # DB connection & session
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/index.js         # Axios API client
│   │   ├── context/ToastContext.js
│   │   ├── pages/
│   │   │   ├── Dashboard.js
│   │   │   ├── Products.js
│   │   │   ├── Customers.js
│   │   │   ├── Orders.js
│   │   │   └── OrderDetail.js
│   │   ├── App.js
│   │   └── App.css
│   ├── public/index.html
│   ├── nginx.conf
│   └── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Environment Variables

Copy `.env.example` to `.env` before running:

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=changeme_in_production
POSTGRES_DB=inventory
REACT_APP_API_URL=http://localhost:8000
```

> **Never commit `.env` to version control.**

---

## Deployment Guide

### Backend — Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo, set root directory to `backend/`
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
5. Add a **PostgreSQL** database on Render and copy the connection string
6. Set env var: `DATABASE_URL=<render-postgres-url>`

### Frontend — Vercel

1. Import your GitHub repo on [vercel.com](https://vercel.com)
2. Set root directory to `frontend/`
3. Build command: `npm run build`
4. Output directory: `build`
5. Set env var: `REACT_APP_API_URL=https://your-backend.onrender.com`

### Docker Hub

```bash
# Build and push backend image
docker build -t yourdockerhubuser/stockflow-backend:latest ./backend
docker push yourdockerhubuser/stockflow-backend:latest
```

---

## Business Rules Implemented

| Rule | Implementation |
|------|---------------|
| Unique product SKU | DB unique constraint + API 400 check |
| Unique customer email | DB unique constraint + API 400 check |
| Non-negative quantity | Pydantic validator + DB check |
| Inventory check on order | Pre-order validation in `POST /orders` |
| Stock deduction on order | `crud.create_order` reduces product quantity |
| Stock restoration on cancel | `crud.delete_order` restores product quantity |
| Auto-calculated total | Backend sums `price × quantity` for each item |

---

## Development (without Docker)

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL=postgresql://postgres:postgres@localhost:5432/inventory
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
REACT_APP_API_URL=http://localhost:8000 npm start
```
