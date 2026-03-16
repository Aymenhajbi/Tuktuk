#!/bin/bash
# Docker development environment startup script

set -e

echo "🚀 Starting AI Dropship SaaS Development Environment..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "📝 Creating .env from .env.example..."
  cp .env.example .env
fi

# Stop existing containers if running
if docker ps -q --filter "name=tuktuk-" > /dev/null; then
  echo "🛑 Stopping existing containers..."
  docker compose down 2>/dev/null || true
fi

# Build images
echo "🏗️  Building Docker images..."
docker compose build --no-cache

# Start services
echo "🔧 Starting services..."
docker compose up -d

# Wait for services to be healthy
echo "⏳ Waiting for services to be healthy..."
sleep 5

# Display service status
echo ""
echo "✅ Services started successfully!"
echo ""
echo "📊 Service Status:"
docker compose ps

echo ""
echo "🌐 Access Points:"
echo "  - Storefront Marketplace: http://localhost:3000"
echo "  - Admin Dashboard: http://localhost:3002"
echo "  - Backend API: http://localhost:3001"
echo "  - Swagger Docs: http://localhost:3001/api/docs"
echo "  - Redis: localhost:6379"
echo "  - PostgreSQL: localhost:5432"
echo ""
echo "📋 Useful Commands:"
echo "  - View logs: docker compose logs -f <service>"
echo "  - Stop all: docker compose down"
echo "  - Restart service: docker compose restart <service>"
echo "  - Shell access: docker compose exec <service> sh"
echo ""
