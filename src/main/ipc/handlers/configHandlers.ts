import { ipcMain } from 'electron'
import { ConfigService } from '../../services/config/ConfigService'
import { LLMConfig } from '@shared/interfaces'

export function registerConfigHandlers(configService: ConfigService): void {
  // Get user config
  ipcMain.handle(
    'config:getUserLLMConfig',
    async (_event, userId: string, provider: string, model: string) => {
      return await configService.getUserLLMConfig(userId, provider, model)
    }
  )

  // Update user config
  ipcMain.handle(
    'config:updateUserLLMConfig',
    async (_event, userId: string, provider: string, model: string, config: LLMConfig) => {
      await configService.updateUserLLMConfig(userId, provider, model, config)
    }
  )

  // Get app config
  ipcMain.handle('config:getAppConfig', async () => {
    return await configService.getAppConfig()
  })

  // Update app config
  ipcMain.handle('config:updateAppConfig', async (_event, config) => {
    await configService.updateAppConfig(config)
  })

  // Clear all configs
  ipcMain.handle('config:clear', async () => {
    await configService.clearConfig()
  })
}

export function removeConfigHandlers(): void {
  ipcMain.removeHandler('config:getUserConfig')
  ipcMain.removeHandler('config:updateUserConfig')
  ipcMain.removeHandler('config:getAppConfig')
  ipcMain.removeHandler('config:updateAppConfig')
  ipcMain.removeHandler('config:clear')
}
