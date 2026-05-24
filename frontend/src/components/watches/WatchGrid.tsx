'use client'

import { useQuery } from '@tanstack/react-query'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { WatchCard } from './WatchCard'
import { Pagination } from '@/components/ui/Pagination'
import { api } from '@/lib/api'
import type { Watch } from '@/types'

export function WatchGrid({ searchParams }: { searchParams: any }) {
  const params = useSearchParams()
  const page = Number(params.get('page')) || 1

  const { data, isLoading } = useQuery({
    queryKey: ['watches', params.toString()],
    queryFn: async () => {
      const queryString = params.toString()
      const { data } = await api.get(`/watches?${queryString}&limit=24`)
      return data.data
    },
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="card overflow-hidden">
            <div className="aspect-square skeleton" />
          </div>
        ))}
      </div>
    )
  }

  const watches: Watch[] = data?.data || []
  const meta = data?.meta

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Найдено: <span className="font-semibold">{meta?.total || 0}</span> часов
        </p>
        <select className="input-field text-sm py-2 w-auto">
          <option value="createdAt:desc">Сначала новые</option>
          <option value="price:asc">Цена: по возрастанию</option>
          <option value="price:desc">Цена: по убыванию</option>
          <option value="viewsCount:desc">Популярные</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {watches.map((watch, index) => (
          <motion.div
            key={watch.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <WatchCard watch={watch} />
          </motion.div>
        ))}
      </div>

      {meta && meta.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={meta.page}
            totalPages={meta.totalPages}
            hasMore={meta.hasMore}
          />
        </div>
      )}
    </div>
  )
}
