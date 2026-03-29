# LottoGlobal - Full Stack Lottery Platform

A premium, high-performance lottery results platform built with **Next.js**, **Tailwind CSS**, and **MongoDB**.

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+)
- **MongoDB** (You must have a local instance running or a cloud connection string)

### 2. Environment Setup
Create a `.env.local` file in the root directory:
```bash
MONGODB_URI=mongodb://localhost:27017/lottery_db
# OR for MongoDB Atlas:
# MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/lottery_db
```

### 3. Installation
```bash
npm install
```

### 4. Running the App
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🕷️ Scrapers (Automation)

The project includes built-in scrapers to populate your database from `lotterypost.com`.

| Command | Purpose |
|---|---|
| `npm run scrape:hub` | Fetches all countries & states (Run this first!) |
| `npm run scrape:state az` | Fetches latest results for a state (e.g., Arizona) |
| `npm run scrape:history az pick3` | Fetches historical results for a specific game |
| `npm run scrape:all` | **(NEW)** Batch runs scraper for ALL states in database |
| `npm run start:scheduler` | **(NEW)** Starts the automatic background scheduler |

### **How to Run Automation**
Since `npm run dev` must stay running for the website to work, you need to open a **New Terminal** for the scraper.

1.  **Terminal 1**: `npm run dev` (Keeps the website online)
2.  **Terminal 2**: `npm run start:scheduler` (Runs in the background to update data)

**Example First Run:**
1. Ensure MongoDB is running.
2. Run `npm run scrape:hub`.
3. Run `npm run scrape:state az` (to get some data).
4. Start the app with `npm run dev`.

---

## 🛠️ Technology Stack
- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v3
- **Database**: MongoDB (via Mongoose)
- **Scraping**: Axios + Cheerio
- **Icons**: Lucide React
