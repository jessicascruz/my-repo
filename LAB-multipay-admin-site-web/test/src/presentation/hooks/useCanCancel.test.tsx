import { renderHook } from '@testing-library/react'
import { useCanCancel } from '@/presentation/hooks/useCanCancel'
import {useRoles} from '@/presentation/hooks/useRoles'
import { StatusType } from '@/domain/aggregates/status'

// Mock do hook useRoles
jest.mock('@/presentation/hooks/useRoles')
const mockUseRoles = useRoles as jest.MockedFunction<typeof useRoles>

describe('useCanCancel', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it.each<StatusType>(['CREATED', 'VIEWED', 'RECOVERY'])(
    'should return true when status=%s and user has roles',
    (status) => {
      mockUseRoles.mockReturnValue({ hasRoles: () => true })

      const { result } = renderHook(() => useCanCancel())
      expect(result.current.canCancelOrder({ orderStatus: status })).toBe(true)
    }
  )

  it.each<StatusType>([
    'PENDING',
    'AUTHORIZED',
    'CONFIRMED',
    'DETECTION',
    'CANCELED',
    'DENIED',
    'REFUNDED',
    'EXPIRED',
    'CHARGED_BACK',
    'MANUAL_CONFIRMED',
  ])('should return false when status=%s even if user has roles', (status) => {
    mockUseRoles.mockReturnValue({ hasRoles: () => true })

    const { result } = renderHook(() => useCanCancel())
    expect(result.current.canCancelOrder({ orderStatus: status })).toBe(false)
  })

  it('should return false when user does not have roles', () => {
    mockUseRoles.mockReturnValue({ hasRoles: () => false })

    const { result } = renderHook(() => useCanCancel())
    expect(result.current.canCancelOrder({ orderStatus: 'CREATED' })).toBe(false)
  })
})