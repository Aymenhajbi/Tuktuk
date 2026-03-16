#!/bin/bash
# Stop all Docker containers

echo "🛑 Stopping all containers..."
docker compose down

echo "✅ All containers stopped"
echo ""
echo "To remove volumes as well: docker compose down -v"
