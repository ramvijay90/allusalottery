# 🚀 Deployment Guide (Docker)

You can run this application on any Linux server (Ubuntu/Debian recommended) to keep the scraper running 24/7.

## Prerequisites
1.  A server (VPS) with **Docker** and **Docker Compose** installed.
2.  Your MongoDB connection string (or use the built-in one in `docker-compose.yml` if you want a fresh DB).

## Step 1: Copy Files to Server
You need to copy the project files to your server. You can use `scp` or `git`.
Basic files needed:
- `package.json`
- `package-lock.json`
- `Dockerfile`
- `docker-compose.yml`
- `.env.local` (Create this on the server)
- `app/` folder
- `components/` folder
- `lib/` folder
- `lottery-scraper/` folder
- `models/` folder
- `public/` folder
- `next.config.mjs` (and other config files)

## Step 2: Setup on Server

1.  **SSH into your server**:
    ```bash
    ssh user@your-server-ip
    ```

2.  **Navigate to the folder**:
    ```bash
    cd usa-lotto
    ```

3.  **Start the App**:
    ```bash
    docker-compose up -d --build
    ```

## Step 3: Running the Scraper on Server

Once the app is running (check with `docker ps`), you can run the scraper inside the container:

```bash
# Run the global history scraper (background)
docker exec -d usa-lotto-app npm run scrape:history:all -- --year=2025

# Check logs
docker logs -f usa-lotto-app
```

## Step 4: Access the Site
The site will be available at `http://your-server-ip:3000`.

---

## Tips
-   **Resume**: The scraper has smart resume, so if you restart the container, just run the command again.
-   **Updates**: If you change code locally, re-copy it to the server and run `docker-compose up -d --build` again.
