import { FetchHttpClient } from '@/infra/internal/FetchHttpClient'
import { PageNotFoundError } from 'next/dist/shared/lib/utils'
import IHttpClient from '@/domain/seedWork/http/IHttpClient'

// Mock global fetch
global.fetch = jest.fn() as jest.Mock

// Mock environment variable
process.env.NEXT_PUBLIC_GATEWAY_API_URL = 'http://api.example.com'

describe('FetchHttpClient', () => {
  let httpClient: IHttpClient

  beforeEach(() => {
    httpClient = new FetchHttpClient()
    ;(fetch as jest.Mock).mockClear()
  })

  describe('IHttpClient Implementation', () => {
    it('should correctly implement the IHttpClient interface', () => {
      expect(httpClient.get).toBeInstanceOf(Function)
      expect(httpClient.post).toBeInstanceOf(Function)
      expect(httpClient.patch).toBeInstanceOf(Function)
      expect(httpClient.put).toBeInstanceOf(Function)
      expect(httpClient.delete).toBeInstanceOf(Function)
    })
  })

  describe('GET Method', () => {
    it('should make a GET request and return data', async () => {
      const mockData = { id: 1, name: 'Test' }
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      })

      const result = await httpClient.get('/test')
      expect(result).toEqual(mockData)
      expect(fetch).toHaveBeenCalledWith('http://api.example.com/test', {
        headers: new Headers({ 'Content-Type': 'application/json' }),
      })
    })

    it('should accept optional options', async () => {
      const mockData = { id: 1 }
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      })

      const options = { cache: 'no-store' as RequestCache }
      await httpClient.get('/test', options)

      expect(fetch).toHaveBeenCalledWith('http://api.example.com/test', {
        headers: new Headers({ 'Content-Type': 'application/json' }),
        cache: 'no-store',
      })
    })
  })

  describe('POST Method', () => {
    it('should make a POST request with data and return response', async () => {
      const mockData = { name: 'New Item' }
      const responseData = { id: 1, name: 'New Item' }
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(responseData),
      })

      const result = await httpClient.post('/items', mockData)
      expect(result).toEqual(responseData)
      expect(fetch).toHaveBeenCalledWith('http://api.example.com/items', {
        method: 'POST',
        body: JSON.stringify(mockData),
        headers: new Headers({ 'Content-Type': 'application/json' }),
      })
    })
  })

  describe('PATCH Method', () => {
    it('should make a PATCH request with data and return response', async () => {
      const mockData = { name: 'Partial Update' }
      const responseData = { id: 1, name: 'Partial Update' }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(responseData),
      })

      const result = await httpClient.patch('/items/1', mockData)

      expect(result).toEqual(responseData)
      expect(fetch).toHaveBeenCalledWith('http://api.example.com/items/1', {
        method: 'PATCH',
        body: JSON.stringify(mockData),
        headers: new Headers({ 'Content-Type': 'application/json' }),
      })
    })
  })

  describe('PUT Method', () => {
    it('should make a PUT request with data and return response', async () => {
      const mockData = { id: 1, name: 'Updated' }
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockData),
      })

      const result = await httpClient.put('/items/1', mockData)
      expect(result).toEqual(mockData)
      expect(fetch).toHaveBeenCalledWith('http://api.example.com/items/1', {
        method: 'PUT',
        body: JSON.stringify(mockData),
        headers: new Headers({ 'Content-Type': 'application/json' }),
      })
    })
  })

  describe('DELETE Method', () => {
    it('should make a DELETE request and return response', async () => {
      const responseData = { success: true }
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(responseData),
      })

      const result = await httpClient.delete('/items/1')
      expect(result).toEqual(responseData)
      expect(fetch).toHaveBeenCalledWith('http://api.example.com/items/1', {
        method: 'DELETE',
        headers: new Headers({ 'Content-Type': 'application/json' }),
      })
    })
  })

  describe('Error Handling', () => {
    it('should throw PageNotFoundError for 404 status', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
      })

      await expect(httpClient.get('/not-found')).rejects.toThrow(
        PageNotFoundError
      )
    })

    it('should throw Error with response data for HTTP errors', async () => {
      const errorData = { error: 'Invalid request', code: 400 }
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve(errorData),
      })

      await expect(httpClient.get('/bad-request')).rejects.toThrow(
        `HTTP error! ${JSON.stringify(errorData)}`
      )
    })

    it('should throw network errors', async () => {
      const networkError = new Error('Network error')
      ;(fetch as jest.Mock).mockRejectedValueOnce(networkError)

      await expect(httpClient.get('/test')).rejects.toThrow(networkError)
    })
  })

  describe('Headers and Options', () => {
    it('should allow overriding default Content-Type', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      })

      await httpClient.get('/text', {
        headers: { 'Content-Type': 'text/plain' },
      })

      expect(fetch).toHaveBeenCalledWith('http://api.example.com/text', {
        headers: new Headers({ 'Content-Type': 'text/plain' }),
      })
    })

    it('should accept all RequestInit options', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({}),
      })

      const complexOptions: RequestInit = {
        cache: 'no-cache',
        credentials: 'include',
        mode: 'cors',
      }

      await httpClient.get('/complex', complexOptions)

      expect(fetch).toHaveBeenCalledWith('http://api.example.com/complex', {
        headers: new Headers({ 'Content-Type': 'application/json' }),
        ...complexOptions,
      })
    })
  })
})
