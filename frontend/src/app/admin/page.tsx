'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

// Icons
import { Users, ShoppingBag, Watch, Star, MessageSquare, FileText, Search, ChevronLeft, ChevronRight, Trash2, Edit, CheckCircle, XCircle, Eye, Ban, Loader2 } from 'lucide-react'

interface DashboardStats {
  counts?: {
    users?: number
    listings?: number
    watches?: number
    brands?: number
    messages?: number
    reviews?: number
  }
  listingsByStatus?: Record<string, number>
  today?: {
    newUsers?: number
    newListings?: number
  }
  avgListingPrice?: number
  topBrands?: any[]
  recentActivity?: any[]
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Активно',
  SOLD: 'Продано',
  DRAFT: 'Черновик',
  REJECTED: 'Отклонено',
  REMOVED: 'Удалено',
  RESERVED: 'Забронировано',
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-700',
  SOLD: 'bg-blue-100 text-blue-700',
  DRAFT: 'bg-gray-100 text-gray-700',
  REJECTED: 'bg-red-100 text-red-700',
  REMOVED: 'bg-gray-100 text-gray-500',
  RESERVED: 'bg-amber-100 text-amber-700',
}

type TabType = 'dashboard' | 'listings' | 'users' | 'watches' | 'brands' | 'reviews' | 'activity'

