import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  avatar?: string
  bio?: string
  location?: string
  role: string
  verificationStatus: string
  ratingsAvg: number
  ratingsCount: number
  createdAt: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  isLoading: boolean
}

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: false,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.isAuthenticated = true
      state.isLoading = false
    },

    logout: (state) => {
      state.user = null
      state.accessToken = null
      state.isAuthenticated = false
      state.isLoading = false
    },

    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },

    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },

    restoreSession: (state, action: PayloadAction<{ user: User; accessToken: string }>) => {
      state.user = action.payload.user
      state.accessToken = action.payload.accessToken
      state.isAuthenticated = true
      state.isLoading = false
    },

    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload
    },
  },
})

export const { setCredentials, logout, setLoading, updateUser, restoreSession, setAccessToken } = authSlice.actions
export default authSlice.reducer
