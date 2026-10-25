import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { AuthContext } from './auth'

export function AuthProvider({ children }) {
  const [token, setToken] = useLocalStorage('shopeasy:token', '')
  const [user, setUser] = useState(null)
  const [isLoadingUser, setLoadingUser] = useState(Boolean(token))

  const loadUser = useCallback(async () => {
    if (!token) {
      setUser(null)
      setLoadingUser(false)
      return
    }
    setLoadingUser(true)
    try {
      setUser(await api.getCurrentUser(token))
    } catch {
      setToken('')
      setUser(null)
    } finally {
      setLoadingUser(false)
    }
  }, [token, setToken])

  useEffect(() => { loadUser() }, [loadUser])

  const acceptToken = useCallback(async (accessToken) => {
    const currentUser = await api.getCurrentUser(accessToken)
    setToken(accessToken)
    setUser(currentUser)
    return currentUser
  }, [setToken])

  const login = useCallback(async (credentials) => {
    const response = await api.login(credentials)
    await acceptToken(response.accessToken)
    return response
  }, [acceptToken])

  const register = useCallback(async (payload) => {
    const response = await api.register(payload)
    await acceptToken(response.accessToken)
    return response
  }, [acceptToken])

  const logout = useCallback(() => {
    setToken('')
    setUser(null)
  }, [setToken])

  const value = useMemo(() => ({
    token, user, isAuthenticated: Boolean(token && user), isLoadingUser,
    login, register, logout, refreshUser: loadUser,
  }), [token, user, isLoadingUser, login, register, logout, loadUser])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
