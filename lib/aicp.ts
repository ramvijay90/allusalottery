/**
 * AdSense Invalid Click Protector (AICP) for Next.js
 * Tracks iframe clicks using window blur tracking.
 */

const CLICK_LIMIT = 3;
const TIME_WINDOW_MS = 2 * 60 * 60 * 1000; // 2 hours
const BLOCK_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export function isBlocked(): boolean {
  if (typeof window === 'undefined') return false;

  const blockedUntil = localStorage.getItem('aicp_blocked_until');
  if (blockedUntil) {
    const expiry = parseInt(blockedUntil, 10);
    if (Date.now() < expiry) {
      return true;
    } else {
      // Block expired, clean up
      localStorage.removeItem('aicp_blocked_until');
      localStorage.removeItem('aicp_clicks');
    }
  }
  return false;
}

export function trackClick(): void {
  if (typeof window === 'undefined') return;

  if (isBlocked()) return;

  const now = Date.now();
  let clicksData = localStorage.getItem('aicp_clicks');
  let clicks: number[] = [];

  if (clicksData) {
    try {
      clicks = JSON.parse(clicksData);
    } catch (e) {
      clicks = [];
    }
  }

  // Filter clicks within the active time window
  clicks = clicks.filter(timestamp => now - timestamp < TIME_WINDOW_MS);
  
  // Add new click
  clicks.push(now);
  localStorage.setItem('aicp_clicks', JSON.stringify(clicks));

  console.log(`[AICP] Ad clicked. Total clicks in window: ${clicks.length}/${CLICK_LIMIT}`);

  if (clicks.length >= CLICK_LIMIT) {
    const blockExpiry = now + BLOCK_DURATION_MS;
    localStorage.setItem('aicp_blocked_until', blockExpiry.toString());
    console.warn(`[AICP] Invalid click threshold reached. Ads hidden for 24 hours.`);
    // Trigger local storage event to notify other open tabs
    window.dispatchEvent(new Event('storage'));
  }
}

/**
 * Listens for window blur events. When active element is an iframe,
 * it indicates a click occurred inside that iframe (most likely an ad).
 */
export function setupAICPListener(): () => void {
  if (typeof window === 'undefined') return () => {};

  const handleBlur = () => {
    // Small delay to let document.activeElement update
    setTimeout(() => {
      const activeEl = document.activeElement;
      if (activeEl && activeEl.tagName === 'IFRAME') {
        const isAdSense = 
          activeEl.classList.contains('adsbygoogle') || 
          activeEl.getAttribute('src')?.includes('googleads') || 
          activeEl.getAttribute('id')?.includes('aswift');

        if (isAdSense) {
          trackClick();
        }
      }
    }, 100);
  };

  window.addEventListener('blur', handleBlur);
  return () => {
    window.removeEventListener('blur', handleBlur);
  };
}
