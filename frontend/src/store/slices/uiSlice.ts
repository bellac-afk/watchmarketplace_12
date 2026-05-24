import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface UIState {
  sidebarOpen: boolean
  searchOpen: boolean
  mobileMenuOpen: boolean
  theme: 'light' | 'dark' | 'system'
}

const initialState: UIState = {
  sidebarOpen: false,
  searchOpen: false,
  mobileMenuOpen: false,
  theme: 'system',
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen
    },
    toggleSearch: (state) => {
      state.searchOpen = !state.searchOpen
    },
    toggleMobileMenu: (state) => {
      state.mobileMenuOpen = !state.mobileMenuOpen
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload
    },
  },
})

export const { toggleSidebar, toggleSearch, toggleMobileMenu, setTheme } = uiSlice.actions
export default uiSlice.reducer
