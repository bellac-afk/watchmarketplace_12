# КОМАНДЫ ДЛЯ CHARODEJKI.RU

# Полный деплой (одна команда)
cd /var/www/www-root/data/www/charodejki.ru && bash deploy.sh

# Или пошагово:
cd /var/www/www-root/data/www/charodejki.ru
docker compose down
docker compose up -d --build
sleep 30
docker compose exec backend npx prisma migrate deploy
docker compose exec backend npx prisma db seed

# Проверка статуса
docker compose ps
docker compose logs backend --tail 20
docker compose logs frontend --tail 10

# Перезапуск
docker compose restart

# Остановка
docker compose down

# Очистка (всё удалить)
docker compose down -v
docker system prune -a
