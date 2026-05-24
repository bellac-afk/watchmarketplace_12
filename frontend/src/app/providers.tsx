'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Provider as ReduxProvider } from 'react-redux'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'
import { store } from '@/store'
import { useState, useEffect } from 'react'
import { restoreSession, logout } from '@/store/slices/authSlice'

function AuthInitializer({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsReady(true)
      return
    }

    const initAuth = () => {
      try {
        const accessToken = localStorage.getItem('accessToken')
        const refreshToken = localStorage.getItem('refreshToken')
        const userStr = localStorage.getItem('user')

        if (!accessToken || !refreshToken || !userStr) {
          setIsReady(true)
          return
        }

        // Восстанавливаем cookie для middleware
        document.cookie = `accessToken=${accessToken}; path=/; max-age=86400`

        let isExpired = false
        try {
          const payload = JSON.parse(atob(accessToken.split('.')[1]))
          const exp = payload.exp * 1000
          isExpired = Date.now() >= exp - 60000
        } catch {
          isExpired = true
        }

        if (isExpired) {
          fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          })
            .then(res => {
              if (!res.ok) throw new Error('Refresh failed')
              return res.json()
            })
            .then(data => {
              localStorage.setItem('accessToken', data.accessToken)
              localStorage.setItem('refreshToken', data.refreshToken)
              document.cookie = `accessToken=${data.accessToken}; path=/; max-age=86400`
              const user = JSON.parse(userStr)
              store.dispatch(restoreSession({ user, accessToken: data.accessToken }))
              setIsReady(true)
            })
            .catch(() => {
              localStorage.removeItem('accessToken')
              localStorage.removeItem('refreshToken')
              localStorage.removeItem('user')
              document.cookie = 'accessToken=; path=/; max-age=0'
              store.dispatch(logout())
              setIsReady(true)
            })
          return
        }

        const user = JSON.parse(userStr)
        store.dispatch(restoreSession({ user, accessToken }))
        setIsReady(true)
      } catch {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('user')
        document.cookie = 'accessToken=; path=/; max-age=0'
        store.dispatch(logout())
        setIsReady(true)
      }
    }

    initAuth()
  }, [])

  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600" />
      </div>
    )
  }

  return <>{children}</>
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  }))

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="light">
          <AuthInitializer>
            {children}
          </AuthInitializer>
          <Toaster position="top-right" />
        </ThemeProvider>
      </QueryClientProvider>
    </ReduxProvider>
  )
}
