import { ReactNode } from 'react'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { toast } from 'react-toastify'

import { useCancelOrder } from '@/presentation/hooks/useCancelOrder'
import useLoaders from '@/presentation/hooks/useLoaders'
import { OrderRepository } from '@/infra/repositories/OrderRepository'

// Mock useLoaders
jest.mock('@/presentation/hooks/useLoaders')
const mockUseLoaders = useLoaders as jest.MockedFunction<typeof useLoaders>

// Mock OrderRepository
jest.mock('@/infra/repositories/OrderRepository', () => ({
  OrderRepository: jest.fn().mockImplementation(() => ({
    cancelOrder: jest.fn(),
  })),
}))

// Mock toast
jest.mock('react-toastify')

describe('useCancelOrder', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })

    mockUseLoaders.mockReturnValue({
      isLoading: false,
      startLoading: jest.fn(),
      stopLoading: jest.fn(),
    })

    jest.clearAllMocks()
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('should handle successful cancel', async () => {
    const mockCancelOrder = jest.fn().mockResolvedValue(undefined)
    ;(OrderRepository as jest.Mock).mockImplementation(() => ({
      cancelOrder: mockCancelOrder,
    }))

    const { result } = renderHook(() => useCancelOrder(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({
        orderId: '1',
        referenceId: 'ref-1',
        subReferenceId: 'sub-1',
        requester: { id: 'u1', name: 'User', email: 'user@test.com' },
      })
    })

    expect(mockCancelOrder).toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith('Ordem cancelada com sucesso.')
  })

  it('should handle cancel error', async () => {
    const mockError = new Error('Cancel failed')
    const mockCancelOrder = jest.fn().mockRejectedValue(mockError)
    ;(OrderRepository as jest.Mock).mockImplementation(() => ({
      cancelOrder: mockCancelOrder,
    }))

    const { result } = renderHook(() => useCancelOrder(), { wrapper })

    await act(async () => {
      try {
        await result.current.mutateAsync({
          orderId: '1',
          referenceId: 'ref-1',
          subReferenceId: 'sub-1',
          requester: { id: 'u1', name: 'User', email: 'user@test.com' },
        })
      } catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
    })

    expect(toast.error).toHaveBeenCalledWith(
      'Ocorreu um erro com o cancelamento da ordem, por favor tente novamente.'
    )
  })
})