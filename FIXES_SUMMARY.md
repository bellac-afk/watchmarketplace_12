# Исправления ошибок в WatchMarketplace

## Сводка по найденным ошибкам

### Критические ошибки безопасности

1. **JWT_SECRET захардкожен в docker-compose.yml** — секрет "changeme-secret-key-minimum-32-characters-long" слишком предсказуемый и виден в коде.
   - **Исправление**: Перенесён в переменные окружения, добавлена проверка длины (минимум 32 символа) в `auth.service.ts`.

2. **Refresh токен содержит полный payload** — access и refresh токены имели одинаковый payload, что небезопасно.
   - **Исправление**: Refresh токен теперь содержит только `{ sub, type: 'refresh' }`, access — `{ sub, email, role, type: 'access' }`.

3. **Admin controller — избыточная проверка admin.id** — проверка `if (!admin?.id)` дублировалась в каждом методе, но не гарантировала существование пользователя в БД.
   - **Исправление**: Убрано дублирование, проверка роли перенесена в `verifyAdmin()` сервиса.

4. **Listings update — принимает Prisma.ListingUpdateInput напрямую** — пользователь мог обновить любые поля включая userId, watchId.
   - **Исправление**: Добавлен whitelist разрешённых полей, критические поля игнорируются.

5. **sortBy инъекция** — `orderBy[sortBy]` позволял передать любое поле.
   - **Исправление**: Добавлен whitelist `ALLOWED_SORT_FIELDS`.

### Ошибки целостности данных

6. **deleteUser — нет каскадного удаления** — Prisma выбрасывала ошибку внешнего ключа при удалении пользователя с объявлениями/сообщениями.
   - **Исправление**: Добавлена транзакция с удалением всех связанных записей в правильном порядке.

7. **deleteBrand — нет проверки связанных часов** — удаление бренда с часами приводило к ошибке.
   - **Исправление**: Добавлена проверка `_count.watches`, запрет удаления если есть связанные часы.

8. **deleteReview — не пересчитывает рейтинг** — после удаления отзыва рейтинг пользователя оставался неактуальным.
   - **Исправление**: Добавлен метод `recalculateUserRating()`.

9. **createListing — нет проверки watchId** — если передан несуществующий watchId, создавался listing с битой ссылкой.
   - **Исправление**: Добавлена проверка `prisma.watch.findUnique()`.

10. **createListing — brandSlug не нормализуется** — "Rolex" не находил "rolex".
    - **Исправление**: Добавлен `.toLowerCase()` и очистка slug от спецсимволов.

### Ошибки логики

11. **getDashboardStats — removed может быть отрицательным** — вычитание статусов давало неверный результат.
    - **Исправление**: Добавлен прямой подсчёт `ListingStatus.REMOVED` и `ListingStatus.RESERVED`.

12. **bump — race condition** — два параллельных запроса могли обойти проверку 24 часов.
    - **Исправление**: Использована транзакция `prisma.$transaction`.

13. **createListing — reference collision** — `Date.now()` мог совпасть при одновременных запросах.
    - **Исправление**: Добавлен `Math.random()` к reference.

14. **updateUserVerification — тип null** — `verifiedAt: null` мог вызывать TS ошибки.
    - **Исправление**: Явная установка `null` вместо `undefined`.

### Ошибки валидации

15. **updateListingStatus — @Body('status') без DTO** — нет валидации через class-validator.
    - **Исправление**: Создан `UpdateListingStatusDto` с `@IsEnum(ListingStatus)`.

16. **updateUserRole — @Body('role') без DTO** — аналогично.
    - **Исправление**: Создан `UpdateUserRoleDto`.

17. **createBrand — нет проверки уникальности** — Prisma выбрасывала непонятную ошибку.
    - **Исправление**: Добавлена явная проверка slug/name с `ConflictException`.

18. **updateBrand — нет проверки уникальности slug** — при изменении slug мог создаться дубликат.
    - **Исправление**: Добавлена проверка если slug изменился.

19. **images — нет валидации URL** — можно было сохранить любую строку.
    - **Исправление**: Добавлен метод `isValidUrl()` с проверкой протокола.

### Ошибки инфраструктуры

20. **docker-compose — backend/frontend порты только localhost** — nginx не мог достучаться изнутри Docker.
    - **Исправление**: Убран `127.0.0.1:` для backend/frontend.

21. **docker-compose — nginx порт конфликт** — nginx на 8080, но URL указывал на production домен.
    - **Исправление**: Порты 80/443, URL через переменные окружения.

22. **docker-compose — нет healthcheck для backend** — Docker не перезапускал упавший backend.
    - **Исправление**: Добавлен healthcheck через wget.

23. **docker-compose — Redis без ограничений памяти** — могло привести к OOM.
    - **Исправление**: Добавлены `--maxmemory 256mb --maxmemory-policy allkeys-lru`.

### Ошибки кэширования

24. **Redis cache key слишком длинный** — `JSON.stringify(filters)` мог превысить лимит.
    - **Исправление**: Добавлен метод `hashFilters()` для создания короткого хеша.

25. **findById — кэш инвалидируется при каждом просмотре** — снижает эффективность.
    - **Исправление**: Улучшена логика инвалидации.

### Прочие ошибки

26. **updateUser — data: any позволяет менять роль/пароль** — потенциальная эскалация привилегий.
    - **Исправление**: Строгая типизация параметра data.

27. **deleteUser — можно удалить самого себя** — админ мог случайно удалить свой аккаунт.
    - **Исправление**: Добавлена проверка `id === adminId`.

28. **updateUserRole — можно понизить самого себя** — админ мог потерять доступ.
    - **Исправление**: Добавлена проверка `id === adminId && role !== UserRole.ADMIN`.

29. **logActivity — metadata без ограничений** — мог превысить лимиты БД.
    - **Исправление**: Ограничение размера до 10KB.

30. **email не нормализуется к lowercase** — "User@Email.com" и "user@email.com" считались разными.
    - **Исправление**: Добавлен `.toLowerCase()` при регистрации и логине.

## Файлы для замены

1. `backend/src/admin/admin.service.ts` → [admin.service.ts](sandbox:///mnt/agents/output/admin.service.ts)
2. `backend/src/admin/admin.controller.ts` → [admin.controller.ts](sandbox:///mnt/agents/output/admin.controller.ts)
3. `backend/src/admin/dto/index.ts` → [admin.dto.ts](sandbox:///mnt/agents/output/admin.dto.ts)
4. `backend/src/listings/listings.service.ts` → [listings.service.ts](sandbox:///mnt/agents/output/listings.service.ts)
5. `backend/src/auth/auth.service.ts` → [auth.service.ts](sandbox:///mnt/agents/output/auth.service.ts)
6. `docker-compose.yml` → [docker-compose.yml](sandbox:///mnt/agents/output/docker-compose.yml)

## Дополнительные рекомендации

1. **Добавить rate limiting** — на критичные endpoints (login, register, bump)
2. **Добавить CORS политику** — явно указать разрешённые origin
3. **Добавить helmet** — защита HTTP заголовков
4. **Добавить Winston/Pino логирование** — структурированные логи вместо console
5. **Добавить тесты** — unit и integration тесты для критичных сервисов
6. **Добавить .env.example** — документация всех переменных окружения
7. **Добавить CI/CD pipeline** — автоматическая проверка перед деплоем
