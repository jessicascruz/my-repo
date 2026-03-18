import { useCallback } from 'react'

export const useRoles = () => {
  const hasRoles = useCallback(
    (rolesToCheck: string[]) => {
      // Bypassing all role checks for local backend experience
      return true
    },
    []
  )

  return { hasRoles }
}
