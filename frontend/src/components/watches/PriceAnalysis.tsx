'use client'

import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { api } from '@/lib/api'
import { formatPrice } from '@/utils'

interface PriceAnalysisProps {
  watchId: string
  reference: string
}

export function PriceAnalysis({ watchId, reference }: PriceAnalysisProps) {
  const { data, isLoading } = useQuery({
    queryKey: ['market-stats', watchId],
    queryFn: async () => {
      const { data } = await api.get(`/search/market-stats/${watchId}`)
      return data.data
    },
  })

  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="h-8 skeleton w-1/3 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 skeleton" />
          ))}
        </div>
      </div>
    )
  }

  if (!data) return null

  const stats = [
    {
      label: 'Активные объявления',
      value: data.activeListings,
      icon: null,
    },
    {
      label: 'Средняя цена',
      value: formatPrice(data.averageActivePrice),
      icon: data.averageActivePrice > data.averageSoldPrice ? TrendingUp : TrendingDown,
      trend: data.averageActivePrice > data.averageSoldPrice ? 'up' : 'down',
    },
    {
      label: 'Диапазон цен',
      value: `${formatPrice(data.minPrice)} - ${formatPrice(data.maxPrice)}`,
      icon: Minus,
    },
    {
      label: 'Продано',
      value: data.soldListings,
      icon: null,
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="card p-6"
    >
      <h2 className="text-xl font-semibold mb-6">
        Анализ рынка для реф. {reference}
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl"
          >
            <div className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              {stat.label}
            </div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              {stat.value}
              {stat.icon && (
                <stat.icon
                  className={`w-5 h-5 ${
                    stat.trend === 'up'
                      ? 'text-green-500'
                      : stat.trend === 'down'
                      ? 'text-red-500'
                      : 'text-slate-400'
                  }`}
                />
              )}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
