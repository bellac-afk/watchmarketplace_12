import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface CompareState {
  items: string[] // watch IDs
  isOpen: boolean
}

const initialState: CompareState = {
  items: [],
  isOpen: false,
}

const compareSlice = createSlice({
  name: 'compare',
  initialState,
  reducers: {
    addToCompare: (state, action: PayloadAction<string>) => {
      if (state.items.length < 4 && !state.items.includes(action.payload)) {
        state.items.push(action.payload)
      }
    },
    removeFromCompare: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(id => id !== action.payload)
    },
    clearCompare: (state) => {
      state.items = []
    },
    toggleComparePanel: (state) => {
      state.isOpen = !state.isOpen
    },
  },
})

export const { addToCompare, removeFromCompare, clearCompare, toggleComparePanel } = compareSlice.actions
export default compareSlice.reducer
