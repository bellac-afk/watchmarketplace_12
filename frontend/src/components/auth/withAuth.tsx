'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSelector } from 'react-redux'
import { RootState } from '@/store'

export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function WithAuthComponent(props: P) {
    const router = useRouter()
    const { isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth)
    const [isClient, setIsClient] = useState(false)

    useEffect(() => {
      setIsClient(true)
    }, [])

    useEffect(() => {
      if (!isClient || isLoading) return

      if (!isAuthenticated) {
        const token = localStorage.getItem('accessToken')
        if (!token) {
          router.push('/login')
        }
      }
    }, [isClient, isLoading, isAuthenticated, router])

    if (!isClient || isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
        </div>
      )
    }

    if (!isAuthenticated && !localStorage.getItem('accessToken')) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
        </div>
      )
    }

    return <Component {...props} />
  }
}
