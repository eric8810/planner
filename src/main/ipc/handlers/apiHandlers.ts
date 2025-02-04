import { ipcMain } from 'electron'
import { ApiService } from '../../services/api/ApiService'

export function initApiHandlers(apiService: ApiService): void {
  ipcMain.handle('api:get', async (_, url: string, params?: object) => {
    try {
      return await apiService.get(url, params)
    } catch (error) {
      console.error('API GET Error:', error)
      throw error
    }
  })

  ipcMain.handle('api:post', async (_, url: string, data?: object) => {
    try {
      return await apiService.post(url, data)
    } catch (error) {
      console.error('API POST Error:', error)
      throw error
    }
  })
}
