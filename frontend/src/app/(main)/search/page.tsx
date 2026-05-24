import { Suspense } from 'react'
import { Metadata } from 'next'
import { SearchResults } from '@/components/search/SearchResults'
import { SkeletonGrid } from '@/components/ui/SkeletonGrid'

export const metadata: Metadata = {
  title: 'Поиск часов — WatchMarketplace',
  description: 'Поиск часов по референсу, бренду или модели.',
}

export default function SearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const query = searchParams.q as string || ''
  const ref = searchParams.ref as string || ''

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-serif font-bold mb-2">
        {query || ref ? `Результаты поиска: "${query || ref}"` : 'Поиск часов'}
      </h1>
      <p className="text-slate-500 mb-8">
        {query || ref ? 'Найденные часы и объявления' : 'Введите референс, бренд или модель'}
      </p>

      <Suspense fallback={<SkeletonGrid count={12} />}>
        <SearchResults query={query} reference={ref} />
      </Suspense>
    </div>
  )
}
