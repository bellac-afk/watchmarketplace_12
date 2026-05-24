'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, MapPin, Check } from 'lucide-react'
import { formatPrice, formatRelativeDate } from '@/utils'
import type { Listing } from '@/types'

interface ListingCardProps {
  listing: Listing
}

export function ListingCard({ listing }: ListingCardProps) {
  const mainImage = listing.images?.[0]?.url || '/images/placeholder-watch.jpg'

  return (
    <Link href={`/listings/${listing.id}`} className="group block">
      <div className="card overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <Image
            src={mainImage}
            alt={`${listing.watch.brand.name} ${listing.watch.model}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="absolute top-3 left-3 flex flex-wrap gap-1">
            {listing.hasBox && (
              <span className="px-2 py-1 text-xs bg-green-500/90 text-white rounded-md flex items-center gap-1">
                <Check className="w-3 h-3" /> Коробка
              </span>
            )}
            {listing.hasPapers && (
              <span className="px-2 py-1 text-xs bg-green-500/90 text-white rounded-md flex items-center gap-1">
                <Check className="w-3 h-3" /> Документы
              </span>
            )}
          </div>

          <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="p-2 bg-white/90 dark:bg-slate-900/90 rounded-full hover:bg-gold-500 hover:text-white transition-colors">
              <Heart className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="text-xs font-medium text-gold-600 dark:text-gold-400 uppercase tracking-wider mb-1">
            {listing.watch.brand.name}
          </div>
          <h3 className="font-serif font-semibold text-lg text-slate-900 dark:text-slate-100 mb-1 line-clamp-1">
            {listing.watch.model}
          </h3>
          <div className="text-sm text-slate-500 dark:text-slate-400 mb-2">
            Реф. {listing.watch.reference}
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mb-3">
            <MapPin className="w-3.5 h-3.5" />
            <span>{listing.user.name}</span>
            <span className="text-gold-500">★ {listing.user.ratingsAvg || 'Новый'}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="font-bold text-xl text-slate-900 dark:text-slate-100">
              {formatPrice(Number(listing.price))}
              {listing.negotiable && (
                <span className="text-sm font-normal text-green-600 ml-2">Торг</span>
              )}
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
            <span>{listing.condition}</span>
            <span>{formatRelativeDate(listing.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
