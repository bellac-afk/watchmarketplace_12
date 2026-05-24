'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AuthGuard({ children, fallback }: AuthGuardProps) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    // Если не авторизован и не загружается — редирект на логин
    if (!isLoading && !isAuthenticated) {
      // Проверим localStorage напрямую (на случай если Redux ещё не синхронизировался)
      const token = localStorage.getItem('accessToken')
      if (!token) {
        router.push('/login')
      }
    }
  }, [isClient, isLoading, isAuthenticated, router])

  // SSR — показываем fallback или null
  if (!isClient) {
    return fallback || (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    )
  }

  // Если не авторизован — показываем загрузку (редирект произойдёт в useEffect)
  if (!isAuthenticated) {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      return fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
        </div>
      )
    }
  }

  return <>{children}</>
}
