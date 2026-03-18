import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { toast } from 'react-toastify'
import { useConfirmPayment } from '@/presentation/hooks/useConfirmPayment'
import { PaymentRepository } from '@/infra/repositories/PaymentRepository'
import { reactQueryEnum } from '@/domain/seedWork/libs/reactQuery/reactQuery.enums'
import { IConfirmPaymentRequest } from '@/domain/aggregates/payment'

// Mock the toast
jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

// Mock the PaymentRepository
jest.mock('@/infra/repositories/PaymentRepository', () => ({
  PaymentRepository: jest.fn().mockImplementation(() => ({
    confirmPayment: jest.fn(),
  })),
}))

describe('useConfirmPayment', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient()
    jest.clearAllMocks()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )

  it('should call confirmPayment mutation successfully', async () => {
    const mockConfirmPayment = jest.fn().mockResolvedValue({})
    ;(PaymentRepository as jest.Mock).mockImplementation(() => ({
      confirmPayment: mockConfirmPayment,
    }))

    const { result } = renderHook(() => useConfirmPayment(), { wrapper })

    const paymentId = '123'
    const mockPayload: IConfirmPaymentRequest = {
      orderId: '123',
      acquirerId: 1,
      companyId: 2,
      amount: 100.5,
      reference: 'optional-ref',
      systemId: 3,
    }

    await result.current.mutateAsync({ paymentId, body: mockPayload })

    expect(mockConfirmPayment).toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith(
      'Pagamento realizado com sucesso.'
    )
  })

  it('should handle error when confirmPayment fails', async () => {
    const mockConfirmPayment = jest
      .fn()
      .mockRejectedValue(new Error('API Error'))
    ;(PaymentRepository as jest.Mock).mockImplementation(() => ({
      confirmPayment: mockConfirmPayment,
    }))

    const { result } = renderHook(() => useConfirmPayment(), { wrapper })

    const paymentId = '123'
    const mockPayload: IConfirmPaymentRequest = {
      orderId: '123',
      acquirerId: 1,
      companyId: 2,
      amount: 100.5,
      reference: 'optional-ref',
      systemId: 3,
    }

    await result.current
      .mutateAsync({ paymentId, body: mockPayload })
      .catch(() => {})

    expect(mockConfirmPayment).toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith(
      'Ocorreu um erro com a confirmação de pagamento, por favor tente novamente.'
    )
  })

  it('should invalidate order details query on success', async () => {
    const mockConfirmPayment = jest.fn().mockResolvedValue({})
    ;(PaymentRepository as jest.Mock).mockImplementation(() => ({
      confirmPayment: mockConfirmPayment,
    }))

    const paymentId = '123'
    const mockPayload: IConfirmPaymentRequest = {
      orderId: '123',
      acquirerId: 1,
      companyId: 2,
      amount: 100.5,
      reference: 'optional-ref',
      systemId: 3,
    }

    queryClient.setQueryData(
      [reactQueryEnum.GET_ORDER_DETAILS, mockPayload.orderId],
      { data: 'test' }
    )

    const { result } = renderHook(() => useConfirmPayment(), { wrapper })

    await result.current.mutateAsync({ paymentId, body: mockPayload })

    await waitFor(() => {
      const query = queryClient.getQueryCache().findAll()[0]
      expect(query?.state.isInvalidated).toBe(true)
    })
  })
})
