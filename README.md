# WatchMarketplace - Admin & Revisions Update

## Что включено в обновление

### 1. Улучшенная админ-панель
- **Dashboard** — статистика: пользователи, объявления, часы, бренды, сообщения, отзывы
- **Управление объявлениями** — просмотр всех объявлений, изменение статуса, удаление, поиск
- **Управление пользователями** — просмотр, изменение роли, верификация, удаление
- **Управление часами** — просмотр каталога с поиском
- **Управление брендами** — просмотр, создание, обновление, удаление
- **Управление отзывами** — просмотр, удаление
- **Журнал активности** — лог всех действий администратора

### 2. Редактирование объявлений пользователями
- Новая страница `/listings/[id]/edit`
- Пользователи могут редактировать свои объявления (кроме проданных)
- Разделы: Основное, Характеристики, Комплектация, Фото
- Все технические характеристики часов доступны для редактирования

### 3. Расширенные поля при создании объявления
Добавлены все поля из базы данных:
- **Механизм**: тип (автоматический, кварцевый и т.д.)
- **Корпус**: материал, диаметр, толщина
- **Водонепроницаемость**: в метрах
- **Запас хода**: в часах
- **Стекло**: тип кристалла
- **Циферблат**: цвет
- **Браслет**: материал, тип
- **Застёжка**: тип
- **Безель**: материал
- **Функции**: дата, хронограф, GMT и т.д.
- **Усложнения**: турбийон, вечный календарь и т.д.
- **Ширина между ушками**: в мм
- **Вес**: в граммах

## Установка

### 1. Распакуйте архив
```bash
unzip -o watchmarketplace_admin_update.zip
```

### 2. Пересоберите проект
```bash
docker compose down
docker compose up -d --build
```

### 3. Примените миграцию
```bash
docker compose exec backend npx prisma migrate dev --name admin_and_revisions
docker compose exec backend npx prisma generate
docker compose restart
```

### Или вручную (если migrate не работает):
```bash
docker compose exec backend npx prisma db execute --file ./prisma/migrations/admin_and_revisions/migration.sql
docker compose exec backend npx prisma generate
docker compose restart
```

## API Endpoints (Admin)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/dashboard` | Статистика дашборда |
| GET | `/api/admin/listings` | Все объявления |
| GET | `/api/admin/listings/:id` | Детали объявления |
| PUT | `/api/admin/listings/:id` | Обновить объявление |
| DELETE | `/api/admin/listings/:id` | Удалить объявление |
| PUT | `/api/admin/listings/:id/status` | Изменить статус |
| GET | `/api/admin/users` | Все пользователи |
| GET | `/api/admin/users/:id` | Детали пользователя |
| PUT | `/api/admin/users/:id` | Обновить пользователя |
| DELETE | `/api/admin/users/:id` | Удалить пользователя |
| PUT | `/api/admin/users/:id/role` | Изменить роль |
| PUT | `/api/admin/users/:id/verification` | Верификация |
| GET | `/api/admin/watches` | Все часы |
| GET | `/api/admin/brands` | Все бренды |
| POST | `/api/admin/brands` | Создать бренд |
| PUT | `/api/admin/brands/:id` | Обновить бренд |
| DELETE | `/api/admin/brands/:id` | Удалить бренд |
| GET | `/api/admin/reviews` | Все отзывы |
| DELETE | `/api/admin/reviews/:id` | Удалить отзыв |
| GET | `/api/admin/activity-log` | Журнал активности |

## Новые Frontend страницы

| Path | Description |
|------|-------------|
| `/admin` | Админ-панель с дашбордом |
| `/listings/:id/edit` | Редактирование объявления |
| `/profile` | Обновлённый профиль с кнопкой редактирования |

## Изменённые файлы

### Backend
- `src/admin/` — новый модуль админ-панели
- `src/listings/dto/create-listing.dto.ts` — расширенные DTO
- `src/listings/dto/update-listing.dto.ts` — расширенные DTO
- `src/listings/listings.service.ts` — обновлённый сервис
- `src/app.module.ts` — подключение AdminModule
- `prisma/schema.prisma` — расширенная схема

### Frontend
- `src/app/admin/page.tsx` — новая админ-панель
- `src/app/(main)/listings/create/page.tsx` — расширенная форма создания
- `src/app/(main)/listings/[id]/edit/page.tsx` — новая страница редактирования
- `src/app/(main)/profile/page.tsx` — обновлённый профиль
