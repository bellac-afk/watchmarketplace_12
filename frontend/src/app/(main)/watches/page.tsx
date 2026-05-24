import { Suspense } from 'react'
import { Metadata } from 'next'
import { WatchFilters } from '@/components/watches/WatchFilters'
import { WatchGrid } from '@/components/watches/WatchGrid'
import { SkeletonGrid } from '@/components/ui/SkeletonGrid'

export const metadata: Metadata = {
  title: 'Каталог часов — WatchMarketplace',
  description: 'Каталог премиальных часов Rolex, Omega, Patek Philippe и других брендов. Фильтры по бренду, модели, референсу, материалу.',
}

export default function WatchesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-serif font-bold mb-8">Каталог часов</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 shrink-0">
          <WatchFilters />
        </aside>

        <div className="flex-1">
          <Suspense fallback={<SkeletonGrid count={24} />}>
            <WatchGrid searchParams={searchParams} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
