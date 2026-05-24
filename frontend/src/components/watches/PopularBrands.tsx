'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

const brands = [
  { name: 'Rolex', slug: 'rolex', logo: '/images/brands/rolex.svg' },
  { name: 'Omega', slug: 'omega', logo: '/images/brands/omega.svg' },
  { name: 'Patek Philippe', slug: 'patek-philippe', logo: '/images/brands/patek.svg' },
  { name: 'Audemars Piguet', slug: 'audemars-piguet', logo: '/images/brands/ap.svg' },
  { name: 'Cartier', slug: 'cartier', logo: '/images/brands/cartier.svg' },
  { name: 'TAG Heuer', slug: 'tag-heuer', logo: '/images/brands/tag-heuer.svg' },
  { name: 'Breitling', slug: 'breitling', logo: '/images/brands/breitling.svg' },
  { name: 'IWC', slug: 'iwc', logo: '/images/brands/iwc.svg' },
]

export function PopularBrands() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
      {brands.map((brand, index) => (
        <motion.div
          key={brand.slug}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.05 }}
        >
          <Link
            href={`/watches?brand=${brand.slug}`}
            className="flex flex-col items-center gap-3 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-gold-500 dark:hover:border-gold-500 transition-all duration-300 group"
          >
            <div className="w-12 h-12 relative flex items-center justify-center">
              <span className="text-2xl font-serif font-bold text-slate-400 group-hover:text-gold-500 transition-colors">
                {brand.name[0]}
              </span>
            </div>
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-gold-600 dark:group-hover:text-gold-400 transition-colors text-center">
              {brand.name}
            </span>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}
