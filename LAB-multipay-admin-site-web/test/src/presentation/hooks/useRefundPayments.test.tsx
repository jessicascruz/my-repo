import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useRefundPayment } from '@/presentation/hooks/useRefundPayment'
import { OrderRepository } from '@/infra/repositories/OrderRepository'
import { toast } from 'react-toastify'
import useLoaders from '@/presentation/hooks/useLoaders'
import { ReactNode } from 'react'

// Mock dependencies
jest.mock('@/infra/repositories/OrderRepository')
jest.mock('react-toastify')
jest.mock('@/presentation/hooks/useLoaders')

describe('useRefundPayment', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient()
    jest.clearAllMocks()
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('should handle successful refund', async () => {
    // Mock successful refund
    const mockRefundOrderPayment = jest.fn().mockResolvedValue(undefined)
    ;(OrderRepository as jest.Mock).mockImplementation(() => ({
      refundOrderPayment: mockRefundOrderPayment,
    }))

    // Mock loader functions
    const mockStartLoading = jest.fn()
    const mockStopLoading = jest.fn()
    ;(useLoaders as jest.Mock).mockReturnValue({
      startLoading: mockStartLoading,
      stopLoading: mockStopLoading,
    })

    const { result } = renderHook(() => useRefundPayment(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({
        orderId: '123',
        internalPaymentId: 'int-123',
        acquirerId: 123,
        companyId: 123,
        amount: 100,
        paymentId: 'pay-123',
        reference: 'test-ref',
        systemId: 1,
      })
    })

    // Verify loader was started and stopped
    expect(mockStartLoading).toHaveBeenCalled()
    expect(mockStopLoading).toHaveBeenCalled()

    // Verify refund was called with correct params
    expect(mockRefundOrderPayment).toHaveBeenCalled()

    // Verify success toast was shown
    expect(toast.success).toHaveBeenCalledWith(
      'Pagamento reembolsado com sucesso.'
    )
  })

  it('should handle refund error', async () => {
    // Mock failed refund
    const mockError = new Error('Refund failed')
    const mockRefundOrderPayment = jest.fn().mockRejectedValue(mockError)
    ;(OrderRepository as jest.Mock).mockImplementation(() => ({
      refundOrderPayment: mockRefundOrderPayment,
    }))

    // Mock loader functions
    const mockStartLoading = jest.fn()
    const mockStopLoading = jest.fn()
    ;(useLoaders as jest.Mock).mockReturnValue({
      startLoading: mockStartLoading,
      stopLoading: mockStopLoading,
    })

    const { result } = renderHook(() => useRefundPayment(), { wrapper })

    await act(async () => {
      try {
        await result.current.mutateAsync({
          orderId: '123',
          internalPaymentId: 'int-123',
          acquirerId: 123,
          companyId: 123,
          amount: 100,
          paymentId: 'pay-123',
          reference: 'test-ref',
          systemId: 1,
        })
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(Error)
        if (error instanceof Error) {
          expect(error.message).toBe('Refund failed')
        }
      }
    })

    // Verify loader was started and stopped
    expect(mockStartLoading).toHaveBeenCalled()
    expect(mockStopLoading).toHaveBeenCalled()

    // Verify error toast was shown
    expect(toast.error).toHaveBeenCalledWith('Erro ao reembolsar pagamento.')
  })
})
