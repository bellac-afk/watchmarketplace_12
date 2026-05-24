import axios from 'axios'
import { store } from '@/store'
import { logout, setCredentials } from '@/store/slices/authSlice'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// ====== УТИЛИТЫ ДЛЯ ТОКЕНОВ ======
const TokenStorage = {
  getAccessToken: () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('accessToken')
  },

  getRefreshToken: () => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('refreshToken')
  },

  setTokens: (accessToken: string, refreshToken: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      document.cookie = `accessToken=${accessToken}; path=/; max-age=86400`
    }
  },

  clearTokens: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      document.cookie = 'accessToken=; path=/; max-age=0'
    }
  },
}

// ====== СОЗДАНИЕ API ИНСТАНСА ======
// БЕЗ /api — nginx или backend уже добавляют префикс
export const api = axios.create({
  baseURL: `${API_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// ====== REQUEST INTERCEPTOR ======
api.interceptors.request.use(
  (config) => {
    const token = TokenStorage.getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// ====== RESPONSE INTERCEPTOR ======
let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  (response) => {
    // === АВТО-ИЗВЛЕЧЕНИЕ data.data ТОЛЬКО ДЛЯ /admin/* ===
    const url = response.config.url || ''
    const isAdminEndpoint = url.includes('/admin')

    if (
      isAdminEndpoint &&
      response.data &&
      typeof response.data === 'object' &&
      !Array.isArray(response.data) &&
      'data' in response.data &&
      'statusCode' in response.data &&
      'message' in response.data
    ) {
      return { ...response, data: response.data.data }
    }

    return response
  },
  async (error) => {
    const originalRequest = error.config

    if (!originalRequest) {
      return Promise.reject(error)
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`
          return api(originalRequest)
        })
        .catch((err) => Promise.reject(err))
      }

      isRefreshing = true

      try {
        const refreshToken = TokenStorage.getRefreshToken()
        if (!refreshToken) {
          throw new Error('No refresh token')
        }

        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        })

        const { accessToken, refreshToken: newRefreshToken } = response.data
        TokenStorage.setTokens(accessToken, newRefreshToken)

        const currentUser = store.getState().auth.user
        if (currentUser) {
          store.dispatch(setCredentials({
            user: currentUser,
            accessToken,
          }))
        }

        processQueue(null, accessToken)
        originalRequest.headers.Authorization = `Bearer ${accessToken}`

        return api(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        TokenStorage.clearTokens()
        store.dispatch(logout())

        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }

        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// ====== AUTH HELPERS ======
export const authApi = {
  login: async (email: string, password: string) => {
    const response = await api.post('/api/auth/login', { email, password })
    const { user, accessToken, refreshToken } = response.data
    TokenStorage.setTokens(accessToken, refreshToken)
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user))
    }
    store.dispatch(setCredentials({ user, accessToken }))
    return response.data
  },

  register: async (data: { email: string; password: string; name: string; phone?: string }) => {
    const response = await api.post('/api/auth/register', data)
    const { user, accessToken, refreshToken } = response.data
    TokenStorage.setTokens(accessToken, refreshToken)
    if (typeof window !== 'undefined') {
      localStorage.setItem('user', JSON.stringify(user))
    }
    store.dispatch(setCredentials({ user, accessToken }))
    return response.data
  },

  logout: async () => {
    const userId = store.getState().auth.user?.id
    if (userId) {
      await api.post('/api/auth/logout', { userId }).catch(() => {})
    }
    TokenStorage.clearTokens()
    store.dispatch(logout())
  },
}

export default api
