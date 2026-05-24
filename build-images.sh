#!/bin/bash
# Build images locally and save for upload

cd "$(dirname "$0")"

echo "=== Building Backend ==="
docker build -t watch-backend:latest ./backend

echo "=== Building Frontend ==="
docker build -t watch-front:latest ./frontend

echo "=== Saving Images ==="
docker save watch-backend:latest | gzip > backend.tar.gz
docker save watch-front:latest | gzip > frontend.tar.gz

echo "=== Done ==="
echo "Upload to server:"
echo "  scp backend.tar.gz root@charodejki.ru:/var/www/www-root/data/www/charodejki.ru/"
echo "  scp frontend.tar.gz root@charodejki.ru:/var/www/www-root/data/www/charodejki.ru/"
