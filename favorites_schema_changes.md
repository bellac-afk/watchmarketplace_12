
# Дополнительные изменения для favorites:

## 1. Prisma Schema — добавить уникальное ограничение

В `prisma/schema.prisma` нужно добавить уникальное ограничение на пару userId + listingId:

```prisma
model Favorite {
  id        String   @id @default(uuid())
  userId    String
  listingId String
  createdAt DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  listing Listing @relation(fields: [listingId], references: [id], onDelete: Cascade)

  @@unique([userId, listingId])
  @@index([userId])
  @@index([listingId])
  @@map("favorites")
}
```

**Важно**: После изменения схемы нужно создать миграцию:
```bash
docker compose exec backend npx prisma migrate dev --name add_favorite_unique_constraint
docker compose exec backend npx prisma generate
```

## 2. Favorites DTO (опционально, если нужен для других endpoints)

```typescript
// backend/src/favorites/dto/favorite-params.dto.ts
import { IsUUID, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class FavoriteQueryDto {
  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 24;
}
```

## 3. Admin endpoint для синхронизации счётчиков

Добавить в `admin.controller.ts`:

```typescript
@Post('listings/:id/sync-favorites')
@ApiOperation({ summary: 'Sync favorites count for listing' })
async syncFavoritesCount(
  @Param('id') id: string,
  @CurrentUser() admin: any,
) {
  // Этот метод нужно добавить в AdminService
  return this.adminService.syncListingFavoritesCount(id, admin.id);
}
```

И в `admin.service.ts`:

```typescript
async syncListingFavoritesCount(listingId: string, adminId: string) {
  await this.verifyAdmin(adminId);

  const actualCount = await this.prisma.favorite.count({
    where: { listingId },
  });

  const updated = await this.prisma.listing.update({
    where: { id: listingId },
    data: { favoritesCount: actualCount },
  });

  await this.logActivity(
    adminId, 
    'FAVORITES_SYNCED', 
    `Synced favorites count for listing ${listingId}: ${actualCount}`,
    { listingId, favoritesCount: actualCount }
  );

  return updated;
}
```
