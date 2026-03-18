import { PaymentRepository } from '@/infra/repositories/PaymentRepository'
import IHttpClient from '@/domain/seedWork/http/IHttpClient'
import { IConfirmPaymentRequest } from '@/domain/aggregates/payment'

describe('confirmPayment', () => {
  const mockId = '12345'
  const mockPayload: IConfirmPaymentRequest = {
    acquirerId: 1,
    companyId: 2,
    amount: 100.5,
    orderId: '12345',
  }

  let mockHttpClient: jest.Mocked<IHttpClient>
  let paymentRepository: PaymentRepository

  beforeEach(() => {
    mockHttpClient = {
      post: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    }
    paymentRepository = new PaymentRepository(mockHttpClient)
  })

  it('should make a POST call with correct parameters', async () => {
    mockHttpClient.post.mockResolvedValue(undefined)

    await paymentRepository.confirmPayment({
      paymentId: mockId,
      body: mockPayload,
    })

    expect(mockHttpClient.post).toHaveBeenCalledTimes(1)
    expect(mockHttpClient.post).toHaveBeenCalledWith(
      `/v1/payment/card/${mockId}/capture`,
      mockPayload
    )
  })

  it('should return void when request succeeds', async () => {
    mockHttpClient.post.mockResolvedValue(undefined)

    const result = await paymentRepository.confirmPayment({
      paymentId: mockId,
      body: mockPayload,
    })

    expect(result).toBeUndefined()
  })

  it('should throw an error when request fails', async () => {
    const mockError = new Error('Request failed')
    mockHttpClient.post.mockRejectedValue(mockError)

    await expect(
      paymentRepository.confirmPayment({ paymentId: mockId, body: mockPayload })
    ).rejects.toThrow('Request failed')
  })

  it('should send correctly formatted payload', async () => {
    mockHttpClient.post.mockResolvedValue(undefined)

    await paymentRepository.confirmPayment({
      paymentId: mockId,
      body: mockPayload,
    })

    expect(mockHttpClient.post).toHaveBeenCalledWith(expect.any(String), {
      acquirerId: expect.any(Number),
      companyId: expect.any(Number),
      amount: expect.any(Number),
      orderId: expect.any(String),
    })
  })
})
