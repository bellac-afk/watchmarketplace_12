#!/bin/bash
set -e

cd /var/www/www-root/data/www/charodejki.ru

echo "=== Stopping old containers ==="
docker compose down 2>/dev/null || true

echo "=== Removing old images ==="
docker rmi watch-marketplace-backend watch-marketplace-frontend 2>/dev/null || true
docker rmi $(docker images -f "dangling=true" -q) 2>/dev/null || true

echo "=== Building and starting ==="
docker compose up -d --build

echo "=== Waiting for database (30 sec) ==="
sleep 30

echo "=== Running migrations ==="
docker compose exec backend npx prisma migrate deploy

echo "=== Seeding database ==="
docker compose exec backend npx prisma db seed || echo "Seed completed or skipped"

echo "=== Status ==="
docker compose ps

echo "=== Done! Site should be at https://charodejki.ru ==="
