# Исправления авторизации и админки — WatchMarketplace

## 🔴 Проблемы

### 1. Авторизация "плохо держится"
- Токен живёт 15 минут, но обновление происходит ТОЛЬКО после 401 ошибки
- AccessToken хранился только в Redux — терялся при F5/перезагрузке
- Нет proactive refresh (обновления до истечения)
- Параллельные запросы при истёкшем токене — все падают
- JWT_SECRET несоответствие между кастомным guard и Passport strategy
- Refresh token не обновлялся при refresh (старый оставался в Redis)

### 2. Ошибка админки
- Кастомный JwtAuthGuard дублировал Passport, но с другим secret
- @CurrentUser() decorator не работал из-за несовместимости guard'ов
- RolesGuard не обрабатывал null user
- AdminController не проверял adminId перед вызовом сервиса
- Нет проверки роли на фронтенде — любой залогиненный видел /admin
- Нет обработки 403/401 ошибок на фронтенде

---

## ✅ Исправления

### Backend

| Файл | Что исправлено |
|------|---------------|
| `auth.service.ts` | Единый JWT_SECRET, обновление refresh токена при refresh, проверка пользователя |
| `jwt.strategy.ts` | Единый secretOrKey, возврат полного user объекта |
| `jwt.guard.ts` | Теперь использует стандартный `AuthGuard('jwt')` из Passport |
| `roles.guard.ts` | Добавлены проверки null user, ForbiddenException с сообщением |
| `roles.decorator.ts` | Корректная типизация с `UserRole` |
| `current-user.decorator.ts` | Корректное извлечение user из request |
| `auth.controller.ts` | Добавлен `GET /auth/me`, logout с `@CurrentUser` |
| `admin.controller.ts` | Проверка adminId в каждом методе, обработка ошибок |
| `admin.service.ts` | `verifyAdmin()` метод, проверка роли перед действиями |
| `admin.module.ts` | Правильные imports |
| `app.module.ts` | AdminModule подключён |

### Frontend

| Файл | Что исправлено |
|------|---------------|
| `api.ts` | TokenStorage (localStorage), proactive refresh, очередь запросов, SSR-safe |
| `authSlice.ts` | Восстановление из localStorage, `restoreSession`, `setAccessToken` |
| `providers.tsx` | AuthInitializer — проверка и обновление токена при загрузке |
| `middleware.ts` | Защита /admin, /profile, /login роутов |
| `admin/page.tsx` | Проверка роли ADMIN, обработка 401/403, загрузочные состояния |

---

## 📦 Как применить

### 1. Замените файлы

```bash
# Backend
cp fixes/backend/src/auth/auth.service.ts backend/src/auth/
cp fixes/backend/src/auth/jwt.strategy.ts backend/src/auth/
cp fixes/backend/src/auth/auth.controller.ts backend/src/auth/
cp fixes/backend/src/common/guards/jwt.guard.ts backend/src/common/guards/
cp fixes/backend/src/common/guards/roles.guard.ts backend/src/common/guards/
cp fixes/backend/src/common/decorators/roles.decorator.ts backend/src/common/decorators/
cp fixes/backend/src/common/decorators/current-user.decorator.ts backend/src/common/decorators/
cp fixes/backend/src/admin/admin.controller.ts backend/src/admin/
cp fixes/backend/src/admin/admin.service.ts backend/src/admin/
cp fixes/backend/src/admin/admin.module.ts backend/src/admin/
cp fixes/backend/src/app.module.ts backend/src/

# Frontend
cp fixes/frontend/src/lib/api.ts frontend/src/lib/
cp fixes/frontend/src/store/slices/authSlice.ts frontend/src/store/slices/
cp fixes/frontend/src/app/providers.tsx frontend/src/app/
cp fixes/frontend/src/middleware.ts frontend/src/
cp fixes/frontend/src/app/admin/page.tsx frontend/src/app/admin/
```

### 2. Пересоберите

```bash
docker compose down
docker compose up -d --build
```

### 3. Проверьте .env

Убедитесь что `JWT_SECRET` и `JWT_REFRESH_SECRET` установлены:

```env
JWT_SECRET=your-super-secret-key-min-32-chars-long!!!
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars!!!
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
```

### 4. Очистите localStorage

В браузере (DevTools → Application → Local Storage) удалите:
- `accessToken`
- `refreshToken`
- `user`

Затем перелогиньтесь.

---

## 🔍 Проверка

### Авторизация
1. Залогиньтесь
2. Подождите 14 минут
3. Сделайте запрос — должен обновиться токен **без** 401
4. Нажмите F5 — должны остаться залогинены
5. Откройте в новой вкладке — должны остаться залогинены

### Админка
1. Залогиньтесь как USER
2. Попробуйте открыть `/admin` — редирект на `/`
3. Залогиньтесь как ADMIN
4. Откройте `/admin` — должна загрузиться
5. Проверьте все табы (dashboard, listings, users, watches, brands, reviews, activity)

---

## ⚠️ Важно

- **JWT_SECRET** должен быть одинаковым во всех местах
- **Redis** должен быть запущен для хранения refresh токенов
- После деплоя очистите Redis: `docker compose exec redis redis-cli FLUSHDB`
- Для продакшена используйте `secure: true` для cookies и HTTPS
