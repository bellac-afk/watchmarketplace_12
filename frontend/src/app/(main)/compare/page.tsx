'use client'

import { useSelector, useDispatch } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Plus, Scale } from 'lucide-react'
import { removeFromCompare, clearCompare } from '@/store/slices/compareSlice'
import type { RootState } from '@/store'

export default function ComparePage() {
  const { items } = useSelector((state: RootState) => state.compare)
  const dispatch = useDispatch()

  // Mock data for comparison - in real app, fetch watch details
  const compareData = [
    { label: 'Бренд', key: 'brand' },
    { label: 'Модель', key: 'model' },
    { label: 'Референс', key: 'reference' },
    { label: 'Механизм', key: 'movementType' },
    { label: 'Материал', key: 'caseMaterial' },
    { label: 'Диаметр', key: 'caseDiameter' },
    { label: 'Водонепроницаемость', key: 'waterResistance' },
    { label: 'Запас хода', key: 'powerReserve' },
    { label: 'Цена', key: 'price' },
  ]

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <Scale className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Нет часов для сравнения</h1>
        <p className="text-slate-500 mb-6">
          Добавьте часы в сравнение из каталога или объявлений
        </p>
        <a href="/watches" className="btn-primary">
          Перейти в каталог
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-serif font-bold">Сравнение часов</h1>
        <button
          onClick={() => dispatch(clearCompare())}
          className="text-red-500 hover:text-red-600 text-sm font-medium"
        >
          Очистить всё
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left p-4 border-b border-slate-200 dark:border-slate-800 min-w-[200px]">
                Характеристика
              </th>
              {items.map((id) => (
                <th
                  key={id}
                  className="p-4 border-b border-slate-200 dark:border-slate-800 min-w-[250px]"
                >
                  <div className="relative">
                    <button
                      onClick={() => dispatch(removeFromCompare(id))}
                      className="absolute -top-2 -right-2 p-1 bg-red-100 dark:bg-red-900/30 text-red-500 rounded-full hover:bg-red-200 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                    <div className="aspect-square bg-slate-100 dark:bg-slate-800 rounded-xl mb-2" />
                    <div className="font-medium">Часы {id.slice(0, 8)}</div>
                  </div>
                </th>
              ))}
              {items.length < 4 && (
                <th className="p-4 border-b border-slate-200 dark:border-slate-800 min-w-[250px]">
                  <a
                    href="/watches"
                    className="flex flex-col items-center justify-center h-full text-slate-400 hover:text-gold-500 transition-colors"
                  >
                    <Plus className="w-8 h-8 mb-2" />
                    <span className="text-sm">Добавить ещё</span>
                  </a>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {compareData.map((spec) => (
              <tr key={spec.key}>
                <td className="p-4 border-b border-slate-100 dark:border-slate-800 font-medium text-slate-500">
                  {spec.label}
                </td>
                {items.map((id) => (
                  <td
                    key={id}
                    className="p-4 border-b border-slate-100 dark:border-slate-800 text-center"
                  >
                    —
                  </td>
                ))}
                {items.length < 4 && <td className="border-b border-slate-100 dark:border-slate-800" />}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
