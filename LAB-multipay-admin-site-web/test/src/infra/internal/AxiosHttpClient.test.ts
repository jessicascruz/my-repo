import axios, {
  AxiosInstance,
  AxiosInterceptorManager,
  AxiosRequestConfig,
  AxiosResponse,
} from 'axios'
import { getSession } from 'next-auth/react'
import IHttpClient from '@/domain/seedWork/http/IHttpClient'
import { AxiosHttpClient } from '@/infra/internal/AxiosHttpClient'

// Mock das dependências
jest.mock('axios')
jest.mock('next-auth/react')

const mockedAxios = axios as jest.Mocked<typeof axios>
const mockedGetSession = getSession as jest.MockedFunction<typeof getSession>

describe('AxiosHttpClient', () => {
  let httpClient: IHttpClient
  const originalEnv = process.env

  const createMockAxiosInstance = (): jest.Mocked<AxiosInstance> => {
    const mockInstance = {
      interceptors: {
        request: {
          use: jest.fn(),
          eject: jest.fn(),
          clear: jest.fn(),
        } as unknown as AxiosInterceptorManager<AxiosRequestConfig>,
        response: {
          use: jest.fn(),
          eject: jest.fn(),
          clear: jest.fn(),
        } as unknown as AxiosInterceptorManager<AxiosResponse>,
      },
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      request: jest.fn(),
      head: jest.fn(),
      options: jest.fn(),
      patch: jest.fn(),
      defaults: {} as AxiosRequestConfig,
      getUri: jest.fn(),
    } as unknown as jest.Mocked<AxiosInstance>

    return mockInstance
  }

  beforeEach(() => {
    jest.resetModules()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_REACT_APP_API_BASE_URL: 'https://api.example.com',
    }
    jest.clearAllMocks()

    // Configuração do mock do axios
    const mockInstance = createMockAxiosInstance()
    mockedAxios.create.mockReturnValue(mockInstance)

    httpClient = new AxiosHttpClient()
  })

  afterAll(() => {
    process.env = originalEnv
  })

  describe('initialization', () => {
    it('should create axios instance with correct baseURL', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.example.com',
      })
    })
  })

  describe('request interceptor', () => {
    it('should add authorization header when session exists', async () => {
      const mockSession = {
        authTokens: {
          accessToken: 'test-token-123',
        },
      }
      mockedGetSession.mockResolvedValue(mockSession as any)

      // Simula a chamada do interceptor
      const interceptorCallback =
        mockedAxios.create.mock.results[0].value.interceptors.request.use.mock
          .calls[0][0]

      const mockConfig = {
        headers: {},
      }
      const result = await interceptorCallback(mockConfig)

      expect(result.headers.Authorization).toBe('Bearer test-token-123')
    })
  })

  describe('HTTP methods', () => {
    const testUrl = '/test-endpoint'
    const testData = { key: 'value' }
    const mockResponse = { data: 'response-data' }
    const mockOptions = { headers: { 'Custom-Header': 'value' } }

    beforeEach(() => {
      const mockInstance = mockedAxios.create.mock.results[0].value
      mockInstance.get.mockResolvedValue(mockResponse)
      mockInstance.post.mockResolvedValue(mockResponse)
      mockInstance.patch.mockResolvedValue(mockResponse)
      mockInstance.put.mockResolvedValue(mockResponse)
      mockInstance.delete.mockResolvedValue(mockResponse)
    })

    it('get should call axios with correct url and options', async () => {
      const result = await httpClient.get(testUrl)
      const axiosInstance = mockedAxios.create.mock.results[0].value
      expect(axiosInstance.get).toHaveBeenCalledWith(testUrl)
      expect(result).toBe(mockResponse.data)
    })

    it('post should call axios with correct url, data and options', async () => {
      const result = await httpClient.post(testUrl, testData)
      const axiosInstance = mockedAxios.create.mock.results[0].value
      expect(axiosInstance.post).toHaveBeenCalledWith(testUrl, testData)
      expect(result).toBe(mockResponse.data)
    })

    it('patch should call axios with correct url, data and options', async () => {
      const result = await httpClient.patch(testUrl, testData)
      const axiosInstance = mockedAxios.create.mock.results[0].value
      expect(axiosInstance.patch).toHaveBeenCalledWith(testUrl, testData)
      expect(result).toBe(mockResponse.data)
    })

    it('put should call axios with correct url, data and options', async () => {
      const result = await httpClient.put(testUrl, testData)
      const axiosInstance = mockedAxios.create.mock.results[0].value
      expect(axiosInstance.put).toHaveBeenCalledWith(testUrl, testData)
      expect(result).toBe(mockResponse.data)
    })

    it('delete should call axios with correct url and options', async () => {
      const result = await httpClient.delete(testUrl)
      const axiosInstance = mockedAxios.create.mock.results[0].value
      expect(axiosInstance.delete).toHaveBeenCalledWith(testUrl)
      expect(result).toBe(mockResponse.data)
    })

    it('should work without options parameter', async () => {
      const result = await httpClient.get(testUrl)
      const axiosInstance = mockedAxios.create.mock.results[0].value
      expect(axiosInstance.get).toHaveBeenCalledWith(testUrl)
      expect(result).toBe(mockResponse.data)
    })
  })

  describe('Error handling in HTTP methods', () => {
    const testUrl = '/test-endpoint'
    const testData = { key: 'value' }
    const mockError = new Error('Request failed')
    const mockAxiosError = {
      response: {
        status: 500,
        data: { error: 'Internal Server Error' },
      },
      isAxiosError: true,
    }

    beforeEach(() => {
      const axiosInstance = mockedAxios.create.mock.results[0].value

      // Configura os mocks para lançar erros
      axiosInstance.get.mockRejectedValue(mockError)
      axiosInstance.post.mockRejectedValue(mockAxiosError)
      axiosInstance.patch.mockRejectedValue(mockAxiosError)
      axiosInstance.put.mockRejectedValue(mockError)
      axiosInstance.delete.mockRejectedValue(mockAxiosError)
    })

    it('should throw error when GET fails', async () => {
      await expect(httpClient.get(testUrl)).rejects.toThrow(mockError)
      const axiosInstance = mockedAxios.create.mock.results[0].value
      expect(axiosInstance.get).toHaveBeenCalledWith(testUrl)
    })

    it('should throw axios error when POST fails', async () => {
      await expect(httpClient.post(testUrl, testData)).rejects.toEqual(
        mockAxiosError
      )
      const axiosInstance = mockedAxios.create.mock.results[0].value
      expect(axiosInstance.post).toHaveBeenCalledWith(testUrl, testData)
    })

    it('should throw axios error when POST fails', async () => {
      await expect(httpClient.patch(testUrl, testData)).rejects.toEqual(
        mockAxiosError
      )
      const axiosInstance = mockedAxios.create.mock.results[0].value
      expect(axiosInstance.patch).toHaveBeenCalledWith(testUrl, testData)
    })

    it('should throw error when PUT fails', async () => {
      await expect(httpClient.put(testUrl, testData)).rejects.toThrow(mockError)
      const axiosInstance = mockedAxios.create.mock.results[0].value
      expect(axiosInstance.put).toHaveBeenCalledWith(testUrl, testData)
    })

    it('should throw axios error when DELETE fails', async () => {
      await expect(httpClient.delete(testUrl)).rejects.toEqual(mockAxiosError)
      const axiosInstance = mockedAxios.create.mock.results[0].value
      expect(axiosInstance.delete).toHaveBeenCalledWith(testUrl)
    })

    it('should preserve axios error structure when available', async () => {
      try {
        await httpClient.post(testUrl, testData)
      } catch (error) {
        expect(error).toHaveProperty('isAxiosError', true)
        expect(error).toHaveProperty('response')
        // expect(error.response).toHaveProperty('status', 500);
      }
    })
  })
})
