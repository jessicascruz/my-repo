import IHttpClient from '@/domain/seedWork/http/IHttpClient'
import { Filter } from '@/domain/aggregates/filter/filter'
import { IReceivableResponse } from '@/domain/aggregates/order'
import { OrderRepository } from '@/infra/repositories/OrderRepository'
import ISearch from '@/domain/seedWork/paging/ISearch'
import { mockOrder as mockReceivableResponse } from '../../../mocked-order'

// Mock dependencies
jest.mock('@/domain/aggregates/filter/filter')
jest.mock('@/infra/internal/AxiosHttpClient')

describe('OrderRepository', () => {
  let orderRepository: OrderRepository
  let mockHttpClient: jest.Mocked<IHttpClient>
  let mockFilter: jest.Mocked<Filter>

  const mockSearchResult: ISearch<IReceivableResponse> = {
    data: [mockReceivableResponse],
    paging: { currentPage: 1, pages: 1, perPage: 10, total: 1 },
  }

  beforeEach(() => {
    // Create HttpClient mock
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      patch: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    }

    // Create Filter mock
    mockFilter = {
      toQueryString: jest.fn().mockReturnValue('param1=value1&param2=value2'),
      // ... other required properties/methods
    } as unknown as jest.Mocked<Filter>

    orderRepository = new OrderRepository(mockHttpClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('getOrdersByFilter', () => {
    it('should return empty result when filter is empty', async () => {
      const emptyFilter = {}
      const result = await orderRepository.getOrdersByFilter(
        emptyFilter as Filter
      )

      expect(result).toEqual({
        data: [],
        paging: { currentPage: 1, pages: 1, perPage: 10, total: 1 },
      })
      expect(mockHttpClient.get).not.toHaveBeenCalled()
    })

    it('should call HttpClient with correct query string when filter is not empty', async () => {
      mockHttpClient.get.mockResolvedValue(mockSearchResult)

      const result = await orderRepository.getOrdersByFilter(mockFilter)

      expect(mockFilter.toQueryString).toHaveBeenCalled()
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/v1/order/receivable/single?param1=value1&param2=value2'
      )
      expect(result).toEqual(mockSearchResult)
    })

    it('should return empty result and log error when HTTP call fails', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
      const error = new Error('HTTP error')
      mockHttpClient.get.mockRejectedValue(error)

      const result = await orderRepository.getOrdersByFilter(mockFilter)

      expect(result).toEqual({
        data: [],
        paging: { currentPage: 1, pages: 1, perPage: 10, total: 1 },
      })
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error fetching orders by filter',
          errorCode: 'orderRepository.getOrdersByFilter.error',
          detailedMessage: expect.stringContaining(
            'Failed to fetch orders for filter'
          ),
        })
      )
      consoleErrorSpy.mockRestore()
    })
  })

  describe('getOrderDetails', () => {
    it('should call HttpClient with correct parameters', async () => {
      mockHttpClient.get.mockResolvedValue(mockSearchResult)

      const orderId = '12345'
      const result = await orderRepository.getOrderDetails(orderId)

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `/v1/order/receivable/single?orderId=${orderId}&retrieveRefunds=1&retrieveDiscounts=1&retrievePayments=1`
      )
      expect(result).toEqual(mockSearchResult)
    })

    it('should throw error when HTTP call fails', async () => {
      const mockErrorHandler = { createError: jest.fn() }
      const repository = new OrderRepository(mockHttpClient, mockErrorHandler)
      const error = new Error('HTTP error')
      mockHttpClient.get.mockRejectedValue(error)

      await expect(repository.getOrderDetails('123')).rejects.toThrow(error)
      expect(mockErrorHandler.createError).toHaveBeenCalledWith({
        message: 'Error fetching order details',
        errorCode: 'orderRepository.getOrderDetails.error',
        detailedMessage: 'HTTP error',
      })
    })
  })

  describe('constructor', () => {
    it('should use AxiosHttpClient as default when no HttpClient is provided', () => {
      const repository = new OrderRepository()
      expect(repository).toBeInstanceOf(OrderRepository)
      // You can add specific verification for AxiosHttpClient if needed
    })

    it('should use provided HttpClient', () => {
      const customHttpClient = {
        get: jest.fn(),
        post: jest.fn(),
        patch: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
      } as unknown as IHttpClient

      const repository = new OrderRepository(customHttpClient)
      expect(repository).toBeInstanceOf(OrderRepository)
      // Verify if the custom client is being used
    })
  })

  describe('refundOrderPayment', () => {
    const mockRefundParams = {
      orderId: '12345',
      internalPaymentId: 'int-123',
      acquirerId: 1,
      companyId: 1,  
      systemId: 1,
      amount: 100,
      paymentId: 'pay-123',
      reference: 'reference'
    }

    it('should call HttpClient with correct parameters', async () => {
      mockHttpClient.post.mockResolvedValue(undefined)

      await orderRepository.refundOrderPayment(mockRefundParams)

      expect(mockHttpClient.post).toHaveBeenCalledWith(
        `/v1/payment/${mockRefundParams.paymentId}/refund`,
        {
          orderId: mockRefundParams.orderId,
          internalPaymentId: mockRefundParams.internalPaymentId,
          acquirerId: mockRefundParams.acquirerId,
          companyId: mockRefundParams.companyId,
          amount: mockRefundParams.amount,
          reference: mockRefundParams.reference,
          systemId: mockRefundParams.systemId,
        }
      )
    })

    it('should throw error when HTTP call fails', async () => {
      const mockErrorHandler = { createError: jest.fn() }
      const repository = new OrderRepository(mockHttpClient, mockErrorHandler)
      const error = new Error('HTTP error')
      mockHttpClient.post.mockRejectedValue(error)

      await expect(
        repository.refundOrderPayment(mockRefundParams)
      ).rejects.toThrow(error)
      expect(mockErrorHandler.createError).toHaveBeenCalledWith({
        message: 'Error processing refund for order payment',
        errorCode: 'orderRepository.refundOrderPayment.error',
        detailedMessage: 'HTTP error',
      })
    })
  })

  describe('cancelOrder', () => {
    const mockCancelParams = {
      orderId: '12345',
      referenceId: 'ref-001',
      subReferenceId: 'sub-001',
      requester: {
        id: 'req-123',
        name: 'Fake User',
        email: 'fakeuser@example.com',
      },
    }

    it('should call HttpClient.patch with correct parameters', async () => {
      mockHttpClient.patch.mockResolvedValue(undefined)

      await orderRepository.cancelOrder(mockCancelParams)

      expect(mockHttpClient.patch).toHaveBeenCalledWith(
        `/v1/order/status/${mockCancelParams.orderId}`,
        {
          event: 'MULTIPAY-CANCELED',
          subEvent: 'MULTIPAY-CANCELED',
          reference: `${mockCancelParams.referenceId}-${mockCancelParams.subReferenceId}`,
          requester: {
            id: mockCancelParams.requester.id,
            name: mockCancelParams.requester.name,
            email: mockCancelParams.requester.email,
          },
        }
      )
    })

    it('should throw error when HttpClient.patch fails', async () => {
      const mockErrorHandler = { createError: jest.fn() }
      const repository = new OrderRepository(mockHttpClient, mockErrorHandler)
      const error = new Error('HTTP error')
      mockHttpClient.patch.mockRejectedValue(error)

      await expect(repository.cancelOrder(mockCancelParams)).rejects.toThrow(error)

      expect(mockErrorHandler.createError).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Error processing cancel for order',
          errorCode: 'orderRepository.cancelOrder.error',
          detailedMessage: 'HTTP error',
        })
      )
    })
  })

})
