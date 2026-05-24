'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { motion } from 'framer-motion'
import { SlidersHorizontal, X } from 'lucide-react'

const brands = [
  'Rolex', 'Omega', 'Patek Philippe', 'Audemars Piguet',
  'Cartier', 'TAG Heuer', 'Breitling', 'IWC', 'Jaeger-LeCoultre',
  'Panerai', 'Hublot', 'Zenith', 'Vacheron Constantin', 'A. Lange & Söhne'
]

const movementTypes = [
  { value: 'AUTOMATIC', label: 'Автоматический' },
  { value: 'QUARTZ', label: 'Кварцевый' },
  { value: 'MANUAL_WIND', label: 'Ручной завод' },
  { value: 'SPRING_DRIVE', label: 'Spring Drive' },
]

const caseMaterials = [
  { value: 'STEEL', label: 'Сталь' },
  { value: 'GOLD', label: 'Золото' },
  { value: 'ROSE_GOLD', label: 'Розовое золото' },
  { value: 'PLATINUM', label: 'Платина' },
  { value: 'TITANIUM', label: 'Титан' },
  { value: 'CERAMIC', label: 'Керамика' },
  { value: 'TWO_TONE', label: 'Двухцветные' },
]

const conditions = [
  { value: 'NEW', label: 'Новые' },
  { value: 'LIKE_NEW', label: 'Как новые' },
  { value: 'EXCELLENT', label: 'Отличное' },
  { value: 'VERY_GOOD', label: 'Очень хорошее' },
  { value: 'GOOD', label: 'Хорошее' },
]

export function WatchFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(name, value)
      } else {
        params.delete(name)
      }
      return params.toString()
    },
    [searchParams]
  )

  const updateFilter = (name: string, value: string) => {
    router.push(`?${createQueryString(name, value)}`, { scroll: false })
  }

  const clearFilters = () => {
    router.push('/watches')
  }

  const hasFilters = Array.from(searchParams.keys()).length > 0

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4" />
          Фильтры
        </h3>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
          >
            <X className="w-3 h-3" /> Сбросить
          </button>
        )}
      </div>

      {/* Brand */}
      <div>
        <h4 className="text-sm font-medium mb-2">Бренд</h4>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {brands.map((brand) => (
            <label
              key={brand}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-sm"
            >
              <input
                type="radio"
                name="brand"
                value={brand.toLowerCase().replace(/\s+/g, '-')}
                checked={searchParams.get('brand') === brand.toLowerCase().replace(/\s+/g, '-')}
                onChange={(e) => updateFilter('brand', e.target.value)}
                className="accent-gold-500"
              />
              <span className="text-slate-700 dark:text-slate-300">{brand}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Movement Type */}
      <div>
        <h4 className="text-sm font-medium mb-2">Механизм</h4>
        <div className="space-y-1">
          {movementTypes.map((type) => (
            <label
              key={type.value}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-sm"
            >
              <input
                type="radio"
                name="movementType"
                value={type.value}
                checked={searchParams.get('movementType') === type.value}
                onChange={(e) => updateFilter('movementType', e.target.value)}
                className="accent-gold-500"
              />
              <span className="text-slate-700 dark:text-slate-300">{type.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Case Material */}
      <div>
        <h4 className="text-sm font-medium mb-2">Материал корпуса</h4>
        <div className="space-y-1">
          {caseMaterials.map((material) => (
            <label
              key={material.value}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer text-sm"
            >
              <input
                type="radio"
                name="caseMaterial"
                value={material.value}
                checked={searchParams.get('caseMaterial') === material.value}
                onChange={(e) => updateFilter('caseMaterial', e.target.value)}
                className="accent-gold-500"
              />
              <span className="text-slate-700 dark:text-slate-300">{material.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h4 className="text-sm font-medium mb-2">Цена</h4>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="От"
            value={searchParams.get('minPrice') || ''}
            onChange={(e) => updateFilter('minPrice', e.target.value)}
            className="input-field text-sm py-2"
          />
          <input
            type="number"
            placeholder="До"
            value={searchParams.get('maxPrice') || ''}
            onChange={(e) => updateFilter('maxPrice', e.target.value)}
            className="input-field text-sm py-2"
          />
        </div>
      </div>

      {/* Diameter */}
      <div>
        <h4 className="text-sm font-medium mb-2">Диаметр (мм)</h4>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="От"
            value={searchParams.get('minDiameter') || ''}
            onChange={(e) => updateFilter('minDiameter', e.target.value)}
            className="input-field text-sm py-2"
          />
          <input
            type="number"
            placeholder="До"
            value={searchParams.get('maxDiameter') || ''}
            onChange={(e) => updateFilter('maxDiameter', e.target.value)}
            className="input-field text-sm py-2"
          />
        </div>
      </div>

      {/* Year */}
      <div>
        <h4 className="text-sm font-medium mb-2">Год выпуска</h4>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="От"
            value={searchParams.get('yearFrom') || ''}
            onChange={(e) => updateFilter('yearFrom', e.target.value)}
            className="input-field text-sm py-2"
          />
          <input
            type="number"
            placeholder="До"
            value={searchParams.get('yearTo') || ''}
            onChange={(e) => updateFilter('yearTo', e.target.value)}
            className="input-field text-sm py-2"
          />
        </div>
      </div>
    </motion.div>
  )
}
