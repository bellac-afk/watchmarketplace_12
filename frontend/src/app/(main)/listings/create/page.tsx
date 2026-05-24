'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { api } from '@/lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft, Save, Loader2, Camera, X, Watch, DollarSign,
  MapPin, FileText, Box, FileCheck, Wrench, Ruler, Droplets,
  Battery, Gem, Palette, Link2, Lock, ChevronDown,
} from 'lucide-react';

const createSchema = z.object({
  brandSlug: z.string().min(1, 'Укажите бренд'),
  model: z.string().min(1, 'Укажите модель'),
  reference: z.string().optional(),
  price: z.string().min(1, 'Укажите цену'),
  negotiable: z.boolean().default(false),
  condition: z.enum(['NEW', 'LIKE_NEW', 'EXCELLENT', 'VERY_GOOD', 'GOOD', 'FAIR', 'POOR']),
  year: z.string().optional(),
  hasBox: z.boolean().default(false),
  hasPapers: z.boolean().default(false),
  hasOriginalStrap: z.boolean().default(false),
  additionalAccessories: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  movementType: z.enum(['AUTOMATIC', 'QUARTZ', 'MANUAL_WIND', 'SPRING_DRIVE', 'OTHER']).optional(),
  caseMaterial: z.enum(['STEEL', 'GOLD', 'ROSE_GOLD', 'WHITE_GOLD', 'PLATINUM', 'TITANIUM', 'CERAMIC', 'CARBON', 'TWO_TONE', 'OTHER']).optional(),
  caseDiameter: z.string().optional(),
  caseThickness: z.string().optional(),
  waterResistance: z.string().optional(),
  powerReserve: z.string().optional(),
  crystal: z.string().optional(),
  dialColor: z.string().optional(),
  braceletMaterial: z.string().optional(),
  braceletType: z.string().optional(),
  claspType: z.string().optional(),
  bezelMaterial: z.string().optional(),
  functions: z.string().optional(),
  complications: z.string().optional(),
  lugWidth: z.string().optional(),
  weight: z.string().optional(),
});

type CreateFormData = z.infer<typeof createSchema>;

const CONDITION_OPTIONS = [
  { value: 'NEW', label: 'Новые' },
  { value: 'LIKE_NEW', label: 'Как новые' },
  { value: 'EXCELLENT', label: 'Отличное' },
  { value: 'VERY_GOOD', label: 'Очень хорошее' },
  { value: 'GOOD', label: 'Хорошее' },
  { value: 'FAIR', label: 'Удовлетворительное' },
  { value: 'POOR', label: 'Плохое' },
];

const MOVEMENT_OPTIONS = [
  { value: 'AUTOMATIC', label: 'Автоматический' },
  { value: 'QUARTZ', label: 'Кварцевый' },
  { value: 'MANUAL_WIND', label: 'Ручной завод' },
  { value: 'SPRING_DRIVE', label: 'Spring Drive' },
  { value: 'OTHER', label: 'Другой' },
];

const CASE_MATERIAL_OPTIONS = [
  { value: 'STEEL', label: 'Сталь' },
  { value: 'GOLD', label: 'Золото' },
  { value: 'ROSE_GOLD', label: 'Розовое золото' },
  { value: 'WHITE_GOLD', label: 'Белое золото' },
  { value: 'PLATINUM', label: 'Платина' },
  { value: 'TITANIUM', label: 'Титан' },
  { value: 'CERAMIC', label: 'Керамика' },
  { value: 'CARBON', label: 'Углерод' },
  { value: 'TWO_TONE', label: 'Двухцветный' },
  { value: 'OTHER', label: 'Другой' },
];

