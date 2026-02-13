# AI Dropship SaaS V2

Plateforme SaaS headless API-first pour détection de winning products, intelligence concurrentielle, scoring IA et orchestration semi-autonome.

## Architecture V2
```
ai-dropship-saas
  /apps
    /frontend
    /backend
    /scraper-service
    /ai-engine
    /data-pipeline
    /orchestrator
  /packages
    /ui
    /shared-types
    /event-bus
  /infrastructure
    /k8s
    /terraform
```

## Backend modules clés
- `winning-engine`: scoring composite + seuil d'import
- `competitor-intelligence`: snapshot concurrent + indexation Elasticsearch
- `tiktok-analyzer`: score viralité + OCR/frame/transcript flags
- `ai-core`: génération marketing + prédiction
- `auto-pricing`: marge/ROAS/prix dynamique
- `orchestrator`: cerveau de décision (import auto, pricing, campagne test)

## Async AI pipeline
- Queue BullMQ `ai-scoring`
- Retry exponentiel + DLQ `ai-scoring-dlq`
- Worker `apps/ai-engine` asynchrone
- Cache embeddings (in-memory baseline, Redis-ready)

## Anti-block scraping
- Proxy rotation + health score
- Fingerprint masking
- Rate adaptation
- CAPTCHA fallback strategy
- Priority scraping queue

## Frontend SaaS routes
- `/dashboard`
- `/winning-lab`
- `/competitor-radar`
- `/trend-monitor`
- `/profit-simulator`
- `/ai-campaign-studio`
- `/settings`
- `/billing`
- `/auth`
