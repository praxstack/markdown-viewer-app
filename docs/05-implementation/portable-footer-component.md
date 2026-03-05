# Reusable Footer Component and Support Widget

This document contains the complete code for the enterprise-grade footer. It is designed to be **portable and copy-paste ready** for any project.

## Quick Start: Single File Drop-in

Copy the entire block below and paste it into any HTML file (e.g., `footer.html` or directly in `index.html`). It contains HTML, CSS, and JS all in one place.

```html
<!-- ==================== BEGIN FOOTER COMPONENT ==================== -->
<style>
  /* Base Variables (Fallbacks if your app doesn't have them) */
  :root {
    --footer-bg: var(--bg-secondary, #f8f9fa);
    --footer-text: var(--text-secondary, #6c757d);
    --footer-border: var(--border-color, #e9ecef);
    --footer-link: var(--link-color, #007bff);
    --footer-link-hover: var(--link-hover, #0056b3);
  }

  /* Footer Styling */
  .app-footer {
    background-color: var(--footer-bg);
    border-top: 1px solid var(--footer-border);
    padding: 12px 20px;
    text-align: center;
    font-size: 14px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: var(--footer-text);
  }

  .footer-content {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 8px;
  }

  .footer-separator {
    color: var(--footer-border);
    font-weight: 300;
  }

  .app-footer a {
    color: var(--footer-link);
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s;
  }

  .app-footer a:hover {
    color: var(--footer-link-hover);
    text-decoration: underline;
  }

  /* Support Widget */
  .support-widget-container {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 32px;
  }

  .support-button {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 13px;
    font-weight: 600;
    text-decoration: none;
    color: white !important; /* Always white text for buttons */
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  .support-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    text-decoration: none;
  }

  .support-button--loading {
    background: linear-gradient(90deg, #e0e0e0 25%, #f0f0f0 50%, #e0e0e0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    color: #888 !important;
    pointer-events: none;
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  .support-button--india {
    background: linear-gradient(135deg, #ff9933 0%, #ff6b00 100%);
  }
  .support-button--india:hover {
    background: linear-gradient(135deg, #ffb366 0%, #ff8533 100%);
  }

  .support-button--global {
    background: linear-gradient(135deg, #29abe0 0%, #1e88e5 100%);
  }
  .support-button--global:hover {
    background: linear-gradient(135deg, #4fc3f7 0%, #42a5f5 100%);
  }

  .support-toggle {
    background: none;
    border: none;
    color: var(--footer-text);
    font-size: 11px;
    cursor: pointer;
    text-decoration: underline;
    opacity: 0.7;
    padding: 0;
  }
  .support-toggle:hover {
    opacity: 1;
    color: var(--footer-link);
  }

  /* Modal Styling */
  .modal-overlay {
    display: none;
    position: fixed;
    z-index: 9999;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(4px);
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  .modal-overlay.active {
    display: block;
    opacity: 1;
  }

  .modal-box {
    background-color: #fff;
    margin: 10% auto;
    padding: 32px;
    border-radius: 12px;
    width: 90%;
    max-width: 500px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    transform: translateY(20px);
    transition: transform 0.3s ease;
    text-align: center;
    color: #333;
    position: relative;
  }
  .modal-overlay.active .modal-box {
    transform: translateY(0);
  }

  /* Dark mode support for modal if system preference */
  @media (prefers-color-scheme: dark) {
    .modal-box {
      background-color: #1e1e1e;
      color: #fff;
    }
  }

  .modal-close {
    position: absolute;
    right: 20px;
    top: 20px;
    font-size: 24px;
    cursor: pointer;
    background: none;
    border: none;
    color: inherit;
    opacity: 0.7;
  }
  .modal-close:hover {
    opacity: 1;
  }

  .support-options {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 12px;
    margin: 24px 0;
  }

  .support-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px;
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    text-decoration: none;
    color: inherit;
    transition: transform 0.2s;
  }
  .support-card:hover {
    transform: translateY(-2px);
    background-color: rgba(0, 0, 0, 0.02);
  }
  .support-card-icon {
    font-size: 24px;
    margin-bottom: 8px;
  }
  .support-card-title {
    font-weight: 600;
    font-size: 14px;
  }
  .support-card-desc {
    font-size: 11px;
    opacity: 0.7;
  }

  @media (max-width: 768px) {
    .footer-content {
      flex-direction: column;
      gap: 6px;
    }
    .footer-separator {
      display: none;
    }
  }
</style>

<!-- Footer Content -->
<footer class="app-footer">
  <div class="footer-content">
    <span>Made with ❤️ by Prax Lannister</span>
    <span class="footer-separator">|</span>
    <span
      >Follow me on
      <a href="https://github.com/PrakharMNNIT" target="_blank" rel="noopener noreferrer">GitHub</a>
      &amp;
      <a href="https://x.com/ByteByByteSrSDE" target="_blank" rel="noopener noreferrer"
        >X (Twitter)</a
      >
    </span>
    <span class="footer-separator">|</span>
    <div class="support-widget-container" id="support-widget">
      <!-- Initial Loading State -->
      <a
        href="https://ko-fi.com/praxlannister?ref=webapp_footer"
        target="_blank"
        class="support-button support-button--loading"
      >
        ☕ Support
      </a>
    </div>
  </div>
</footer>

<!-- Support Modal -->
<div id="support-modal-overlay" class="modal-overlay">
  <div class="modal-box">
    <button class="modal-close" id="support-modal-close">&times;</button>
    <h2>☕ Support the Developer</h2>
    <p>If you find this tool useful, consider supporting its development:</p>

    <div class="support-options">
      <a href="https://github.com/sponsors/PrakharMNNIT" target="_blank" class="support-card">
        <span class="support-card-icon">❤️</span>
        <span class="support-card-title">GitHub</span>
        <span class="support-card-desc">Sponsors</span>
      </a>
      <a href="https://ko-fi.com/praxlannister" target="_blank" class="support-card">
        <span class="support-card-icon">☕</span>
        <span class="support-card-title">Ko-fi</span>
        <span class="support-card-desc">PayPal</span>
      </a>
      <a
        href="https://razorpay.me/@prakharshekharparthasarthi"
        target="_blank"
        class="support-card"
      >
        <span class="support-card-icon">🇮🇳</span>
        <span class="support-card-title">Razorpay</span>
        <span class="support-card-desc">UPI/India</span>
      </a>
    </div>

    <div>
      <label style="font-size: 13px; opacity: 0.8; cursor: pointer;">
        <input type="checkbox" id="support-dont-show-again" /> Don't show this again
      </label>
    </div>
  </div>
</div>

<script>
  (function () {
    // Configuration
    const CONFIG = {
      keys: {
        kofi: 'https://ko-fi.com/praxlannister',
        razorpay: 'https://razorpay.me/@prakharshekharparthasarthi',
        github: 'https://github.com/sponsors/PrakharMNNIT',
      },
      storageKey: 'support_modal_shown',
      regionCacheKey: 'support_region_cache',
    };

    // Logic
    async function init() {
      initModal();
      const region = await getRegion();
      renderWidget(region);
    }

    function initModal() {
      const modal = document.getElementById('support-modal-overlay');
      const closeBtn = document.getElementById('support-modal-close');
      const check = document.getElementById('support-dont-show-again');

      // Check storage
      if (localStorage.getItem(CONFIG.storageKey) === 'true') return;

      // Show after delay
      setTimeout(() => modal.classList.add('active'), 5000);

      const close = () => {
        modal.classList.remove('active');
        if (check.checked) localStorage.setItem(CONFIG.storageKey, 'true');
      };

      closeBtn.onclick = close;
      modal.onclick = e => {
        if (e.target === modal) close();
      };
      document.onkeydown = e => {
        if (e.key === 'Escape') close();
      };
    }

    async function getRegion() {
      const cached = sessionStorage.getItem(CONFIG.regionCacheKey);
      if (cached) return cached;

      try {
        // 300ms timeout race for geo-ip
        const race = new Promise(resolve => setTimeout(resolve, 300, { country_code: 'Global' }));
        const fetchReq = fetch('https://ipapi.co/json/')
          .then(res => res.json())
          .catch(() => ({ country_code: 'Global' }));

        const data = await Promise.race([fetchReq, race]);
        // Note: 'data' might be undefined if timeout wins with no value, but here race returns obj
        const region = data && data.country_code === 'IN' ? 'india' : 'global';

        sessionStorage.setItem(CONFIG.regionCacheKey, region);
        return region;
      } catch {
        return 'global';
      }
    }

    window.toggleSupportRegion = function () {
      const current = sessionStorage.getItem(CONFIG.regionCacheKey) || 'global';
      const next = current === 'india' ? 'global' : 'india';
      sessionStorage.setItem(CONFIG.regionCacheKey, next);
      renderWidget(next);
    };

    function renderWidget(region) {
      const container = document.getElementById('support-widget');
      if (!container) return;

      const isIndia = region === 'india';
      container.innerHTML = `
      <a href="${isIndia ? CONFIG.keys.razorpay : CONFIG.keys.kofi}"
         target="_blank"
         class="support-button ${isIndia ? 'support-button--india' : 'support-button--global'}">
         ${isIndia ? '🇮🇳 Support via UPI' : '☕ Support via Ko-fi'}
      </a>
      <button class="support-toggle" onclick="toggleSupportRegion()">
        ${isIndia ? 'Not in India?' : 'In India? Use UPI'}
      </button>
    `;
    }

    // Run
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
  })();
</script>
<!-- ==================== END FOOTER COMPONENT ==================== -->
```

## How to Configure

1.  **API Keys/Links**:
    - Update the `CONFIG` object in the script tag to change your donation links.
    - `kofi`: Ko-fi profile URL.
    - `razorpay`: Razorpay payment page URL.
    - `github`: GitHub Sponsors URL.

2.  **Geo-Location**:
    - The code uses `https://ipapi.co/json/` (free tier) to detect if the user is in India.
    - No API key is required for basic usage.
    - If you have a paid plan, update the fetch URL to `https://ipapi.co/json/?key=YOUR_KEY`.

3.  **Styling**:
    - The CSS uses variables (like `var(--footer-bg)`) but includes default values.
    - It will automatically adapt to your app's theme if you define these variables, or look clean even if you don't.
