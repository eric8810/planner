import { app } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'

export class AppManager {
  init(): void {
    this.setAppConfigs()
    this.setupWindowEvents()
  }

  private setAppConfigs(): void {
    electronApp.setAppUserModelId('com.electron')
  }

  private setupWindowEvents(): void {
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })
  }
}
