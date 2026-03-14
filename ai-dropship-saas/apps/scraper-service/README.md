# Scraper Service

## Anti-block production strategy
- ProxyPool rotation automatique par score de santé
- Health check proxy avec feedback de latence/échec
- Browser fingerprint masking + user-agent randomization
- Rate adaptation dynamique (throttling adaptatif)
- CAPTCHA handling (fallback human-in-the-loop)
- Queue de scraping priorisée (TikTok/Meta/Shopify)

## Évolution prévue
- Cluster headless browser (Playwright/Puppeteer)
- Retry distributed + quarantine proxy
- Persist jobs dans BullMQ
