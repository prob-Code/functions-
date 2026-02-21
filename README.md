# 🤖 Founder Daily Engine

A fully automated production-ready system for daily GitHub updates, metrics tracking, and experiment logging.

## 📊 Status Board
- **Last Updated:** <!-- LAST_UPDATED --> **2026-02-21**
- **Current Streak:** <!-- STREAK --> **3**
- **Total Commits:** <!-- TOTAL_COMMITS --> **6**
- **System Status:** ✅ Operational

## 🚀 Quick Start (First Time Setup)

Since this is a new project, follow these steps to initialize and run the first update:

1.  **Initialize Git Repository**
    ```bash
    git init
    git branch -M main
    git add .
    git commit -m "Initial commit of Founder Daily Engine"
    ```

2.  **Add Your Remote (if pushing to GitHub)**
    ```bash
    git remote add origin https://github.com/prob-Code/functions-.git
    git push -u origin main
    ```

3.  **Run Manually (to verify)**
    ```bash
    node daily-engine.js
    ```
    This will generate the data files and update the README.

4.  **Check Results**
    - `progress-log.md`: Should have a new entry.
    - `README.md`: Status board should be updated.
    - `data/daily-data.json`: Should have fetched data.
    - `experiments/metrics.json`: Should have a new experiment log.

## ⚙️ How It Works
- **Daily Cron Job**: The `.github/workflows/daily-engine.yml` runs every day at 09:00 IST.
- **Data Fetching**: Pulls live crypto prices (CoinGecko) and weather data (OpenMeteo).
- **Smart Logic**: Prevents duplicate entries for the same day.
- **Streak Tracking**: Maintains a daily streak counter based on consecutive updates.

## 🛠️ Configuration
Edit `daily-engine.js` to change:
- **Weather Location**: Modify the latitude/longitude in `CONFIG.weatherApi`. 
- **Crypto Coins**: Change the `ids` parameter in `CONFIG.cryptoApi`.
