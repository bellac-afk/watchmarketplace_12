import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { WatchDetail } from '@/components/watches/WatchDetail'
import { SimilarWatches } from '@/components/watches/SimilarWatches'
import { PriceAnalysis } from '@/components/watches/PriceAnalysis'
import FavoriteButton from '@/components/ui/FavoriteButton'

interface Props {
  params: { id: string }
}

async function getWatch(id: string) {
  const baseUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL
  const res = await fetch(`${baseUrl}/api/watches/${id}`, {
    next: { revalidate: 60 },
  })
  if (!res.ok) return null
  return res.json()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await getWatch(params.id)
  if (!data?.data) return { title: 'Часы не найдены' }

  const watch = data.data
  return {
    title: `${watch.brand.name} ${watch.model} ${watch.reference} — WatchMarketplace`,
    description: `${watch.brand.name} ${watch.model}. Референс: ${watch.reference}. ${watch.description?.slice(0, 150) || ''}`,
    openGraph: {
      images: watch.images?.[0]?.url ? [watch.images[0].url] : [],
    },
  }
}

export default async function WatchDetailPage({ params }: Props) {
  const data = await getWatch(params.id)
  if (!data?.data) notFound()

  const watch = data.data

  // Находим первое активное объявление для кнопки избранного
  const mainListing = watch.listings?.find((l: any) => l.status === 'ACTIVE') || watch.listings?.[0]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <WatchDetail watch={watch} />

      {/* Кнопка избранного — используем ID объявления, не часов */}
      {mainListing && (
        <div className="mt-6 flex justify-center">
          <FavoriteButton listingId={mainListing.id} />
        </div>
      )}

      {watch.similar && watch.similar.length > 0 && (
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Похожие часы</h2>
          <SimilarWatches watches={watch.similar} />
        </div>
      )}

      <div className="mt-12">
        {/* PriceAnalysis ожидает watchId и reference */}
        <PriceAnalysis watchId={watch.id} reference={watch.reference} />
      </div>
    </div>
  )
}
