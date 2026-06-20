# HouseMate Project Setup Guide

Welcome to the **HouseMate** (powered by **HouseSync**) development repository. This workspace contains a modular decoupled web architecture with a Laravel PHP backend API, an Angular frontend client, and a Docker containerization orchestration framework.

---

## 📂 Project Architecture

```
/opt/HouseMate/HouseMate
├── api/             # Laravel PHP backend API (GraphQL via Lighthouse)
├── ui/              # Angular frontend SPA client
└── infra/           # Docker Compose infrastructure configurations
```

---

## ⚡ Quick Start: Docker Setup

To build and spin up the complete development environment inside Docker, run the following steps:

### 1. Build and Start Containers
From the workspace root directory:
```bash
cd infra
docker compose up --build -d
```
This launches the following containers:
*   **`housemate-ui`** (Node 22, serving the Angular app at `http://localhost:4200`)
*   **`housemate-api`** (PHP 8.4 + Apache, serving the API at `http://localhost:8000`)
*   **`housemate-db`** (MySQL 8, exposed externally on port `3309`)

*Note: The containers are configured with **self-healing commands**. On initial boot-up, `npm install` and `composer install` will run automatically if dependencies are not present or need updates.*

### 2. Setup Laravel Configuration & Key
Create `.env` file for the API if not present and generate key:
```bash
docker exec -it housemate-api cp .env.example .env
docker exec -it housemate-api php artisan key:generate
```

### 3. Run Migrations and Seeders
Initialize the database tables and populate the default permissions, navigation paths, and users:
```bash
docker exec -it housemate-api php artisan migrate --seed
```

---

## 🛠️ Local Host Development (Without Docker)

If you prefer to run services directly on your host machine or WSL instance:

### Backend API:
1. Navigate to `/api` and install dependencies:
   ```bash
   composer install
   ```
2. Copy and configure your environment:
   ```bash
   cp .env.example .env
   # Update DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, DB_PASSWORD
   php artisan key:generate
   ```
3. Run migrations and seed data:
   ```bash
   php artisan migrate --seed
   ```
4. Start the Laravel dev server:
   ```bash
   php artisan serve --port=8000
   ```

### Frontend UI:
1. Navigate to `/ui` and install packages:
   ```bash
   npm install
   ```
2. Run the Angular CLI server:
   ```bash
   npx ng serve
   ```

---

## ⚠️ Troubleshooting "housemate-ui exited with code 1" / "housemate-api exited"

If containers exit on startup, refer to the following common issues:

### 1. Node Engine Version Mismatch
The Angular CLI setup for this project requires **Node.js version >= 22** (as defined in `ui/package.json`). 
*   **Fix**: We have updated `infra/docker-compose.yml` to use `image: node:22` and configured it to use `npm run start` to properly resolve executable packages.

### 2. Missing `node_modules` or `vendor`
If the backend or frontend containers exit due to missing dependencies before the initial build can finish:
*   **Fix**: We have added automatic bootstrap/installation script commands to `docker-compose.yml` that run `composer install` and `npm install` inside the containers automatically on first boot.

### 3. Port Conflict (Address Already in Use)
If you already have a server running on port `4200` or `8000`:
*   **Fix**: Either stop the other server, or change the exposed port in `infra/docker-compose.yml`.

### 4. Database Access Denied (SQLSTATE[HY000] [1045])
If you encounter `Access denied for user 'housemate_user'@'...'` when running migrations:
*   **Cause**: Docker's persistent MySQL volume (`mysql_data`) preserves credentials from when the volume was first initialized. If you previously started the containers with different DB credentials (e.g. from the template configuration), MySQL will reject the new credentials until the volume is rebuilt.
*   **Fix**: Reset the persistent database volume and recreate the services:
    ```bash
    docker compose down -v
    docker compose up -d
    ```
    *WARNING: This will clear all existing data in the local containerized database.*
