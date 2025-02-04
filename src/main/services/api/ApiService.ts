import axios, { AxiosInstance } from 'axios'

export class ApiService {
  private client: AxiosInstance

  constructor() {
    this.client = axios.create({
      baseURL: process.env.API_BASE_URL,
      timeout: 10000
    })
  }

  async get<T>(url: string, params?: object): Promise<T> {
    const response = await this.client.get(url, { params })
    return response.data
  }

  async post<T>(url: string, data?: object): Promise<T> {
    const response = await this.client.post(url, data)
    return response.data
  }

  // 其他 HTTP 方法...
}
