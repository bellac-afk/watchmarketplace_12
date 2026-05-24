'use client'

import { useState, useEffect, useCallback } from 'react'
import { Heart } from 'lucide-react'
import { api } from '@/lib/api'
import { useAuth } from '@/hooks/useAuth'

interface FavoriteButtonProps {
  listingId: string
  initialIsFavorite?: boolean
  className?: string
}

export default function FavoriteButton({ listingId, initialIsFavorite = false, className = '' }: FavoriteButtonProps) {
  const { isAuthenticated } = useAuth()
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [loading, setLoading] = useState(false)

  // Проверяем статус при монтировании
  useEffect(() => {
    if (!isAuthenticated || !listingId) return

    api.get(`/favorites/check/${listingId}`)
      .then(res => {
        // Backend может возвращать {data: {isFavorite: true}} или {isFavorite: true}
        const responseData = res.data?.data || res.data
        const favoriteStatus = responseData?.isFavorite || false
        console.log('Favorite check:', listingId, 'status:', favoriteStatus, 'raw:', res.data)
        setIsFavorite(favoriteStatus)
      })
      .catch((err) => {
        console.error('Favorite check error:', err)
      })
  }, [listingId, isAuthenticated])

  const toggleFavorite = useCallback(async () => {
    if (!isAuthenticated) {
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname)
      return
    }

    if (!listingId) {
      console.error('No listingId provided')
      return
    }

    if (loading) return
    setLoading(true)

    try {
      if (isFavorite) {
        await api.delete(`/favorites/${listingId}`)
        setIsFavorite(false)
        console.log('Removed from favorites:', listingId)
      } else {
        await api.post(`/favorites/${listingId}`)
        setIsFavorite(true)
        console.log('Added to favorites:', listingId)
      }
    } catch (err: any) {
      const status = err.response?.status
      const message = err.response?.data?.message || err.message
      const responseData = err.response?.data

      console.log('Favorite error:', status, message, responseData)

      if (status === 409) {
        // 409 = уже в избранном — устанавливаем состояние в true
        console.log('409: Already in favorites, setting isFavorite = true')
        setIsFavorite(true)
        return
      }

      if (status === 404 && message?.includes('Favorite not found')) {
        // Уже удалено из избранного
        console.log('404: Favorite not found, setting isFavorite = false')
        setIsFavorite(false)
        return
      }

      if (status === 404 && message?.includes('Listing not found')) {
        console.log('404: Listing not found')
        return
      }

      // Для других ошибок показываем alert
      alert(message || 'Ошибка при обработке избранного')
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, listingId, isFavorite, loading])

  return (
    <button
      onClick={toggleFavorite}
      disabled={loading}
      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-colors ${
        isFavorite
          ? 'border-red-200 bg-red-50 text-red-600 dark:bg-red-950/30 dark:border-red-900'
          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
      } ${className}`}
    >
      <Heart 
        className={`w-5 h-5 transition-all ${
          isFavorite ? 'fill-current scale-110' : ''
        } ${loading ? 'animate-pulse' : ''}`} 
      />
      <span className="text-sm font-medium">
        {loading ? '...' : isFavorite ? 'В избранном' : 'В избранное'}
      </span>
    </button>
  )
}
