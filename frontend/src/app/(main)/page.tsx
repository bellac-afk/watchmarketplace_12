import { Suspense } from 'react'
import { Metadata } from 'next'
import { HeroSection } from '@/components/layout/HeroSection'
import { FeaturedWatches } from '@/components/watches/FeaturedWatches'
import { PopularBrands } from '@/components/watches/PopularBrands'
import { HowItWorks } from '@/components/layout/HowItWorks'
import { LatestListings } from '@/components/listings/LatestListings'
import { SkeletonGrid } from '@/components/ui/SkeletonGrid'

export const metadata: Metadata = {
  title: 'WatchMarketplace — Купить и продать часы премиум-класса',
  description: 'Крупнейший маркетплейс часов. Rolex, Omega, Patek Philippe, Audemars Piguet. Поиск по референсу, верификация продавцов, безопасные сделки.',
  alternates: {
    canonical: '/',
  },
}

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <HeroSection />

      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-8 text-center">
          Популярные бренды
        </h2>
        <PopularBrands />
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-slate-50 dark:bg-slate-900/50 rounded-3xl">
        <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-2 text-center">
          Новые объявления
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-center mb-8">
          Самые свежие предложения от проверенных продавцов
        </p>
        <Suspense fallback={<SkeletonGrid count={8} />}>
          <LatestListings />
        </Suspense>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-8 text-center">
          Из каталога
        </h2>
        <Suspense fallback={<SkeletonGrid count={8} />}>
          <FeaturedWatches />
        </Suspense>
      </section>

      <HowItWorks />
    </main>
  )
}
