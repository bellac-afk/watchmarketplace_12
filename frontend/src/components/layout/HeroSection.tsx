'use client'

import { motion } from 'framer-motion'
import { Search, Watch, Shield, TrendingUp } from 'lucide-react'
import { SmartSearch } from '@/components/search/SmartSearch'

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-20 sm:py-32">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-[url('/images/pattern.svg')] bg-repeat" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-3xl mx-auto"
        >
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-serif font-bold mb-6 leading-tight">
            Найдите часы
            <span className="text-gold-400"> своей мечты</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto">
            Крупнейший маркетплейс премиальных часов. Поиск по референсу, 
            верификация продавцов, безопасные сделки.
          </p>

          <div className="max-w-2xl mx-auto mb-12">
            <SmartSearch variant="hero" />
          </div>

          <div className="flex flex-wrap justify-center gap-6 sm:gap-10">
            <div className="flex items-center gap-2 text-slate-400">
              <Watch className="w-5 h-5 text-gold-400" />
              <span>50 000+ часов</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Shield className="w-5 h-5 text-gold-400" />
              <span>Верификация</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <TrendingUp className="w-5 h-5 text-gold-400" />
              <span>Аналитика цен</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
