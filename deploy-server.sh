#!/bin/bash
# Deploy script for charodejki.ru server

cd /var/www/www-root/data/www/charodejki.ru

echo "=== Loading Images ==="
docker load < backend.tar.gz
docker load < frontend.tar.gz

echo "=== Tagging ==="
docker tag watch-backend:latest localhost/watch-backend:latest
docker tag watch-front:latest localhost/watch-front:latest

echo "=== Starting Services ==="
docker compose -f docker-compose.isp.yml up -d

echo "=== Waiting for DB ==="
sleep 10

echo "=== Running Migrations ==="
docker compose -f docker-compose.isp.yml exec backend npx prisma migrate deploy

echo "=== Seeding Database ==="
docker compose -f docker-compose.isp.yml exec backend npx prisma db seed

echo "=== Done ==="
echo "Site should be available at: https://charodejki.ru"
