'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { useSelector } from 'react-redux'
import { api } from '@/lib/api'
import { formatPrice, formatRelativeDate } from '@/utils'
import type { Listing } from '@/types'
import {
  MapPin, Check, Eye, Heart, MessageCircle, Share2,
  ChevronLeft, ChevronRight, Star, Package, FileText, Loader2
} from 'lucide-react'
import toast from 'react-hot-toast'

const CONDITION_LABELS: Record<string, string> = {
  NEW: 'Новые',
  LIKE_NEW: 'Как новые',
  EXCELLENT: 'Отличное',
  VERY_GOOD: 'Очень хорошее',
  GOOD: 'Хорошее',
  FAIR: 'Удовлетворительное',
  POOR: 'Плохое',
}

export default function ListingDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const user = useSelector((state: any) => state.auth.user)

  useEffect(() => {
    api.get(`/listings/${id}?track=true`)
      .then(({ data }) => {
        const listingData = data?.data || data
        setListing(listingData)
      })
      .catch(() => router.push('/listings'))
      .finally(() => setLoading(false))
  }, [id])

  // Проверяем статус избранного при загрузке
  useEffect(() => {
    if (!user || !id) return

    api.get(`/favorites/check/${id}`)
      .then(({ data }) => {
        const responseData = data?.data || data
        const favoriteStatus = responseData?.isFavorite || false
        console.log('Listing favorite check:', id, 'status:', favoriteStatus)
        setIsFavorite(favoriteStatus)
      })
      .catch((err) => {
        console.error('Favorite check error:', err)
      })
  }, [id, user])

  const toggleFavorite = async () => {
    if (!user) { 
      toast.error('Войдите чтобы добавить в избранное') 
      return 
    }

    setFavoriteLoading(true)

    try {
      if (isFavorite) {
        await api.delete(`/favorites/${id}`)
        setIsFavorite(false)
        toast.success('Удалено из избранного')
      } else {
        await api.post(`/favorites/${id}`)
        setIsFavorite(true)
        toast.success('Добавлено в избранное')
      }
    } catch (err: any) {
      const status = err.response?.status
      const message = err.response?.data?.message

      console.log('Favorite toggle error:', status, message)

      if (status === 409) {
        // Уже в избранном
        setIsFavorite(true)
        toast.success('Уже в избранном')
      } else if (status === 404 && message?.includes('Favorite not found')) {
        // Уже удалено
        setIsFavorite(false)
        toast.success('Удалено из избранного')
      } else {
        toast.error(message || 'Ошибка')
      }
    } finally {
      setFavoriteLoading(false)
    }
  }

  const handleContact = () => {
    if (!user) { toast.error('Войдите чтобы написать продавцу'); return }
    router.push(`/messages?to=${listing?.userId}`)
  }

  if (loading) return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
    </div>
  )

  if (!listing) return null

  const images = listing.images?.length ? listing.images : []
  const watch = listing.watch
  const seller = listing.user

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-slate-500 mb-6 flex items-center gap-2">
        <Link href="/listings" className="hover:text-gold-600">Объявления</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-slate-900 dark:text-slate-100">{watch?.brand?.name} {watch?.model}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Фото */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
            {images.length > 0 ? (
              <Image
                src={images[activeImage]?.url}
                alt={`${watch?.brand?.name} ${watch?.model}`}
                fill className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">Нет фото</div>
            )}
            {images.length > 1 && (
              <>
                <button onClick={() => setActiveImage(i => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-slate-900/80 rounded-full hover:bg-white transition-colors">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={() => setActiveImage(i => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-white/80 dark:bg-slate-900/80 rounded-full hover:bg-white transition-colors">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button key={i} onClick={() => setActiveImage(i)}
                  className={`relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${i === activeImage ? 'border-gold-500' : 'border-transparent'}`}>
                  <Image src={img.url} alt="" fill className="object-cover" sizes="64px" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Информация */}
        <div className="space-y-6">
          <div>
            <div className="text-sm font-medium text-gold-600 uppercase tracking-wider mb-1">
              {watch?.brand?.name}
            </div>
            <h1 className="text-2xl font-serif font-bold mb-1">{watch?.model}</h1>
            <p className="text-slate-500 text-sm">Реф. {watch?.reference}</p>
          </div>

          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-bold">{formatPrice(Number(listing.price))}</span>
            {listing.negotiable && <span className="text-green-600 text-sm font-medium">Торг уместен</span>}
          </div>

          {/* Состояние и теги */}
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-sm">
              {CONDITION_LABELS[listing.condition] || listing.condition}
            </span>
            {listing.year && <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-sm">{listing.year} г.</span>}
            {listing.hasBox && <span className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-sm flex items-center gap-1"><Package className="w-3.5 h-3.5" /> Коробка</span>}
            {listing.hasPapers && <span className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-sm flex items-center gap-1"><FileText className="w-3.5 h-3.5" /> Документы</span>}
            {listing.hasOriginalStrap && <span className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-sm flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Оригинал. ремешок</span>}
          </div>

          {listing.location && (
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <MapPin className="w-4 h-4" /> {listing.location}
            </div>
          )}

          {/* Продавец */}
          <div className="card p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-lg font-bold text-slate-600 dark:text-slate-300 shrink-0">
              {seller?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{seller?.name}</p>
              <p className="text-sm text-slate-500 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-gold-500 fill-gold-500" />
                {seller?.ratingsAvg > 0 ? `${seller.ratingsAvg.toFixed(1)} (${seller.ratingsCount})` : 'Нет отзывов'}
              </p>
            </div>
            <div className="text-xs text-slate-400">
              {seller?._count?.listings} объявл.
            </div>
          </div>

          {/* Кнопки */}
          <div className="flex gap-3">
            <button onClick={handleContact}
              className="btn-primary flex-1 flex items-center justify-center gap-2">
              <MessageCircle className="w-5 h-5" /> Написать
            </button>

            <button onClick={toggleFavorite} disabled={favoriteLoading}
              className={`p-3 rounded-xl border-2 transition-colors ${
                isFavorite 
                  ? 'border-red-500 bg-red-50 text-red-500' 
                  : 'border-slate-200 dark:border-slate-700 hover:border-gold-400'
              }`}>
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-red-500' : ''} ${favoriteLoading ? 'animate-pulse' : ''}`} />
            </button>

            <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success('Ссылка скопирована') }}
              className="p-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 hover:border-gold-400 transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" /> {listing.viewsCount} просмотров</span>
            <span>{formatRelativeDate(listing.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Описание */}
      {(listing.description || listing.additionalAccessories) && (
        <div className="mt-10 grid sm:grid-cols-2 gap-6">
          {listing.description && (
            <div className="card p-6">
              <h2 className="font-bold mb-3">Описание</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 whitespace-pre-wrap leading-relaxed">{listing.description}</p>
            </div>
          )}
          {listing.additionalAccessories && (
            <div className="card p-6">
              <h2 className="font-bold mb-3">Дополнительно</h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">{listing.additionalAccessories}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
