# Setting Up MongoDB for LottoGlobal

Your project requires a MongoDB database to store lottery results. Since no local installation was found, follow one of these two options:

## Option A: Install Local MongoDB (Recommended for Speed)
This runs the database on your own computer.

1.  **Download**: Go to the [MongoDB Community Server Download Page](https://www.mongodb.com/try/download/community).
2.  **Install**:
    *   Run the installer (`.msi`).
    *   Select "Complete" setup.
    *   **IMPORTANT**: Check "Install MongoDB as a Service".
    *   Finish the installation.
3.  **Verify**:
    *   Open Task Manager (Ctrl+Shift+Esc).
    *   Go to "Services" tab.
    *   Look for `MongoDB` and ensure status is "Running".
4.  **Connect**:
    *   Your project is already configured to connect to `mongodb://localhost:27017/lottery_db` in `.env.local`.
    *   Just run `npm run dev` and `npm run scrape:hub`!

---

## Option B: Use MongoDB Atlas (Cloud)
This runs the database in the cloud (free tier available).

1.  **Create Account**: Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register).
2.  **Deploy Cluster**: Create a free "Shared" cluster.
3.  **Get Connection String**:
    *   Click "Connect".
    *   Choose "Drivers" -> "Node.js".
    *   Copy the connection string (it looks like `mongodb+srv://<username>:<password>@cluster0.mongodb.net/...`).
4.  **Update Project**:
    *   Open `.env.local` in your project folder `d:\UsaLotto`.
    *   Replace `MONGODB_URI` with your new connection string.
    *   Replace `<password>` with your actual database user password.

## Troubleshooting
If you installed MongoDB but still get errors:
1.  Open Windows Services (`Win+R` -> `services.msc`).
2.  Find **MongoDB Server**.
3.  Right-click -> **Start**.
