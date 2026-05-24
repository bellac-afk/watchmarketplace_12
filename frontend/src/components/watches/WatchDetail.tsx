'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, MessageSquare, Share2 } from 'lucide-react'
import FavoriteButton from '@/components/ui/FavoriteButton'

// Встроенная функция форматирования цены (вместо @/lib/utils)
function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price)
}

interface WatchDetailProps {
  watch: any
}

export function WatchDetail({ watch }: WatchDetailProps) {
  const [activeImage, setActiveImage] = useState(0)

  const images = watch.images || []
  const mainListing = watch.listings?.find((l: any) => l.status === 'ACTIVE') || watch.listings?.[0]
  const seller = mainListing?.user

  const specs = [
    { label: 'Референс', value: watch.reference },
    { label: 'Бренд', value: watch.brand?.name },
    { label: 'Механизм', value: watch.movementType },
    { label: 'Корпус', value: watch.caseMaterial },
    { label: 'Диаметр', value: watch.caseDiameter ? `${watch.caseDiameter}мм` : null },
    { label: 'Толщина', value: watch.caseThickness ? `${watch.caseThickness}мм` : null },
    { label: 'Водонепроницаемость', value: watch.waterResistance ? `${watch.waterResistance}м` : null },
    { label: 'Запас хода', value: watch.powerReserve ? `${watch.powerReserve}ч` : null },
    { label: 'Стекло', value: watch.crystal },
    { label: 'Циферблат', value: watch.dialColor },
    { label: 'Браслет', value: watch.braceletMaterial },
    { label: 'Тип браслета', value: watch.braceletType },
    { label: 'Застёжка', value: watch.claspType },
    { label: 'Безель', value: watch.bezelMaterial },
    { label: 'Функции', value: watch.functions },
    { label: 'Усложнения', value: watch.complications },
    { label: 'Ширина между ушками', value: watch.lugWidth ? `${watch.lugWidth}мм` : null },
    { label: 'Вес', value: watch.weight ? `${watch.weight}г` : null },
  ].filter(s => s.value)

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          {images.length > 0 ? (
            <div className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
              <Image
                src={images[activeImage]?.url}
                alt={`${watch.brand?.name} ${watch.model}`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          ) : (
            <div className="aspect-square bg-gray-100 rounded-xl flex items-center justify-center text-gray-400">
              Нет изображений
            </div>
          )}

          {images.length > 1 && (
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {images.map((img: any, index: number) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(index)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                    index === activeImage ? 'border-amber-500' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={img.url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <div className="text-amber-600 font-medium text-sm uppercase tracking-wide">
            {watch.brand?.name}
          </div>
          <h1 className="text-3xl font-bold mt-2">{watch.model}</h1>
          <p className="text-gray-500 mt-1">Референс: {watch.reference}</p>

          {mainListing && (
            <div className="mt-6">
              <div className="text-3xl font-bold">
                {formatPrice(Number(mainListing.price))}
              </div>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 mt-2">
                {mainListing.status === 'ACTIVE' ? 'В наличии' : mainListing.status}
              </div>

              {/* КНОПКА ИЗБРАННОГО */}
              <div className="mt-4 flex gap-3">
                <FavoriteButton listingId={mainListing.id} />

                <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition">
                  <Share2 className="w-5 h-5" />
                  <span className="text-sm font-medium">Поделиться</span>
                </button>
              </div>
            </div>
          )}

          {/* Seller */}
          {seller && (
            <div className="mt-8 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-3">
                {seller.avatar ? (
                  <Image
                    src={seller.avatar}
                    alt={seller.name}
                    width={48}
                    height={48}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-700 font-bold">
                    {seller.name?.[0]?.toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="font-medium">{seller.name}</div>
                  <div className="text-sm text-gray-500">
                    {seller.ratingsAvg || 'Новый продавец'} · {seller._count?.listings || 0} объявлений
                  </div>
                </div>
                <Link
                  href={`/messages?to=${seller.id}&listing=${mainListing?.id}`}
                  className="ml-auto flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition"
                >
                  <MessageSquare className="w-4 h-4" />
                  Написать
                </Link>
              </div>
            </div>
          )}

          {/* Specifications */}
          <div className="mt-8">
            <h2 className="text-xl font-bold mb-4">Характеристики</h2>
            <div className="grid grid-cols-2 gap-4">
              {specs.map((spec: any) => (
                <div key={spec.label} className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">{spec.label}</span>
                  <span className="font-medium">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          {watch.description && (
            <div className="mt-8">
              <h2 className="text-xl font-bold mb-4">Описание</h2>
              <p className="text-gray-600 whitespace-pre-line">{watch.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
