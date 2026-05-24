'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSelector } from 'react-redux';
import { api } from '@/lib/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft, Save, Loader2, Camera, X, Watch, DollarSign,
  MapPin, FileText, Box, FileCheck, Wrench, Ruler, Droplets,
  Battery, Gem, Palette, Link2, Lock, AlertTriangle,
} from 'lucide-react';

const editSchema = z.object({
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

type EditFormData = z.infer<typeof editSchema>;

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

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const listingId = params.id as string;
  const { user, isAuthenticated } = useSelector((state: any) => state.auth);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [listing, setListing] = useState<any>(null);
  const [error, setError] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [newImages, setNewImages] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState('basic');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
  });

  useEffect(() => {
    if (!isAuthenticated) { router.push('/login'); return; }
    loadListing();
  }, [isAuthenticated, listingId]);

  const loadListing = async () => {
    try {
      const res = await api.get(`/listings/${listingId}`);
      const data = res.data;
      setListing(data);

      if (data.user?.id !== user?.id && user?.role !== 'ADMIN') {
        setError('У вас нет прав на редактирование этого объявления');
        setLoading(false);
        return;
      }

      setValue('price', String(data.price));
      setValue('negotiable', data.negotiable);
      setValue('condition', data.condition);
      setValue('year', data.year ? String(data.year) : '');
      setValue('hasBox', data.hasBox);
      setValue('hasPapers', data.hasPapers);
      setValue('hasOriginalStrap', data.hasOriginalStrap);
      setValue('additionalAccessories', data.additionalAccessories || '');
      setValue('description', data.description || '');
      setValue('location', data.location || '');

      if (data.watch) {
        setValue('movementType', data.watch.movementType || undefined);
        setValue('caseMaterial', data.watch.caseMaterial || undefined);
        setValue('caseDiameter', data.watch.caseDiameter ? String(data.watch.caseDiameter) : '');
        setValue('caseThickness', data.watch.caseThickness ? String(data.watch.caseThickness) : '');
        setValue('waterResistance', data.watch.waterResistance ? String(data.watch.waterResistance) : '');
        setValue('powerReserve', data.watch.powerReserve ? String(data.watch.powerReserve) : '');
        setValue('crystal', data.watch.crystal || '');
        setValue('dialColor', data.watch.dialColor || '');
        setValue('braceletMaterial', data.watch.braceletMaterial || '');
        setValue('braceletType', data.watch.braceletType || '');
        setValue('claspType', data.watch.claspType || '');
        setValue('bezelMaterial', data.watch.bezelMaterial || '');
        setValue('functions', data.watch.functions || '');
        setValue('complications', data.watch.complications || '');
        setValue('lugWidth', data.watch.lugWidth ? String(data.watch.lugWidth) : '');
        setValue('weight', data.watch.weight ? String(data.watch.weight) : '');
      }

      setImages(data.images?.map((img: any) => img.url) || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка загрузки объявления');
    } finally { setLoading(false); }
  };

  const onSubmit = async (data: EditFormData) => {
    setSaving(true);
    setError('');

    try {
      const payload: any = {
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
      };

      Object.keys(payload).forEach(key => {
        if (payload[key] === undefined || payload[key] === '') delete payload[key];
      });

      await api.put(`/listings/${listingId}`, payload);
      router.push(`/listings/${listingId}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ошибка сохранения');
    } finally { setSaving(false); }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => { setNewImages(prev => [...prev, reader.result as string]); };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number, isNew: boolean) => {
    if (isNew) setNewImages(prev => prev.filter((_, i) => i !== index));
    else setImages(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;

  if (error && !listing) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-500">{error}</p>
        <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200">Назад</button>
      </div>
    </div>
  );

  const sections = [
    { id: 'basic', label: 'Основное', icon: FileText },
    { id: 'specs', label: 'Характеристики', icon: Watch },
    { id: 'accessories', label: 'Комплектация', icon: Box },
    { id: 'images', label: 'Фото', icon: Camera },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Редактирование объявления</h1>
                <p className="text-sm text-gray-500">{listing?.watch?.brand?.name} {listing?.watch?.model} — Реф. {listing?.watch?.reference}</p>
              </div>
            </div>
            <button onClick={handleSubmit(onSubmit)} disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Сохранение...' : 'Сохранить'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">
        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>}

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button key={section.id} onClick={() => setActiveSection(section.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  activeSection === section.id ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}>
                <Icon className="w-4 h-4" /> {section.label}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {activeSection === 'basic' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-500" /> Основная информация
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Цена ($) *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input {...register('price')} type="number" step="0.01" placeholder="0.00"
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
                <div>
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

          {activeSection === 'specs' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Watch className="w-5 h-5 text-amber-500" /> Технические характеристики
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Функции</label>
                <textarea {...register('functions')} rows={2} placeholder="Дата, хронограф, GMT..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Усложнения</label>
                <textarea {...register('complications')} rows={2} placeholder="Турбийон, вечный календарь..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none" />
              </div>
            </div>
          )}

          {activeSection === 'accessories' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Box className="w-5 h-5 text-amber-500" /> Комплектация
              </h2>
              <div className="space-y-4">
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
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Дополнительные аксессуары</label>
                <textarea {...register('additionalAccessories')} rows={3} placeholder="Дополнительные ремешки, инструменты для замены, сервисная книжка..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent resize-none" />
              </div>
            </div>
          )}

          {activeSection === 'images' && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-500" /> Фотографии
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((url, index) => (
                  <div key={`existing-${index}`} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(index, false)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                {newImages.map((url, index) => (
                  <div key={`new-${index}`} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 group border-2 border-dashed border-amber-300">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                    <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-amber-500 text-white text-xs rounded">Новое</div>
                    <button type="button" onClick={() => removeImage(index, true)}
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

          <div className="flex items-center justify-end gap-4">
            <button type="button" onClick={() => router.back()} className="px-6 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors">Отмена</button>
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Сохранение...' : 'Сохранить изменения'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
