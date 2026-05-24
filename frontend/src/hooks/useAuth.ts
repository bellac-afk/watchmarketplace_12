import { useSelector } from 'react-redux'
import { RootState } from '@/store'

export function useAuth() {
  const { user, isAuthenticated, isLoading, accessToken } = useSelector(
    (state: RootState) => state.auth
  )

  return {
    user,
    isAuthenticated,
    isLoading,
    accessToken,
  }
}
