import { WatchCard } from './WatchCard'
import type { Watch } from '@/types'

interface SimilarWatchesProps {
  watches: Watch[]
}

export function SimilarWatches({ watches }: SimilarWatchesProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {watches.map((watch) => (
        <WatchCard key={watch.id} watch={watch} />
      ))}
    </div>
  )
}
