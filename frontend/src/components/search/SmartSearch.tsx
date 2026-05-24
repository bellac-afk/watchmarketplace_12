'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Clock, TrendingUp } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { debounce, normalizeReference } from '@/utils'

interface SearchResult {
  watches: Array<{
    id: string
    model: string
    reference: string
    brand: { name: string }
  }>
  brands: Array<{
    id: string
    name: string
    slug: string
  }>
}

export function SmartSearch({ variant = 'header' }: { variant?: 'header' | 'hero' }) {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  const { data: suggestions, isLoading } = useQuery<SearchResult>({
    queryKey: ['search-autocomplete', query],
    queryFn: async () => {
      if (query.length < 2) return { watches: [], brands: [] }
      const { data } = await api.get(`/search/autocomplete?q=${encodeURIComponent(query)}`)
      return data.data
    },
    enabled: query.length >= 2,
    staleTime: 60000,
  })

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setQuery(value)
      setIsOpen(true)
    }, 300),
    []
  )

  const handleSearch = (searchQuery: string) => {
    const normalized = searchQuery.trim()
    if (!normalized) return

    // Save to recent searches
    const updated = [normalized, ...recentSearches.filter(s => s !== normalized)].slice(0, 5)
    setRecentSearches(updated)
    localStorage.setItem('recentSearches', JSON.stringify(updated))

    // Check if it's a reference number
    const refPattern = /^[A-Za-z0-9\-]+$/
    if (refPattern.test(normalized) && normalized.length >= 4) {
      router.push(`/search?ref=${encodeURIComponent(normalizeReference(normalized))}`)
    } else {
      router.push(`/search?q=${encodeURIComponent(normalized)}`)
    }
    setIsOpen(false)
    setQuery('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query)
    }
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  const isHero = variant === 'hero'

  return (
    <div className="relative">
      <div className={`relative flex items-center ${isHero ? 'bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl' : 'bg-slate-100 dark:bg-slate-800 rounded-xl'}`}>
        <Search className={`absolute left-4 w-5 h-5 ${isHero ? 'text-white/70' : 'text-slate-400'}`} />
        <input
          ref={inputRef}
          type="text"
          placeholder="Поиск по референсу, бренду или модели..."
          className={`w-full pl-12 pr-4 py-4 bg-transparent outline-none text-base ${
            isHero 
              ? 'text-white placeholder:text-white/50' 
              : 'text-slate-900 dark:text-slate-100 placeholder:text-slate-400'
          }`}
          onChange={(e) => debouncedSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setIsOpen(false); inputRef.current?.focus() }}
            className="absolute right-4 p-1 hover:bg-white/10 rounded-full"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (query.length >= 2 || recentSearches.length > 0) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
          >
            {isLoading && (
              <div className="p-4 text-center text-slate-500">
                <div className="w-5 h-5 border-2 border-gold-500 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            )}

            {suggestions?.watches && suggestions.watches.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Часы
                </div>
                {suggestions.watches.map((watch) => (
                  <button
                    key={watch.id}
                    onClick={() => handleSearch(watch.reference)}
                    className="w-full px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg flex items-center gap-3 transition-colors"
                  >
                    <Search className="w-4 h-4 text-slate-400" />
                    <div>
                      <div className="font-medium text-slate-900 dark:text-slate-100">
                        {watch.brand.name} {watch.model}
                      </div>
                      <div className="text-sm text-slate-500">
                        Реф. {watch.reference}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {suggestions?.brands && suggestions.brands.length > 0 && (
              <div className="p-2 border-t border-slate-100 dark:border-slate-800">
                <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Бренды
                </div>
                {suggestions.brands.map((brand) => (
                  <button
                    key={brand.id}
                    onClick={() => router.push(`/watches?brand=${brand.slug}`)}
                    className="w-full px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg flex items-center gap-3 transition-colors"
                  >
                    <TrendingUp className="w-4 h-4 text-slate-400" />
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {brand.name}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {!query && recentSearches.length > 0 && (
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-3 h-3" />
                  Недавние поиски
                </div>
                {recentSearches.map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search)}
                    className="w-full px-3 py-2.5 text-left hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg flex items-center gap-3 transition-colors"
                  >
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700 dark:text-slate-300">{search}</span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
