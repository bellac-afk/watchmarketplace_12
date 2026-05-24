'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { ListingCard } from '@/components/listings/ListingCard'
import { api } from '@/lib/api'
import type { Listing } from '@/types'
import { Loader2 } from 'lucide-react'

const CONDITIONS = [
  { value: '', label: 'Все состояния' },
  { value: 'NEW', label: 'Новые' },
  { value: 'LIKE_NEW', label: 'Как новые' },
  { value: 'EXCELLENT', label: 'Отличное' },
  { value: 'VERY_GOOD', label: 'Очень хорошее' },
  { value: 'GOOD', label: 'Хорошее' },
]

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Сначала новые' },
  { value: 'price:asc', label: 'Цена: по возрастанию' },
  { value: 'price:desc', label: 'Цена: по убыванию' },
]

export default function ListingsPage() {
  const [condition, setCondition] = useState('')
  const [sort, setSort] = useState('createdAt:desc')
  const [page, setPage] = useState(1)

  const [sortBy, sortOrder] = sort.split(':')

  const { data, isLoading } = useQuery({
    queryKey: ['listings', condition, sortBy, sortOrder, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        limit: '24',
        sortBy,
        sortOrder,
        ...(condition && { condition }),
      })
      const { data } = await api.get(`/listings?${params}`)
      return data.data as { data: Listing[]; total: number; pages: number }
    },
  })

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-serif font-bold mb-8">Объявления</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={condition}
          onChange={(e) => { setCondition(e.target.value); setPage(1) }}
          className="input-field w-auto"
        >
          {CONDITIONS.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>

        <select
          value={sort}
          onChange={(e) => { setSort(e.target.value); setPage(1) }}
          className="input-field w-auto"
        >
          {SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        {data && (
          <span className="self-center text-sm text-slate-500">
            {data.total} объявлений
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gold-500" />
        </div>
      ) : data?.data.length === 0 ? (
        <p className="text-center text-slate-500 py-20">Объявлений не найдено</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {data?.data.map((listing, index) => (
            <motion.div
              key={listing.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <ListingCard listing={listing} />
            </motion.div>
          ))}
        </div>
      )}

      {data && data.pages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                p === page
                  ? 'bg-gold-500 text-white'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-gold-50 dark:hover:bg-slate-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
