'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ListingCard } from './ListingCard'
import { api } from '@/lib/api'
import type { Listing } from '@/types'

export function LatestListings() {
  const { data, isLoading } = useQuery({
    queryKey: ['latest-listings'],
    queryFn: async () => {
      const { data } = await api.get('/listings?limit=8&sortBy=createdAt&sortOrder=desc')
      return data.data.data as Listing[]
    },
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="card overflow-hidden">
            <div className="aspect-square skeleton" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {data?.map((listing, index) => (
        <motion.div
          key={listing.id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.05 }}
        >
          <ListingCard listing={listing} />
        </motion.div>
      ))}
    </div>
  )
}
