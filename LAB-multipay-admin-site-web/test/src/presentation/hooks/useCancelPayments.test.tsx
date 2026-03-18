import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useCancelPayment } from '@/presentation/hooks/useCancelPayment'
import { PaymentRepository } from '@/infra/repositories/PaymentRepository'
import { reactQueryEnum } from '@/domain/seedWork/libs/reactQuery/reactQuery.enums'
import { toast } from 'react-toastify'
import { ICancelPaymentParams } from '@/domain/aggregates/payment'

// Mock dependencies
jest.mock('@/infra/repositories/PaymentRepository')
jest.mock('react-toastify')
jest.mock('@/presentation/hooks/useLoaders', () => ({
  __esModule: true,
  default: () => ({
    startLoading: jest.fn(),
    stopLoading: jest.fn(),
  }),
}))

describe('useCancelPayment', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient()
    queryClient.invalidateQueries = jest.fn()
    jest.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  const mockCancelPaymentParams: ICancelPaymentParams = {
    paymentId: 'payment-123',
    body: {
      orderId: 'order-123',
      internalPaymentId: 'internal-123',
      acquirerId: 1,
      companyId: 1,
      reference: 'ref-123',
      systemId: 1,
    },
  }

  it('should call cancelPayment mutation with correct parameters', async () => {
    const mockCancelPayment = jest.fn().mockResolvedValue({})
    ;(PaymentRepository as jest.Mock).mockImplementation(() => ({
      cancelPayment: mockCancelPayment,
    }))

    const { result } = renderHook(() => useCancelPayment(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(mockCancelPaymentParams)
    })

    expect(mockCancelPayment).toHaveBeenCalled()
  })

  it('should invalidate order details query on successful cancellation', async () => {
    const mockCancelPayment = jest.fn().mockResolvedValue({})
    ;(PaymentRepository as jest.Mock).mockImplementation(() => ({
      cancelPayment: mockCancelPayment,
    }))

    const { result } = renderHook(() => useCancelPayment(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(mockCancelPaymentParams)
    })

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: [
        reactQueryEnum.GET_ORDER_DETAILS,
        mockCancelPaymentParams.body.orderId,
      ],
    })
  })

  it('should show success toast on successful cancellation', async () => {
    const mockCancelPayment = jest.fn().mockResolvedValue({})
    ;(PaymentRepository as jest.Mock).mockImplementation(() => ({
      cancelPayment: mockCancelPayment,
    }))

    const { result } = renderHook(() => useCancelPayment(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(mockCancelPaymentParams)
    })

    expect(toast.success).toHaveBeenCalledWith(
      'Pagamento cancelado com sucesso.'
    )
  })

  it('should show error toast on failed cancellation', async () => {
    const mockCancelPayment = jest
      .fn()
      .mockRejectedValue(new Error('Failed to cancel'))
    ;(PaymentRepository as jest.Mock).mockImplementation(() => ({
      cancelPayment: mockCancelPayment,
    }))

    const { result } = renderHook(() => useCancelPayment(), { wrapper })

    await act(async () => {
      try {
        await result.current.mutateAsync(mockCancelPaymentParams)
      } catch (error: unknown) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Failed to cancel')
      }
    })

    expect(toast.error).toHaveBeenCalledWith(
      'Ocorreu um erro com o cancelamento de pagamento, por favor tente novamente.'
    )
  })

  it('should handle loading state correctly', async () => {
    const mockCancelPayment = jest.fn().mockResolvedValue({})
    const mockStartLoading = jest.fn()
    const mockStopLoading = jest.fn()

    ;(PaymentRepository as jest.Mock).mockImplementation(() => ({
      cancelPayment: mockCancelPayment,
    }))

    const useLoadersMock = jest.requireMock('@/presentation/hooks/useLoaders')
    useLoadersMock.default = () => ({
      startLoading: mockStartLoading,
      stopLoading: mockStopLoading,
    })

    const { result } = renderHook(() => useCancelPayment(), { wrapper })

    await act(async () => {
      await result.current.mutateAsync(mockCancelPaymentParams)
    })

    expect(mockStartLoading).toHaveBeenCalled()
    expect(mockStopLoading).toHaveBeenCalled()
  })
})
