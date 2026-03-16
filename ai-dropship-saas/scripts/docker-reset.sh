#!/bin/bash
# Reset Docker environment (delete volumes and rebuild)

echo "⚠️  WARNING: This will delete all volumes and reset the database!"
read -p "Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "Cancelled."
  exit 1
fi

echo "🛑 Stopping containers..."
docker compose down -v

echo "🏗️  Rebuilding images..."
docker compose build --no-cache

echo "🔧 Starting services..."
docker compose up -d

echo "⏳ Waiting for services..."
sleep 5

echo "✅ Environment reset complete!"
docker compose ps
