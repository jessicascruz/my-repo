export default interface IHttpClient {
  get<T>(url: string, options?: RequestInit): Promise<T>;
  post<T>(url: string, data: unknown, options?: RequestInit): Promise<T>;
  patch<T>(url: string, data: unknown, options?: RequestInit): Promise<T>;
  put<T>(url: string, data: unknown, options?: RequestInit): Promise<T>;
  delete<T>(url: string, options?: RequestInit): Promise<T>;
}
