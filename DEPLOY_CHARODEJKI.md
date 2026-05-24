# Развёртывание на charodejki.ru (ISPmanager)

## Путь на сервере: /var/www/www-root/data/www/charodejki.ru

### Шаг 1: На вашем ПК (локально)

```bash
# 1. Перейдите в папку проекта
cd watch-marketplace

# 2. Соберите образы
docker build -t watch-backend:latest ./backend
docker build -t watch-front:latest ./frontend

# 3. Сохраните в архивы
docker save watch-backend:latest | gzip > backend.tar.gz
docker save watch-front:latest | gzip > frontend.tar.gz
```

### Шаг 2: Загрузка на сервер

**Способ A - SCP (терминал):**
```bash
scp backend.tar.gz root@charodejki.ru:/var/www/www-root/data/www/charodejki.ru/
scp frontend.tar.gz root@charodejki.ru:/var/www/www-root/data/www/charodejki.ru/
scp docker-compose.isp.yml root@charodejki.ru:/var/www/www-root/data/www/charodejki.ru/
scp .env.isp root@charodejki.ru:/var/www/www-root/data/www/charodejki.ru/.env
scp -r docker/nginx root@charodejki.ru:/var/www/www-root/data/www/charodejki.ru/docker/
```

**Способ B - FileZilla (GUI):**
- Хост: charodejki.ru
- Порт: 22 (SFTP)
- Пользователь: root
- Загрузите файлы в `/var/www/www-root/data/www/charodejki.ru/`

### Шаг 3: На сервере (через ISPmanager Терминал)

```bash
cd /var/www/www-root/data/www/charodejki.ru

# Загрузка образов
docker load < backend.tar.gz
docker load < frontend.tar.gz

# Переименование
docker tag watch-backend:latest localhost/watch-backend:latest
docker tag watch-front:latest localhost/watch-front:latest

# Запуск
docker compose -f docker-compose.isp.yml up -d

# Ждём 10 секунд
sleep 10

# Миграции БД
docker compose -f docker-compose.isp.yml exec backend npx prisma migrate deploy

# Демо-данные (первый раз)
docker compose -f docker-compose.isp.yml exec backend npx prisma db seed
```

### Шаг 4: Настройка домена в ISPmanager

1. **WWW-домены** → Создать
   - Домен: `charodejki.ru`
   - Псевдонимы: `www.charodejki.ru`
   - Корневая директория: `/var/www/www-root/data/www/charodejki.ru`
   - PHP: выключить
   - SSL: Let's Encrypt

2. **Конфигурация Nginx** (дополнительные настройки):
```nginx
location / {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_buffer_size 64k;
    proxy_buffers 8 64k;
}
```

### Шаг 5: Проверка

- Сайт: https://charodejki.ru
- API: https://charodejki.ru/api
- Swagger: https://charodejki.ru/swagger

### Демо-аккаунты

| Роль | Email | Пароль |
|------|-------|--------|
| Админ | admin@watchmarket.ru | admin123 |
| Пользователь | user@example.com | user123 |

### Обновление

```bash
cd /var/www/www-root/data/www/charodejki.ru

# Остановка
docker compose -f docker-compose.isp.yml down

# Загрузка новых образов
docker load < backend.tar.gz
docker load < frontend.tar.gz

# Перезапуск
docker compose -f docker-compose.isp.yml up -d

# Миграции
docker compose -f docker-compose.isp.yml exec backend npx prisma migrate deploy
```
