<?php
/**
 * Master Cron Runner for All USA Lottery (allusalottery.com)
 *
 * Runs as ONE single cron job in Hostinger, matching kz and ma setups.
 *
 * Hostinger Cron Entry (every 5 minutes — adjust username/path to your Hostinger directory):
 * */5 * * * * /usr/bin/php /home/YOUR_HOSTINGER_USER/domains/allusalottery.com/public_html/master_cron.php >> /home/YOUR_HOSTINGER_USER/domains/allusalottery.com/public_html/cron.log 2>&1
 */

// 1. Strict Concurrency Lock (prevents process stacking & 120-process limit)
$lockFile = sys_get_temp_dir() . '/allusa_master_cron.lock';
$lockHandle = fopen($lockFile, 'c+');
if (!$lockHandle || !flock($lockHandle, LOCK_EX | LOCK_NB)) {
    // Another instance is still running. Exit quietly to prevent stacking.
    exit(0);
}

// 2. Strict Execution Limits
set_time_limit(50);
ini_set('memory_limit', '128M');
date_default_timezone_set('UTC');

$timestamp = date('Y-m-d H:i:s');
echo "=== All USA Lottery Master Cron Started: {$timestamp} UTC ===\n";

// 3. Secret Token for API Authentication
$secret = 'allusa_cron_secure_2026';
$syncUrl = "https://allusalottery.com/api/cron/live-sync?secret={$secret}";

// 4. Execute HTTP Sync Request
$ch = curl_init();
curl_setopt_array($ch, [
    CURLOPT_URL => $syncUrl,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 40,
    CURLOPT_CONNECTTIMEOUT => 10,
    CURLOPT_SSL_VERIFYPEER => false,
    CURLOPT_USERAGENT => 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    echo "[ERROR] cURL Failed: {$curlError}\n";
} else {
    echo "[HTTP Status: {$httpCode}]\n";
    echo "[RAW RESPONSE: " . htmlspecialchars($response) . "]\n";
}

echo "=== Finished at " . date('Y-m-d H:i:s') . " UTC ===\n\n";

// Release lock
flock($lockHandle, LOCK_UN);
fclose($lockHandle);
