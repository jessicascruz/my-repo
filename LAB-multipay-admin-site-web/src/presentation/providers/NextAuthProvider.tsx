'use client'

import React, {
  createContext,
  useContext,
  useMemo,
} from 'react'

export type AuthContextType = {
  roles: string[]
  allowedContexts: {
    home: boolean
    order: boolean
    details: boolean
    refund: boolean
  }
}

const defaultContext: AuthContextType = {
  roles: ['multipay:admin'],
  allowedContexts: { home: true, order: true, details: true, refund: true },
}
export const AuthContext = createContext(defaultContext)

export const NextAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const contextValue = useMemo(
    () => ({ roles: defaultContext.roles, allowedContexts: defaultContext.allowedContexts }),
    []
  )

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
