'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { api } from '@/lib/api';
import {
  User, Watch, Heart, Settings, LogOut, Camera, Edit, Eye,
  MessageSquare, TrendingUp, MapPin, Calendar, Star, ChevronRight,
  ExternalLink, Trash2, ArrowUpCircle, Loader2, Package, FileCheck,
} from 'lucide-react';

interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  location?: string;
  verificationStatus: string;
  role: string;
  ratingsAvg: number;
  ratingsCount: number;
  createdAt: string;
  _count?: {
    listings: number;
    reviewsReceived: number;
  };
}

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useSelector((state: any) => state.auth);
  const [isClient, setIsClient] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [listings, setListings] = useState<any[]>([]);
  const [favorites, setFavorites] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('listings');
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: '',
    location: '',
  });

  // ====== ПРОВЕРКА АВТОРИЗАЦИИ ======
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    if (!authLoading && !isAuthenticated) {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }
    }

    // Загружаем профиль только если авторизованы
    if (isAuthenticated || localStorage.getItem('accessToken')) {
      loadProfile();
    }
  }, [isClient, authLoading, isAuthenticated, router]);

  const loadProfile = async () => {
    try {
      const [profileRes, listingsRes, favoritesRes] = await Promise.all([
        api.get('/users/me'),
        api.get('/listings/my'),
        api.get('/users/me/favorites'),
      ]);
      setProfile(profileRes.data);
      setListings(listingsRes.data.data || listingsRes.data || []);
      setFavorites(favoritesRes.data || []);
      setFormData({
        name: profileRes.data.name || '',
        phone: profileRes.data.phone || '',
        bio: profileRes.data.bio || '',
        location: profileRes.data.location || '',
      });
    } catch (err) {
      console.error('Failed to load profile', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.put('/users/me', formData);
      setEditMode(false);
      loadProfile();
    } catch (err) {
      alert('Ошибка сохранения профиля');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm('Удалить объявление?')) return;
    try {
      await api.delete(`/listings/${id}`);
      loadProfile();
    } catch (err) {
      alert('Ошибка удаления');
    }
  };

  const handleBumpListing = async (id: string) => {
    try {
      await api.post(`/listings/${id}/bump`);
      loadProfile();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ошибка поднятия объявления');
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const STATUS_LABELS: Record<string, string> = {
    ACTIVE: 'Активно',
    SOLD: 'Продано',
    DRAFT: 'Черновик',
    RESERVED: 'Зарезервировано',
    REMOVED: 'Удалено',
    REJECTED: 'Отклонено',
  };

  const STATUS_COLORS: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    SOLD: 'bg-blue-100 text-blue-800',
    DRAFT: 'bg-gray-100 text-gray-800',
    RESERVED: 'bg-yellow-100 text-yellow-800',
    REMOVED: 'bg-red-100 text-red-800',
    REJECTED: 'bg-orange-100 text-orange-800',
  };

  // Показываем загрузку пока не убедимся в авторизации
  if (!isClient || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  // Если не авторизован и нет токена — редирект (не рендерим профиль)
  if (!isAuthenticated && !localStorage.getItem('accessToken')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Не удалось загрузить профиль</p>
      </div>
    );
  }

  const tabs = [
    { id: 'listings', label: 'Мои объявления', icon: Watch, count: listings.length },
    { id: 'favorites', label: 'Избранное', icon: Heart, count: favorites.length },
    { id: 'settings', label: 'Настройки', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Profile Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              {profile.avatar ? (
                <img src={profile.avatar} alt={profile.name} className="w-24 h-24 rounded-full object-cover border-4 border-amber-100" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-amber-100 flex items-center justify-center text-3xl font-bold text-amber-600">
                  {profile.name?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              <button className="absolute bottom-0 right-0 p-1.5 bg-white rounded-full shadow-md border border-gray-200 hover:bg-gray-50">
                <Camera className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
                {profile.verificationStatus === 'VERIFIED' && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">Верифицирован</span>
                )}
                {profile.role === 'ADMIN' && (
                  <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">Админ</span>
                )}
              </div>
              <p className="text-gray-500 text-sm mb-3">На платформе с {formatDate(profile.createdAt)}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                {profile.location && <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile.location}</span>}
                {profile.phone && <span className="flex items-center gap-1"><MessageSquare className="w-4 h-4" /> {profile.phone}</span>}
                <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /> {profile.ratingsAvg > 0 ? `${profile.ratingsAvg.toFixed(1)} (${profile.ratingsCount})` : 'Нет отзывов'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {profile.role === 'ADMIN' && (
                <button onClick={() => router.push('/admin')}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-700 rounded-lg hover:bg-purple-100 transition-colors text-sm font-medium">
                  <Settings className="w-4 h-4" /> Админ-панель
                </button>
              )}
              <button onClick={() => setEditMode(!editMode)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium">
                <Edit className="w-4 h-4" /> Редактировать
              </button>
            </div>
          </div>
        </div>
      </div>

      {profile.bio && !editMode && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <p className="text-gray-600 text-sm">{profile.bio}</p>
        </div>
      )}

      {editMode && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Редактирование профиля</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Имя</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Локация</label>
                <input type="text" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">О себе</label>
                <textarea value={formData.bio} onChange={(e) => setFormData({ ...formData, bio: e.target.value })} rows={3}
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setEditMode(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">Отмена</button>
              <button onClick={handleSaveProfile} disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:opacity-50">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit className="w-4 h-4" />} Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <div className="flex gap-1 border-b border-gray-200 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}>
                <Icon className="w-4 h-4" /> {tab.label}
                {tab.count !== undefined && (
                  <span className={`px-1.5 py-0.5 rounded text-xs ${activeTab === tab.id ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>{tab.count}</span>
                )}
              </button>
            );
          })}
        </div>

        {activeTab === 'listings' && (
          <div className="space-y-4 pb-8">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Мои объявления</h2>
              <button onClick={() => router.push('/listings/create')}
                className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors text-sm font-medium">
                <Watch className="w-4 h-4" /> Новое объявление
              </button>
            </div>

            {listings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <Watch className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">У вас пока нет объявлений</p>
                <button onClick={() => router.push('/listings/create')}
                  className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 text-sm font-medium">Создать объявление</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {listings.map((listing) => (
                  <div key={listing.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative aspect-[4/3] bg-gray-100">
                      {listing.images?.[0]?.url ? (
                        <img src={listing.images[0].url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Watch className="w-8 h-8 text-gray-300" /></div>
                      )}
                      <div className="absolute top-3 left-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[listing.status] || 'bg-gray-100'}`}>{STATUS_LABELS[listing.status] || listing.status}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{listing.watch?.brand?.name} {listing.watch?.model}</h3>
                      <p className="text-sm text-gray-500 mb-2">Реф. {listing.watch?.reference}</p>
                      <p className="text-lg font-bold text-amber-600 mb-3">{formatPrice(Number(listing.price))}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                        <Eye className="w-3.5 h-3.5" /> {listing.viewsCount || 0} просмотров
                        <Heart className="w-3.5 h-3.5 ml-2" /> {listing._count?.favorites || 0} избранных
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => router.push(`/listings/${listing.id}`)}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm">
                          <Eye className="w-3.5 h-3.5" /> Просмотр
                        </button>
                        {listing.status !== 'SOLD' && (
                          <button onClick={() => router.push(`/listings/${listing.id}/edit`)}
                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 transition-colors text-sm">
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                        )}
                        {listing.status === 'ACTIVE' && (
                          <button onClick={() => handleBumpListing(listing.id)} title="Поднять в топ"
                            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm">
                            <ArrowUpCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button onClick={() => handleDeleteListing(listing.id)}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-sm">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="space-y-4 pb-8">
            <h2 className="text-lg font-semibold text-gray-900">Избранное</h2>
            {favorites.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                <Heart className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Список избранного пуст</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {favorites.map((fav: any) => (
                  <div key={fav.id} onClick={() => router.push(`/listings/${fav.listing.id}`)}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer">
                    <div className="relative aspect-[4/3] bg-gray-100">
                      {fav.listing?.images?.[0]?.url ? (
                        <img src={fav.listing.images[0].url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Watch className="w-8 h-8 text-gray-300" /></div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-1">{fav.listing?.watch?.brand?.name} {fav.listing?.watch?.model}</h3>
                      <p className="text-lg font-bold text-amber-600">{formatPrice(Number(fav.listing?.price || 0))}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="space-y-4 pb-8">
            <h2 className="text-lg font-semibold text-gray-900">Настройки</h2>
            <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
              <div className="p-4 flex items-center justify-between">
                <div><h3 className="font-medium text-gray-900">Email</h3><p className="text-sm text-gray-500">{profile.email}</p></div>
                <span className="text-xs text-gray-400">Нельзя изменить</span>
              </div>
              <div className="p-4 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">Верификация</h3>
                  <p className="text-sm text-gray-500">{profile.verificationStatus === 'VERIFIED' ? 'Ваш аккаунт верифицирован' : 'Пройдите верификацию для повышения доверия'}</p>
                </div>
                {profile.verificationStatus !== 'VERIFIED' && (
                  <button className="px-3 py-1.5 bg-amber-50 text-amber-700 rounded-lg text-sm hover:bg-amber-100">Верифицировать</button>
                )}
              </div>
              <div className="p-4 flex items-center justify-between">
                <div><h3 className="font-medium text-gray-900 text-red-600">Удалить аккаунт</h3><p className="text-sm text-gray-500">Это действие нельзя отменить</p></div>
                <button onClick={() => { if (confirm('Вы уверены? Все ваши данные будут удалены безвозвратно.')) {} }}
                  className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-sm hover:bg-red-100">Удалить</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}