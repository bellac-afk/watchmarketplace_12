'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'
import Image from 'next/image'
import Link from 'next/link'
import { Heart, Loader2, Trash2, Eye } from 'lucide-react'

interface FavoriteItem {
  id: string
  createdAt: string
  listing: {
    id: string
    price: number
    condition: string
    status: string
    images: { url: string; isMain: boolean }[]
    user: {
      id: string
      name: string
      ratingsAvg: number
    }
    watch: {
      brand: { name: string }
      model: string
      reference: string
      images: { url: string }[]
    }
    _count: {
      favorites: number
      messages: number
    }
  }
}

interface FavoritesResponse {
  data: FavoriteItem[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

export default function FavoritesPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [page, setPage] = useState(1)
  const [meta, setMeta] = useState<FavoritesResponse['meta'] | null>(null)
  const [removingId, setRemovingId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/favorites')
      return
    }
    loadFavorites()
  }, [isAuthenticated, page])

  const loadFavorites = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get(`/favorites?page=${page}&limit=24`)

      // Структура ответа: {data: {data: [...], meta: {...}}, statusCode: 200, message: 'Success'}
      const innerData = response.data?.data  // {data: [...], meta: {...}}

      console.log('Favorites raw response:', response.data)
      console.log('Favorites inner data:', innerData)

      setFavorites(innerData?.data || [])
      setMeta(innerData?.meta || null)
    } catch (err: any) {
      console.error('Failed to load favorites:', err)
      setError(err.response?.data?.message || 'Не удалось загрузить избранное')
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (listingId: string) => {
    try {
      setRemovingId(listingId)
      await api.delete(`/favorites/${listingId}`)
      setFavorites(prev => prev.filter(f => f.listing.id !== listingId))
      if (meta) {
        setMeta({ ...meta, total: meta.total - 1 })
      }
    } catch (err: any) {
      console.error('Failed to remove favorite:', err)
      alert(err.response?.data?.message || 'Не удалось удалить из избранного')
    } finally {
      setRemovingId(null)
    }
  }

  const getMainImage = (item: FavoriteItem) => {
    return item.listing.images?.find(img => img.isMain)?.url 
      || item.listing.watch?.images?.[0]?.url 
      || '/placeholder-watch.png'
  }

  const getConditionLabel = (condition: string) => {
    const labels: Record<string, string> = {
      NEW: 'Новые',
      LIKE_NEW: 'Как новые',
      EXCELLENT: 'Отличное',
      VERY_GOOD: 'Очень хорошее',
      GOOD: 'Хорошее',
      FAIR: 'Удовлетворительное',
      POOR: 'Плохое',
    }
    return labels[condition] || condition
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Требуется авторизация</h1>
          <p className="text-gray-500 mb-6">Войдите, чтобы просматривать избранное</p>
          <Link 
            href="/login?redirect=/favorites" 
            className="inline-block bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition"
          >
            Войти
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="w-8 h-8 text-red-500" />
        <h1 className="text-3xl font-bold">Избранное</h1>
        {meta && meta.total > 0 && (
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm">
            {meta.total}
          </span>
        )}
      </div>

      {loading && favorites.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {!loading && favorites.length === 0 && !error && (
        <div className="text-center py-20">
          <Heart className="w-20 h-20 text-gray-200 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-600 mb-2">Избранное пусто</h2>
          <p className="text-gray-400 mb-6">Добавляйте понравившиеся часы в избранное</p>
          <Link 
            href="/listings" 
            className="inline-block bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition"
          >
            Смотреть объявления
          </Link>
        </div>
      )}

      {favorites.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {favorites.map((item) => (
              <div 
                key={item.id} 
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow group"
              >
                <Link href={`/listings/${item.listing.id}`} className="block">
                  <div className="relative aspect-square bg-gray-50">
                    <Image
                      src={getMainImage(item)}
                      alt={`${item.listing.watch?.brand?.name} ${item.listing.watch?.model}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium">
                      {getConditionLabel(item.listing.condition)}
                    </div>
                  </div>
                </Link>

                <div className="p-4">
                  <Link href={`/listings/${item.listing.id}`} className="block">
                    <h3 className="font-semibold text-gray-900 mb-1 truncate">
                      {item.listing.watch?.brand?.name} {item.listing.watch?.model}
                    </h3>
                    <p className="text-sm text-gray-500 mb-2">
                      {item.listing.watch?.reference}
                    </p>
                    <p className="text-lg font-bold text-amber-600 mb-3">
                      ${Number(item.listing.price).toLocaleString()}
                    </p>
                  </Link>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Eye className="w-4 h-4" />
                      <span>{item.listing._count?.favorites || 0}</span>
                    </div>

                    <button
                      onClick={() => removeFavorite(item.listing.id)}
                      disabled={removingId === item.listing.id}
                      className="flex items-center gap-1 text-red-500 hover:text-red-600 text-sm transition disabled:opacity-50"
                    >
                      {removingId === item.listing.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Назад
              </button>
              <span className="text-gray-600">
                Страница {page} из {meta.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(meta.totalPages, p + 1))}
                disabled={!meta.hasMore}
                className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Вперёд →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
