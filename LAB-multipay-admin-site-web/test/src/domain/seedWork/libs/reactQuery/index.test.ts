import {
  mockOrdersResponse,
  mockOrder as mockOrderDetailsResponse,
} from '../../../../../mocked-order'
import { reactQueryEnum } from '@/domain/seedWork/libs/reactQuery/reactQuery.enums'
import {
  getQueryClient,
  makeQueryClient,
} from '@/domain/seedWork/libs/reactQuery/queryClient'
import { QueryClient } from '@tanstack/react-query'
import { Filter } from '@/domain/aggregates/filter/filter'

jest.mock('@/infra/repositories/OrderRepository', () => ({
  OrderRepository: jest.fn().mockImplementation(() => ({
    getOrdersByFilter: jest.fn().mockResolvedValue(mockOrdersResponse),
    getOrderDetails: jest.fn().mockResolvedValue(mockOrderDetailsResponse),
  })),
}))

describe('React Query Utilities', () => {
  const mockOrderId = 'order-123'

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('filterOptions', () => {
    const mockFilter = new Filter()

    beforeEach(() => {
      jest.resetAllMocks()
    })

    it('should call OrderRepository with correct filter', async () => {
      const {
        filterOptions,
      } = require('@/domain/seedWork/libs/reactQuery/options')

      const result = filterOptions(mockFilter)

      // Executar a queryFn e verificar o comportamento
      const queryResult = await result.queryFn!({
        queryKey: [reactQueryEnum.GET_ORDERS, mockFilter],
        signal: new AbortController().signal,
        meta: undefined,
        pageParam: undefined,
        direction: undefined,
        client: new QueryClient(),
      })

      expect(queryResult).toEqual(mockOrdersResponse)
    })
  })

  describe('detailsOptions', () => {
    it('should return correct query options for order details', async () => {
      const {
        detailsOptions,
      } = require('@/domain/seedWork/libs/reactQuery/options')

      const result = detailsOptions(mockOrderId)

      // 3. Verificar a estrutura das options
      expect(result).toEqual({
        queryKey: [reactQueryEnum.GET_ORDER_DETAILS, mockOrderId],
        queryFn: expect.any(Function),
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 5 * 60 * 1000,
      })

      // 4. Criar contexto para a queryFn
      const response = await result.queryFn({
        queryKey: [reactQueryEnum.GET_ORDER_DETAILS, mockOrderId],
        signal: new AbortController().signal,
        meta: undefined,
        pageParam: undefined,
        direction: undefined,
        client: new QueryClient(),
      })

      expect(response).toEqual(mockOrderDetailsResponse)
    })
  })

  describe('Query Client Functions', () => {
    describe('makeQueryClient', () => {
      it('should create a new QueryClient with default options', () => {
        const queryClient = makeQueryClient()
        expect(queryClient).toBeInstanceOf(QueryClient)
        expect(queryClient.getDefaultOptions()).toEqual({
          queries: {
            staleTime: 5 * 60 * 1000,
          },
        })
      })
    })

    describe('getQueryClient', () => {
      let originalWindow: typeof window

      beforeAll(() => {
        originalWindow = global.window
      })

      afterAll(() => {
        global.window = originalWindow
      })

      it('should create new client on server side', () => {
        // Simula ambiente server-side
        delete (global as any).window

        const client = getQueryClient()
        expect(client).toBeInstanceOf(QueryClient)
      })

      it('should reuse client on client side', () => {
        // Simula ambiente client-side
        global.window = {} as any

        // Primeira chamada cria o client
        const firstClient = getQueryClient()

        // Segunda chamada reusa o mesmo client
        const secondClient = getQueryClient()

        expect(firstClient).toBe(secondClient)
      })
    })
  })
})
