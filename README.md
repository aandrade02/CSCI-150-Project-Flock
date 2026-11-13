# CSCI-150-Project-Flock: Operation Flock Lite

Real-time parking lot occupancy monitoring for Fresno State campus parking.

---

## Prerequisites: Installing Docker & Docker Compose

If Docker is not already installed on your machine:

### Linux (Ubuntu / Debian)
```bash
sudo apt update  
sudo apt install -y docker.io docker-compose-v2  
sudo usermod -aG docker $USER  
newgrp docker  
```

### macOS & Windows
Download and install [Docker Desktop](https://www.docker.com/products/docker-desktop/). Ensure Docker Desktop is running before proceeding.

---

## Running the Application with Docker

From the root directory of this repository:

### 1. Build and Start All Containers
```bash
docker compose up -d --build
```

This starts all three services in the background:
* **PostgreSQL Database** (`flocklite-db`) — database storage on port `5432` (internal network).
* **Django Backend / Database API** (`flocklite-backend`) — available on port `800`.
* **React Frontend** (`frontend`) — available on port `5173`.

### 2. Verify Container Status
```bash
docker compose ps
```

### 3. Open in Your Web Browser
* **Frontend Dashboard**: [http://127.0.0.1:5173](http://127.0.0.1:5173)
* **Backend API (Lot Occupancy)**: [http://127.0.0.1:800/api/lots](http://127.0.0.1:800/api/lots)
* **Django Admin**: [http://127.0.0.1:800/admin/](http://127.0.0.1:800/admin/)

---

## Running Commands Inside the Docker Container

You can run commands directly inside the running containers using `docker compose exec <COMMAND>` without needing a local Python or PostgreSQL installation.

### Opening an Interactive Shell
To get an interactive shell inside the backend container:
```bash
docker compose exec flocklite-backend sh
```
*(Any code edits made in `database/dev/` on your host machine are automatically synced into the container via live volume mounts).*

---

## Viewing Logs & Stopping Containers

* **View live logs for all services**:
  ```bash
  docker compose logs -f
  ```
* **View logs for backend only**:
  ```bash
  docker compose logs -f flocklite-backend
  ```
* **Stop all containers**:
  ```bash
  docker compose down
  ```
* **Stop and delete database** (resets database to clean state):
  ```bash
  docker compose down -v
  ```
