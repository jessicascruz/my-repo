import { useRoles } from '@/presentation/hooks/useRoles'
import { useAuth } from '@/presentation/providers/NextAuthProvider'
import { renderHook } from '@testing-library/react'

jest.mock('@/presentation/providers/NextAuthProvider', () => ({
  useAuth: jest.fn(),
}))

describe('useRoles', () => {
  beforeEach(() => {
    ;(useAuth as jest.Mock).mockReturnValue({ roles: ['a', 'b'] })
  })

  it('returns true for expected roles', () => {
    const { result } = renderHook(useRoles)

    const { hasRoles } = result.current

    expect(hasRoles(['a'])).toBe(true)
    expect(hasRoles(['b'])).toBe(true)
  })

  it('returns false for unexpected roles', () => {
    const { result } = renderHook(useRoles)

    const { hasRoles } = result.current

    expect(hasRoles(['c'])).toBe(false)
    expect(hasRoles(['d'])).toBe(false)
    expect(hasRoles([])).toBe(false)
  })
})
