import IHttpClient from '@/domain/seedWork/http/IHttpClient'
import axios, { AxiosInstance } from 'axios'

export class AxiosHttpClient implements IHttpClient {
  private axiosInstance: AxiosInstance

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.NEXT_PUBLIC_REACT_APP_API_BASE_URL,
    })
  }

  async get<T>(url: string): Promise<T> {
    try {
      const response = await this.axiosInstance.get<T>(url)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async post<T>(url: string, data: unknown): Promise<T> {
    try {
      const response = await this.axiosInstance.post<T>(url, data)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async patch<T>(url: string, data: unknown): Promise<T> {
    try {
      const response = await this.axiosInstance.patch<T>(url, data)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async put<T>(url: string, data: unknown): Promise<T> {
    try {
      const response = await this.axiosInstance.put<T>(url, data)
      return response.data
    } catch (error) {
      throw error
    }
  }

  async delete<T>(url: string): Promise<T> {
    try {
      const response = await this.axiosInstance.delete<T>(url)
      return response.data
    } catch (error) {
      throw error
    }
  }
}
