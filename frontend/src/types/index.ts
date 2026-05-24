export interface Brand {
  id: string
  name: string
  slug: string
  logoUrl?: string
  description?: string
  country?: string
  foundedYear?: number
}

export interface Watch {
  id: string
  brandId: string
  brand: Brand
  model: string
  collection?: string
  reference: string
  referenceDisplay?: string
  movementType?: string
  caseMaterial?: string
  caseDiameter?: number
  caseThickness?: number
  waterResistance?: number
  powerReserve?: number
  crystal?: string
  dialColor?: string
  braceletMaterial?: string
  description?: string
  specifications?: Record<string, any>
  yearIntroduced?: number
  yearDiscontinued?: number
  images: WatchImage[]
  listings?: Listing[]
  createdAt: string
  updatedAt: string
}

export interface WatchImage {
  id: string
  url: string
  order: number
  isMain: boolean
}

export interface Listing {
  id: string
  watchId: string
  watch: Watch
  userId: string
  user: User
  price: number
  negotiable: boolean
  originalPrice?: number
  condition: string
  year?: number
  hasBox: boolean
  hasPapers: boolean
  hasOriginalStrap: boolean
  additionalAccessories?: string
  description?: string
  status: string
  location?: string
  viewsCount: number
  favoritesCount: number
  images: ListingImage[]
  createdAt: string
  updatedAt: string
  bumpedAt?: string
  soldAt?: string
}

export interface ListingImage {
  id: string
  url: string
  order: number
  isMain: boolean
}

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  avatar?: string
  bio?: string
  location?: string
  verificationStatus: string
  role: string
  ratingsAvg: number
  ratingsCount: number
  createdAt: string
  _count?: {
    listings: number
    reviewsReceived: number
  }
}

export interface Review {
  id: string
  fromUserId: string
  fromUser: User
  toUserId: string
  listingId: string
  rating: number
  comment?: string
  createdAt: string
}

export interface Message {
  id: string
  senderId: string
  sender: User
  receiverId: string
  receiver: User
  listingId?: string
  listing?: Listing
  content: string
  read: boolean
  readAt?: string
  createdAt: string
}

export interface SearchFilters {
  brand?: string
  model?: string
  reference?: string
  movementType?: string
  caseMaterial?: string
  minDiameter?: number
  maxDiameter?: number
  yearFrom?: number
  yearTo?: number
  condition?: string
  minPrice?: number
  maxPrice?: number
  status?: string
}

export interface ApiResponse<T> {
  data: T
  statusCode: number
  message: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}
