'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { Watch, Eye, EyeOff, Loader2 } from 'lucide-react'
import { api } from '@/lib/api'
import { setCredentials } from '@/store/slices/authSlice'
import toast from 'react-hot-toast'

const loginSchema = z.object({
  email: z.string().email('Введите корректный email'),
  password: z.string().min(8, 'Минимум 8 символов'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const dispatch = useDispatch()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    try {
      const response = await api.post('/auth/login', data)
      const { user, accessToken, refreshToken } = response.data.data

      // ====== СОХРАНЯЕМ ВСЁ В LOCALSTORAGE ======
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify(user))

      dispatch(setCredentials({ user, accessToken }))
      toast.success('Добро пожаловать!')
      router.push('/')
    } catch (error: any) {
      const msg = error.response?.data?.message
      toast.error(typeof msg === 'string' ? msg : (msg?.message || 'Ошибка входа'))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-6">
          <Watch className="w-10 h-10 text-gold-500" />
          <span className="font-serif font-bold text-2xl">
            Watch<span className="text-gold-500">Market</span>
          </span>
        </Link>
        <h1 className="text-2xl font-bold mb-2">Вход в аккаунт</h1>
        <p className="text-slate-500 dark:text-slate-400">
          Войдите, чтобы получить доступ ко всем функциям
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Email</label>
          <input
            {...register('email')}
            type="email"
            placeholder="your@email.com"
            className="input-field"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Пароль</label>
          <div className="relative">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="input-field pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1 text-sm text-red-500">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full btn-primary py-3 disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            'Войти'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Нет аккаунта?{' '}
        <Link href="/register" className="text-gold-600 hover:text-gold-700 font-medium">
          Зарегистрироваться
        </Link>
      </p>
    </motion.div>
  )
}
