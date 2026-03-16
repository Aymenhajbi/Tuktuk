#!/bin/bash
# View logs for all services or specific service

SERVICE=${1:-""}

if [ -z "$SERVICE" ]; then
  echo "📋 Showing logs for all services (Ctrl+C to exit)..."
  docker compose logs -f --tail=100
else
  echo "📋 Showing logs for $SERVICE (Ctrl+C to exit)..."
  docker compose logs -f --tail=100 "$SERVICE"
fi
