import { PaymentRepository } from '@/infra/repositories/PaymentRepository'
import IHttpClient from '@/domain/seedWork/http/IHttpClient'
import { ICancelPaymentRequest, IConfirmPaymentRequest } from '@/domain/aggregates/payment'

describe('PaymentRepository', () => {
  let paymentRepository: PaymentRepository
  let mockHttpClient: jest.Mocked<IHttpClient>
  let mockErrorHandler: { createError: jest.Mock }

  beforeEach(() => {
    mockHttpClient = {
      post: jest.fn(),
    } as unknown as jest.Mocked<IHttpClient>
    mockErrorHandler = { createError: jest.fn() }
    paymentRepository = new PaymentRepository(mockHttpClient, mockErrorHandler)
  })

  describe('cancelPayment', () => {
    const mockPaymentId = '123'
    const mockBody: ICancelPaymentRequest = {
      orderId: 'order-123',
      internalPaymentId: 'internal-123',
      acquirerId: 1,
      companyId: 2
    }

    it('should successfully cancel a payment', async () => {
      mockHttpClient.post.mockResolvedValueOnce(undefined)

      await paymentRepository.cancelPayment({
        paymentId: mockPaymentId,
        body: mockBody,
      })

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `/v1/payment/${mockPaymentId}/cancel`,
        mockBody
      )
    })

    it('should handle error when cancel payment fails', async () => {
      const mockError = new Error('Cancel failed')
      mockHttpClient.post.mockRejectedValueOnce(mockError)

      await expect(
        paymentRepository.cancelPayment({
          paymentId: mockPaymentId,
          body: mockBody,
        })
      ).rejects.toThrow(mockError)

      expect(mockErrorHandler.createError).toHaveBeenCalledWith({
        message: 'Error canceling payment',
        errorCode: 'paymentRepository.cancelPayment.error',
        detailedMessage: `Cancel failed\n\nCancelling payment paymentId: ${mockPaymentId}:`
      })
    })
  })

  describe('confirmPayment', () => {
    const mockPaymentId = '456'
    const mockBody: IConfirmPaymentRequest = {
      acquirerId: 1,
      companyId: 2,
      amount: 100,
      orderId: 'order-456'
    }

    it('should successfully confirm a payment and return response', async () => {
      const mockResponse = undefined
      mockHttpClient.post.mockResolvedValueOnce(mockResponse)

      const response = await paymentRepository.confirmPayment({
        paymentId: mockPaymentId,
        body: mockBody,
      })

      expect(response).toBe(mockResponse)
      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `/v1/payment/card/${mockPaymentId}/capture`,
        mockBody
      )
    })

    it('should handle error when confirm payment fails', async () => {
      const mockError = new Error('Confirm failed')
      mockHttpClient.post.mockRejectedValueOnce(mockError)

      await expect(
        paymentRepository.confirmPayment({
          paymentId: mockPaymentId,
          body: mockBody,
        })
      ).rejects.toThrow(mockError)

      expect(mockErrorHandler.createError).toHaveBeenCalledWith({
        message: 'Error confirming payment',
        errorCode: 'paymentRepository.confirmPayment.error',
        detailedMessage: `Confirm failed\n\nConfirming payment paymentId: ${mockPaymentId}:`
      })
    })
  })

  describe('constructor', () => {
    it('should create instance with default AxiosHttpClient when no client provided', () => {
      const repository = new PaymentRepository()
      expect(repository).toBeInstanceOf(PaymentRepository)
    })

    it('should create instance with provided http client', () => {
      const repository = new PaymentRepository(mockHttpClient, mockErrorHandler)
      expect(repository).toBeInstanceOf(PaymentRepository)
    })
  })
})
