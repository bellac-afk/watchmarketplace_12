'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { WatchCard } from '@/components/watches/WatchCard'
import { ListingCard } from '@/components/listings/ListingCard'
import { api } from '@/lib/api'
import type { Watch, Listing } from '@/types'

interface SearchResultsProps {
  query: string
  reference: string
}

export function SearchResults({ query, reference }: SearchResultsProps) {
  const { data: watchesData, isLoading: watchesLoading } = useQuery({
    queryKey: ['search-watches', query, reference],
    queryFn: async () => {
      if (reference) {
        const { data } = await api.get(`/watches/reference/${encodeURIComponent(reference)}`)
        return { watches: [data.data], brands: [] }
      }
      if (query) {
        const { data } = await api.get(`/watches/search?q=${encodeURIComponent(query)}`)
        return data.data
      }
      return { watches: [], brands: [] }
    },
    enabled: !!(query || reference),
  })

  const { data: listingsData, isLoading: listingsLoading } = useQuery({
    queryKey: ['search-listings', query, reference],
    queryFn: async () => {
      if (!query && !reference) return { data: [], meta: {} }
      const searchQuery = reference || query
      const { data } = await api.get(`/listings?search=${encodeURIComponent(searchQuery)}&limit=12`)
      return data.data
    },
    enabled: !!(query || reference),
  })

  const watches: Watch[] = watchesData?.watches || []
  const listings: Listing[] = listingsData?.data || []
  const isLoading = watchesLoading || listingsLoading

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="h-8 skeleton w-1/4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <div className="aspect-square skeleton" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!query && !reference) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500 text-lg">
          Введите референс (например, 116610LN) или название модели для поиска
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Watches from catalog */}
      {watches.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Из каталога <span className="text-slate-500">({watches.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {watches.map((watch, index) => (
              <motion.div
                key={watch.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <WatchCard watch={watch} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Listings */}
      {listings.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-4">
            Объявления <span className="text-slate-500">({listings.length})</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing, index) => (
              <motion.div
                key={listing.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <ListingCard listing={listing} />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {watches.length === 0 && listings.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-500 text-lg">
            По запросу "{query || reference}" ничего не найдено
          </p>
          <p className="text-slate-400 mt-2">
            Попробуйте изменить запрос или проверить правильность референса
          </p>
        </div>
      )}
    </div>
  )
}