export default function CreateListingPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useSelector((state: any) => state.auth);
  const [isClient, setIsClient] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['basic']));

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
      }
    }
  }, [isClient, authLoading, isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateFormData>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      condition: 'EXCELLENT',
      negotiable: false,
      hasBox: false,
      hasPapers: false,
      hasOriginalStrap: false,
    },
  });

  // Показываем загрузку пока не убедимся в авторизации
  if (!isClient || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    );
  }

  // Если не авторизован и нет токена — редирект (не рендерим форму)
  if (!isAuthenticated && !localStorage.getItem('accessToken')) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    );
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(section)) next.delete(section);
      else next.add(section);
      return next;
    });
  };

  const onSubmit = async (data: CreateFormData) => {
    setSaving(true);
    setError('');

    try {
      const payload: any = {
        brandSlug: data.brandSlug.toLowerCase().replace(/\s+/g, '-'),
        model: data.model,
        reference: data.reference || undefined,
        price: data.price,
        negotiable: data.negotiable,
        condition: data.condition,
        year: data.year ? parseInt(data.year) : undefined,
        hasBox: data.hasBox,
        hasPapers: data.hasPapers,
        hasOriginalStrap: data.hasOriginalStrap,
        additionalAccessories: data.additionalAccessories,
        description: data.description,
        location: data.location,
        movementType: data.movementType,
        caseMaterial: data.caseMaterial,
        caseDiameter: data.caseDiameter ? parseFloat(data.caseDiameter) : undefined,
        caseThickness: data.caseThickness ? parseFloat(data.caseThickness) : undefined,
        waterResistance: data.waterResistance ? parseInt(data.waterResistance) : undefined,
        powerReserve: data.powerReserve ? parseInt(data.powerReserve) : undefined,
        crystal: data.crystal,
        dialColor: data.dialColor,
        braceletMaterial: data.braceletMaterial,
        braceletType: data.braceletType,
        claspType: data.claspType,
        bezelMaterial: data.bezelMaterial,
        functions: data.functions,
        complications: data.complications,
        lugWidth: data.lugWidth ? parseFloat(data.lugWidth) : undefined,
        weight: data.weight ? parseFloat(data.weight) : undefined,
        images: images.length > 0 ? images : undefined,
      };

      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === '') delete payload[key];
      });

      const res = await api.post('/listings', payload);
      router.push(`/listings/${res.data.id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка создания объявления');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => { setImages(prev => [...prev, reader.result as string]); };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const SectionHeader = ({ id, label, icon: Icon, required = false }: { id: string; label: string; icon: any; required?: boolean }) => (
    <button type="button" onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-lg transition-colors">
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-amber-500" />
        <span className="font-semibold text-gray-900">{label}{required && <span className="text-red-500 ml-1">*</span>}</span>
      </div>
      <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${expandedSections.has(id) ? 'rotate-180' : ''}`} />
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Новое объявление</h1>
            </div>
            <button onClick={handleSubmit(onSubmit)} disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Создание...' : 'Опубликовать'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6">
        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <SectionHeader id="basic" label="Основная информация" icon={FileText} required />
            {expandedSections.has('basic') && (
              <div className="px-4 pb-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Бренд *</label>
                    <input {...register('brandSlug')} type="text" placeholder="Rolex"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                    {errors.brandSlug && <p className="mt-1 text-sm text-red-500">{errors.brandSlug.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Модель *</label>
                    <input {...register('model')} type="text" placeholder="Submariner"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                    {errors.model && <p className="mt-1 text-sm text-red-500">{errors.model.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Референс</label>
                    <input {...register('reference')} type="text" placeholder="126610LN"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Цена ($) *</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input {...register('price')} type="number" step="0.01" placeholder="15000"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                    </div>
                    {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Состояние *</label>
                    <select {...register('condition')} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                      {CONDITION_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    {errors.condition && <p className="mt-1 text-sm text-red-500">{errors.condition.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Год выпуска</label>
                    <input {...register('year')} type="number" min="1800" max={new Date().getFullYear() + 1} placeholder="2023"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Местоположение</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input {...register('location')} type="text" placeholder="Москва, Россия"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <input {...register('negotiable')} type="checkbox" id="negotiable" className="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500" />
                  <label htmlFor="negotiable" className="text-sm text-gray-700">Торг уместен</label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Описание</label>
                  <textarea {...register('description')} rows={5} placeholder="Опишите состояние часов, историю владения, особенности..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none" />
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <SectionHeader id="specs" label="Технические характеристики" icon={Watch} />
            {expandedSections.has('specs') && (
              <div className="px-4 pb-6 space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Тип механизма</label>
                    <select {...register('movementType')} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                      <option value="">Не указано</option>
                      {MOVEMENT_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Материал корпуса</label>
                    <select {...register('caseMaterial')} className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent">
                      <option value="">Не указано</option>
                      {CASE_MATERIAL_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Диаметр корпуса (мм)</label>
                    <div className="relative">
                      <Ruler className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input {...register('caseDiameter')} type="number" step="0.1" min="10" max="70" placeholder="40"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Толщина корпуса (мм)</label>
                    <input {...register('caseThickness')} type="number" step="0.1" min="1" max="30" placeholder="12"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Водонепроницаемость (м)</label>
                    <div className="relative">
                      <Droplets className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input {...register('waterResistance')} type="number" min="0" max="10000" placeholder="100"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Запас хода (часов)</label>
                    <div className="relative">
                      <Battery className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input {...register('powerReserve')} type="number" min="0" max="1000" placeholder="72"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Стекло</label>
                    <div className="relative">
                      <Gem className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input {...register('crystal')} type="text" placeholder="Сапфировое"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Цвет циферблата</label>
                    <div className="relative">
                      <Palette className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input {...register('dialColor')} type="text" placeholder="Чёрный"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Материал браслета/ремешка</label>
                    <input {...register('braceletMaterial')} type="text" placeholder="Сталь"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Тип браслета</label>
                    <input {...register('braceletType')} type="text" placeholder="Oyster"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Тип застёжки</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input {...register('claspType')} type="text" placeholder="Складная"
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Материал безеля</label>
                    <input {...register('bezelMaterial')} type="text" placeholder="Керамика"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Ширина между ушками (мм)</label>
                    <input {...register('lugWidth')} type="number" step="0.1" min="0" max="100" placeholder="20"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Вес (г)</label>
                    <input {...register('weight')} type="number" step="0.1" min="0" max="1000" placeholder="150"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent" />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Функции</label>
                  <textarea {...register('functions')} rows={2} placeholder="Дата, хронограф, GMT..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none" />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Усложнения</label>
                  <textarea {...register('complications')} rows={2} placeholder="Турбийон, вечный календарь..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none" />
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <SectionHeader id="accessories" label="Комплектация" icon={Box} />
            {expandedSections.has('accessories') && (
              <div className="px-4 pb-6 space-y-4">
                <div className="flex items-center gap-3">
                  <input {...register('hasBox')} type="checkbox" id="hasBox" className="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500" />
                  <label htmlFor="hasBox" className="flex items-center gap-2 text-sm text-gray-700"><Box className="w-4 h-4 text-gray-400" /> Оригинальная коробка</label>
                </div>
                <div className="flex items-center gap-3">
                  <input {...register('hasPapers')} type="checkbox" id="hasPapers" className="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500" />
                  <label htmlFor="hasPapers" className="flex items-center gap-2 text-sm text-gray-700"><FileCheck className="w-4 h-4 text-gray-400" /> Документы (гарантия, сертификат)</label>
                </div>
                <div className="flex items-center gap-3">
                  <input {...register('hasOriginalStrap')} type="checkbox" id="hasOriginalStrap" className="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500" />
                  <label htmlFor="hasOriginalStrap" className="flex items-center gap-2 text-sm text-gray-700"><Link2 className="w-4 h-4 text-gray-400" /> Оригинальный браслет/ремешок</label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Дополнительные аксессуары</label>
                  <textarea {...register('additionalAccessories')} rows={3} placeholder="Дополнительные ремешки, инструменты для замены, сервисная книжка..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none" />
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <SectionHeader id="images" label="Фотографии" icon={Camera} />
            {expandedSections.has('images') && (
              <div className="px-4 pb-6 space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {images.map((url, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
                      <img src={url} alt="" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 hover:border-amber-400 flex flex-col items-center justify-center cursor-pointer transition-colors">
                    <Camera className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Добавить фото</span>
                    <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
                <p className="text-sm text-gray-500">Рекомендуется загружать фото хорошего качества: циферблат, корпус, задняя крышка, застёжка, комплектация.</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-end gap-4 pt-4">
            <button type="button" onClick={() => router.back()} className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">Отмена</button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Создание...' : 'Опубликовать объявление'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}