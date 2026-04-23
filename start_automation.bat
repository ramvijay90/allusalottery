@echo off
cd /d "D:\UsaLotto"
echo ==========================================
echo    LOTTERY SCRAPER AUTOMATION SERVICE
echo ==========================================
echo.
echo 🕒 Scheduler Intervals:
echo    - Live Results: Every 15 Minutes
echo    - Discovery:    Daily at 2:00 AM
echo    - History:      Daily at 3:00 AM
echo.
echo ⚡ Starting Background Scheduler...
cmd /c npx tsx lottery-scraper/scheduler.ts
pause
