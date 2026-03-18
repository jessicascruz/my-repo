import IErrorResponse from '@/domain/seedWork/http/IErrorResponse'
import IHttpClient from '@/domain/seedWork/http/IHttpClient'
import { PageNotFoundError } from 'next/dist/shared/lib/utils'

export class FetchHttpClient implements IHttpClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_GATEWAY_API_URL!
  }

  async get<T>(url: string, options?: RequestInit): Promise<T> {
    return this.fetchData<T>(url, options)
  }

  async post<T>(url: string, data: unknown, options?: RequestInit): Promise<T> {
    return this.fetchData<T>(url, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async patch<T>(url: string, data: unknown, options?: RequestInit): Promise<T> {
    return this.fetchData<T>(url, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async put<T>(url: string, data: unknown, options?: RequestInit): Promise<T> {
    return this.fetchData<T>(url, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async delete<T>(url: string, options?: RequestInit): Promise<T> {
    return this.fetchData<T>(url, { ...options, method: 'DELETE' })
  }

  private async fetchData<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    try {
      const headers = new Headers(
        options.headers ?? { 'Content-Type': 'application/json' }
      )

      const fetchOptions: RequestInit = {
        ...options,
        headers,
      }

      const response = await fetch(`${this.baseUrl}${url}`, fetchOptions)

      if (!response.ok) {
        if (response.status === 404) {
          throw new PageNotFoundError('Page not found')
        }

        const errorData: IErrorResponse = await response.json()

        console.error(`HTTP error! ${JSON.stringify(errorData)}`)
        throw new Error(`HTTP error! ${JSON.stringify(errorData)}`)
      }

      return await response.json()
    } catch (error: unknown) {
      console.error('Fetch error:', error)
      throw error
    }
  }
}