export default function AdminPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useSelector((state: any) => state.auth)

  const [isClient, setIsClient] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('dashboard')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Dashboard
  const [stats, setStats] = useState<DashboardStats | null>(null)

  // Listings
  const [listings, setListings] = useState<any[]>([])
  const [listingsMeta, setListingsMeta] = useState<any>(null)
  const [listingsPage, setListingsPage] = useState(1)
  const [listingsSearch, setListingsSearch] = useState('')

  // Users
  const [users, setUsers] = useState<any[]>([])
  const [usersMeta, setUsersMeta] = useState<any>(null)
  const [usersPage, setUsersPage] = useState(1)
  const [usersSearch, setUsersSearch] = useState('')

  // Watches
  const [watches, setWatches] = useState<any[]>([])
  const [watchesMeta, setWatchesMeta] = useState<any>(null)
  const [watchesPage, setWatchesPage] = useState(1)

  // Brands
  const [brands, setBrands] = useState<any[]>([])
  const [brandsMeta, setBrandsMeta] = useState<any>(null)
  const [brandsPage, setBrandsPage] = useState(1)

  // Reviews
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewsMeta, setReviewsMeta] = useState<any>(null)
  const [reviewsPage, setReviewsPage] = useState(1)

  // Activity
  const [activityLog, setActivityLog] = useState<any[]>([])
  const [activityMeta, setActivityMeta] = useState<any>(null)
  const [activityPage, setActivityPage] = useState(1)

  // ====== ИНИЦИАЛИЗАЦИЯ КЛИЕНТА ======
  useEffect(() => {
    setIsClient(true)
  }, [])

  // ====== ПРОВЕРКА АДМИНА ======
  useEffect(() => {
    if (!isClient || authLoading) return

    if (!isAuthenticated) {
      const token = localStorage.getItem('accessToken')
      if (!token) {
        router.push('/login')
        return
      }
    }

    if (user?.role !== 'ADMIN') {
      toast.error('Доступ запрещён. Требуется роль администратора.')
      router.push('/')
    }
  }, [isClient, authLoading, isAuthenticated, user, router])

  // ====== ЗАГРУЗКА ДАННЫХ ======
  useEffect(() => {
    if (isClient && user?.role === 'ADMIN') {
      loadDashboard()
    }
  }, [isClient, user])

  useEffect(() => {
    if (!isClient || user?.role !== 'ADMIN') return

    switch (activeTab) {
      case 'listings': loadListings(); break
      case 'users': loadUsers(); break
      case 'watches': loadWatches(); break
      case 'brands': loadBrands(); break
      case 'reviews': loadReviews(); break
      case 'activity': loadActivity(); break
    }
  }, [isClient, activeTab, listingsPage, usersPage, watchesPage, brandsPage, reviewsPage, activityPage])

  const handleApiError = (err: any) => {
    const message = err?.response?.data?.message || err?.message || 'Unknown error'

    if (err?.response?.status === 403) {
      toast.error('Доступ запрещён: ' + message)
      router.push('/')
    } else if (err?.response?.status === 401) {
      toast.error('Сессия истекла. Пожалуйста, войдите снова.')
      router.push('/login')
    } else {
      setError(message)
      toast.error('Ошибка: ' + message)
    }
  }

  const loadDashboard = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const { data } = await api.get('/admin/dashboard')
      setStats(data)
    } catch (err: any) {
      handleApiError(err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadListings = async () => {
    try {
      setIsLoading(true)
      const { data } = await api.get('/admin/listings', {
        params: { page: listingsPage, limit: 50, search: listingsSearch || undefined }
      })
      setListings(data.data)
      setListingsMeta(data.meta)
    } catch (err: any) {
      handleApiError(err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const { data } = await api.get('/admin/users', {
        params: { page: usersPage, limit: 50, search: usersSearch || undefined }
      })
      setUsers(data.data)
      setUsersMeta(data.meta)
    } catch (err: any) {
      handleApiError(err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadWatches = async () => {
    try {
      setIsLoading(true)
      const { data } = await api.get('/admin/watches', {
        params: { page: watchesPage, limit: 50 }
      })
      setWatches(data.data)
      setWatchesMeta(data.meta)
    } catch (err: any) {
      handleApiError(err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadBrands = async () => {
    try {
      setIsLoading(true)
      const { data } = await api.get('/admin/brands', {
        params: { page: brandsPage, limit: 50 }
      })
      setBrands(data.data)
      setBrandsMeta(data.meta)
    } catch (err: any) {
      handleApiError(err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadReviews = async () => {
    try {
      setIsLoading(true)
      const { data } = await api.get('/admin/reviews', {
        params: { page: reviewsPage, limit: 50 }
      })
      setReviews(data.data)
      setReviewsMeta(data.meta)
    } catch (err: any) {
      handleApiError(err)
    } finally {
      setIsLoading(false)
    }
  }

  const loadActivity = async () => {
    try {
      setIsLoading(true)
      const { data } = await api.get('/admin/activity-log', {
        params: { page: activityPage, limit: 50 }
      })
      setActivityLog(data.data)
      setActivityMeta(data.meta)
    } catch (err: any) {
      handleApiError(err)
    } finally {
      setIsLoading(false)
    }
  }

  // ====== ДЕЙСТВИЯ ======
  const updateListingStatus = async (id: string, status: string) => {
    try {
      await api.put(`/admin/listings/${id}/status`, { status })
      toast.success(`Статус изменён на ${STATUS_LABELS[status] || status}`)
      loadListings()
      loadDashboard()
    } catch (err: any) {
      handleApiError(err)
    }
  }

  const deleteListing = async (id: string) => {
    if (!confirm('Удалить объявление?')) return
    try {
      await api.delete(`/admin/listings/${id}`)
      toast.success('Объявление удалено')
      loadListings()
      loadDashboard()
    } catch (err: any) {
      handleApiError(err)
    }
  }

  const updateUserRole = async (id: string, role: string) => {
    try {
      await api.put(`/admin/users/${id}/role`, { role })
      toast.success('Роль обновлена')
      loadUsers()
    } catch (err: any) {
      handleApiError(err)
    }
  }

  const deleteUser = async (id: string) => {
    if (!confirm('Удалить пользователя?')) return
    try {
      await api.delete(`/admin/users/${id}`)
      toast.success('Пользователь удалён')
      loadUsers()
      loadDashboard()
    } catch (err: any) {
      handleApiError(err)
    }
  }

  const deleteReview = async (id: string) => {
    if (!confirm('Удалить отзыв?')) return
    try {
      await api.delete(`/admin/reviews/${id}`)
      toast.success('Отзыв удалён')
      loadReviews()
      loadDashboard()
    } catch (err: any) {
      handleApiError(err)
    }
  }

  const deleteBrand = async (id: string) => {
    if (!confirm('Удалить бренд?')) return
    try {
      await api.delete(`/admin/brands/${id}`)
      toast.success('Бренд удалён')
      loadBrands()
      loadDashboard()
    } catch (err: any) {
      handleApiError(err)
    }
  }

  // ====== РЕНДЕР ======
  if (!isClient || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    )
  }

  if (!isAuthenticated && !localStorage.getItem('accessToken')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
      </div>
    )
  }

  if (error && !stats) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={() => { setError(null); loadDashboard() }}
          className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
        >
          Повторить
        </button>
      </div>
    )
  }

  const tabs = [
    { id: 'dashboard', label: 'Дашборд', icon: Star },
    { id: 'listings', label: 'Объявления', icon: ShoppingBag },
    { id: 'users', label: 'Пользователи', icon: Users },
    { id: 'watches', label: 'Часы', icon: Watch },
    { id: 'brands', label: 'Бренды', icon: Star },
    { id: 'reviews', label: 'Отзывы', icon: FileText },
    { id: 'activity', label: 'Журнал', icon: MessageSquare },
  ]

  // ====== ЗАЩИТА ОТ UNDEFINED ======
  const counts = stats?.counts || {}
  const today = stats?.today || {}
  const listingsByStatus = stats?.listingsByStatus || {}
  const topBrands = stats?.topBrands || []
  const recentActivity = stats?.recentActivity || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Админ-панель</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              {user?.name} ({user?.role})
            </span>
            <button 
              onClick={() => router.push('/')}
              className="text-sm text-amber-600 hover:text-amber-700"
            >
              На сайт
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? 'bg-amber-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-600" />
          </div>
        )}

        {activeTab === 'dashboard' && stats && (
          <div className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: 'Пользователи', value: counts.users || 0, icon: Users, color: 'bg-blue-50 text-blue-600' },
                { label: 'Объявления', value: counts.listings || 0, icon: ShoppingBag, color: 'bg-green-50 text-green-600' },
                { label: 'Часы', value: counts.watches || 0, icon: Watch, color: 'bg-purple-50 text-purple-600' },
                { label: 'Бренды', value: counts.brands || 0, icon: Star, color: 'bg-amber-50 text-amber-600' },
                { label: 'Сообщения', value: counts.messages || 0, icon: MessageSquare, color: 'bg-pink-50 text-pink-600' },
                { label: 'Отзывы', value: counts.reviews || 0, icon: FileText, color: 'bg-teal-50 text-teal-600' },
              ].map((stat) => {
                const Icon = stat.icon
                return (
                  <div key={stat.label} className={`${stat.color} rounded-xl p-4`}>
                    <Icon className="w-6 h-6 mb-2" />
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm opacity-80">{stat.label}</div>
                  </div>
                )
              })}
            </div>

            {/* Today Stats */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Сегодня</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">+{today.newUsers || 0}</div>
                  <div className="text-sm text-gray-600">Новые пользователи</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">+{today.newListings || 0}</div>
                  <div className="text-sm text-gray-600">Новые объявления</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-amber-600">${Number(stats?.avgListingPrice || 0).toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Средняя цена</div>
                </div>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Статусы объявлений</h3>
              <div className="flex flex-wrap gap-3">
                {Object.entries(listingsByStatus).map(([status, count]) => (
                  <div key={status} className={`px-4 py-2 rounded-lg ${STATUS_COLORS[status] || 'bg-gray-100'}`}>
                    <span className="font-medium">
                      {status === 'ACTIVE' ? 'Активно' : status === 'SOLD' ? 'Продано' : status === 'DRAFT' ? 'Черновик' : status === 'REJECTED' ? 'Отклонено' : 'Удалено'}
                    </span>
                    <span className="ml-2 font-bold">{count as number}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Brands */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Топ брендов</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {topBrands.map((brand: any) => (
                  <div key={brand.id} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-amber-600">{brand.name?.[0] || '?'}</div>
                    <div className="font-medium mt-1">{brand.name || 'Unknown'}</div>
                    <div className="text-sm text-gray-600">{brand._count?.watches || 0} моделей</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold mb-4">Последние объявления</h3>
              <div className="space-y-3">
                {recentActivity.map((item: any) => (
                  <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    {item.images?.[0]?.url ? (
                      <img src={item.images[0].url} alt="" className="w-12 h-12 rounded-lg object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center">
                        <Watch className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <div className="font-medium">{item.watch?.brand?.name || ''} {item.watch?.model || ''}</div>
                      <div className="text-sm text-gray-600">
                        {item.user?.name || ''} • ${Number(item.price || 0).toLocaleString()}
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[item.status] || 'bg-gray-100'}`}>
                      {STATUS_LABELS[item.status] || item.status || 'Unknown'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'listings' && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск объявлений..."
                  value={listingsSearch}
                  onChange={(e) => setListingsSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (setListingsPage(1), loadListings())}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Объявление</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Продавец</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Цена</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Статус</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map((listing) => (
                    <tr key={listing.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {listing.images?.[0]?.url ? (
                            <img src={listing.images[0].url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-200 flex items-center justify-center">
                              <Watch className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{listing.watch?.brand?.name || ''} {listing.watch?.model || ''}</div>
                            <div className="text-xs text-gray-500">{listing.watch?.reference || ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{listing.user?.name || ''}</td>
                      <td className="px-4 py-3 text-sm font-medium">${Number(listing.price || 0).toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[listing.status] || 'bg-gray-100'}`}>
                          {STATUS_LABELS[listing.status] || listing.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => router.push(`/listings/${listing.id}`)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                            <Eye className="w-4 h-4" />
                          </button>
                          {listing.status === 'ACTIVE' && (
                            <>
                              <button onClick={() => updateListingStatus(listing.id, 'SOLD')} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Продано">
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button onClick={() => updateListingStatus(listing.id, 'REJECTED')} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Отклонить">
                                <Ban className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <button onClick={() => deleteListing(listing.id)} className="p-1 text-red-600 hover:bg-red-50 rounded" title="Удалить">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {listingsMeta && listingsMeta.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-200">
                <button
                  onClick={() => setListingsPage(p => Math.max(1, p - 1))}
                  disabled={listingsPage <= 1}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" /> Назад
                </button>
                <span className="text-sm text-gray-600">Страница {listingsPage} из {listingsMeta.totalPages}</span>
                <button
                  onClick={() => setListingsPage(p => Math.min(listingsMeta.totalPages, p + 1))}
                  disabled={listingsPage >= listingsMeta.totalPages}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg disabled:opacity-50"
                >
                  Вперёд <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск пользователей..."
                  value={usersSearch}
                  onChange={(e) => setUsersSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (setUsersPage(1), loadUsers())}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Пользователь</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Email</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Роль</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Верификация</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Объявления</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {u.avatar ? (
                            <img src={u.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                              {u.name?.[0]?.toUpperCase() || '?'}
                            </div>
                          )}
                          <span className="font-medium">{u.name || 'Unknown'}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">{u.email || ''}</td>
                      <td className="px-4 py-3">
                        <select
                          value={u.role || 'USER'}
                          onChange={(e) => updateUserRole(u.id, e.target.value)}
                          className="text-sm border border-gray-200 rounded px-2 py-1"
                        >
                          <option value="USER">USER</option>
                          <option value="MODERATOR">MODERATOR</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          u.verificationStatus === 'VERIFIED' ? 'bg-green-100 text-green-700' :
                          u.verificationStatus === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {u.verificationStatus || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm">{u._count?.listings || 0}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => deleteUser(u.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {usersMeta && usersMeta.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-200">
                <button onClick={() => setUsersPage(p => Math.max(1, p - 1))} disabled={usersPage <= 1} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg disabled:opacity-50">
                  <ChevronLeft className="w-4 h-4" /> Назад
                </button>
                <span className="text-sm text-gray-600">Страница {usersPage} из {usersMeta.totalPages}</span>
                <button onClick={() => setUsersPage(p => Math.min(usersMeta.totalPages, p + 1))} disabled={usersPage >= usersMeta.totalPages} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg disabled:opacity-50">
                  Вперёд <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'watches' && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Поиск часов..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {watches.map((watch) => (
                <div key={watch.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg">{watch.brand?.name || 'Unknown'}</h3>
                  <p className="text-gray-600">{watch.model || ''}</p>
                  <p className="text-sm text-gray-500 mt-1">{watch._count?.listings || 0} объявл.</p>
                  <p className="text-sm text-gray-500">Реф. {watch.reference || ''}</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {watch.movementType && <span className="text-xs bg-gray-100 px-2 py-1 rounded">{watch.movementType}</span>}
                    {watch.caseMaterial && <span className="text-xs bg-gray-100 px-2 py-1 rounded">{watch.caseMaterial}</span>}
                    {watch.caseDiameter && <span className="text-xs bg-gray-100 px-2 py-1 rounded">{watch.caseDiameter}мм</span>}
                  </div>
                </div>
              ))}
            </div>
            {watchesMeta && watchesMeta.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-200">
                <button onClick={() => setWatchesPage(p => Math.max(1, p - 1))} disabled={watchesPage <= 1} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg disabled:opacity-50">
                  <ChevronLeft className="w-4 h-4" /> Назад
                </button>
                <span className="text-sm text-gray-600">Страница {watchesPage} из {watchesMeta.totalPages}</span>
                <button onClick={() => setWatchesPage(p => Math.min(watchesMeta.totalPages, p + 1))} disabled={watchesPage >= watchesMeta.totalPages} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg disabled:opacity-50">
                  Вперёд <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'brands' && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Бренд</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Slug</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Страна</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Моделей</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((brand) => (
                    <tr key={brand.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">{brand.name || 'Unknown'}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{brand.slug || ''}</td>
                      <td className="px-4 py-3 text-sm">{brand.country || '-'}</td>
                      <td className="px-4 py-3 text-sm">{brand._count?.watches || 0}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => deleteBrand(brand.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {brandsMeta && brandsMeta.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-200">
                <button onClick={() => setBrandsPage(p => Math.max(1, p - 1))} disabled={brandsPage <= 1} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg disabled:opacity-50">
                  <ChevronLeft className="w-4 h-4" /> Назад
                </button>
                <span className="text-sm text-gray-600">Страница {brandsPage} из {brandsMeta.totalPages}</span>
                <button onClick={() => setBrandsPage(p => Math.min(brandsMeta.totalPages, p + 1))} disabled={brandsPage >= brandsMeta.totalPages} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg disabled:opacity-50">
                  Вперёд <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">От</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Кому</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Объявление</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Оценка</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Комментарий</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews.map((review) => (
                    <tr key={review.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">{review.fromUser?.name || ''}</td>
                      <td className="px-4 py-3 text-sm">{review.toUser?.name || ''}</td>
                      <td className="px-4 py-3 text-sm">{review.listing?.watch?.brand?.name || ''} {review.listing?.watch?.model || ''}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < (review.rating || 0) ? 'text-amber-500 fill-amber-500' : 'text-gray-300'}`} />
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm max-w-xs truncate">{review.comment || '-'}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => deleteReview(review.id)} className="p-1 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {reviewsMeta && reviewsMeta.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-200">
                <button onClick={() => setReviewsPage(p => Math.max(1, p - 1))} disabled={reviewsPage <= 1} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg disabled:opacity-50">
                  <ChevronLeft className="w-4 h-4" /> Назад
                </button>
                <span className="text-sm text-gray-600">Страница {reviewsPage} из {reviewsMeta.totalPages}</span>
                <button onClick={() => setReviewsPage(p => Math.min(reviewsMeta.totalPages, p + 1))} disabled={reviewsPage >= reviewsMeta.totalPages} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg disabled:opacity-50">
                  Вперёд <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Время</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Админ</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Действие</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Описание</th>
                  </tr>
                </thead>
                <tbody>
                  {activityLog.map((log) => (
                    <tr key={log.id} className="border-t border-gray-100 hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">{log.createdAt ? new Date(log.createdAt).toLocaleString('ru-RU') : ''}</td>
                      <td className="px-4 py-3 text-sm font-medium">{log.admin?.name || ''}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">{log.action || ''}</span>
                      </td>
                      <td className="px-4 py-3 text-sm">{log.description || ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {activityMeta && activityMeta.totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-200">
                <button onClick={() => setActivityPage(p => Math.max(1, p - 1))} disabled={activityPage <= 1} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg disabled:opacity-50">
                  <ChevronLeft className="w-4 h-4" /> Назад
                </button>
                <span className="text-sm text-gray-600">Страница {activityPage} из {activityMeta.totalPages}</span>
                <button onClick={() => setActivityPage(p => Math.min(activityMeta.totalPages, p + 1))} disabled={activityPage >= activityMeta.totalPages} className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg disabled:opacity-50">
                  Вперёд <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}