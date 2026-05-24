'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, Eye } from 'lucide-react'
import { formatPrice } from '@/utils'
import type { Watch } from '@/types'

interface WatchCardProps {
  watch: Watch
}

export function WatchCard({ watch }: WatchCardProps) {
  const mainImage = watch.images?.[0]?.url || '/images/placeholder-watch.jpg'
  const listing = watch.listings?.[0]

  return (
    <Link href={`/watches/${watch.id}`} className="group block">
      <div className="card overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="relative aspect-square bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <Image
            src={mainImage}
            alt={`${watch.brand.name} ${watch.model}`}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="absolute top-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="p-2 bg-white/90 dark:bg-slate-900/90 rounded-full hover:bg-gold-500 hover:text-white transition-colors">
              <Heart className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="text-xs font-medium text-gold-600 dark:text-gold-400 uppercase tracking-wider mb-1">
            {watch.brand.name}
          </div>
          <h3 className="font-serif font-semibold text-lg text-slate-900 dark:text-slate-100 mb-1 line-clamp-1">
            {watch.model}
          </h3>
          <div className="text-sm text-slate-500 dark:text-slate-400 mb-3">
            Реф. {watch.reference}
          </div>

          <div className="flex items-center justify-between">
            <div className="font-bold text-xl text-slate-900 dark:text-slate-100">
              {listing ? formatPrice(Number(listing.price)) : 'Нет в продаже'}
            </div>
            <div className="flex items-center gap-1 text-sm text-slate-500">
              <Eye className="w-4 h-4" />
              <span>{watch.listings?.[0]?.viewsCount || 0}</span>
            </div>
          </div>

          {watch.movementType && (
            <div className="mt-2 flex flex-wrap gap-1">
              <span className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 rounded-md text-slate-600 dark:text-slate-400">
                {watch.movementType}
              </span>
              {watch.caseMaterial && (
                <span className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-800 rounded-md text-slate-600 dark:text-slate-400">
                  {watch.caseMaterial}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
