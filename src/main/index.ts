import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { WindowManager } from './window/WindowManager'
import { AppManager } from './app/AppManager'
import { initIpcHandlers } from './ipc/ipcHandlers'
import { ApiService } from './services/api/ApiService'
import { FileService } from './services/file/FileService'
import { initApiHandlers } from './ipc/handlers/apiHandlers'
import { initFileHandlers } from './ipc/handlers/fileHandlers'
import { ConfigService } from './services/config/ConfigService'

class MainProcess {
  private windowManager: WindowManager
  private appManager: AppManager
  private apiService: ApiService
  private fileService: FileService
  private configService: ConfigService

  constructor() {
    this.windowManager = new WindowManager()
    this.appManager = new AppManager()
    this.apiService = new ApiService()
    this.fileService = new FileService()
    this.configService = new ConfigService()
  }

  init(): void {
    this.appManager.init()
    this.initAppEvents()
    this.initIpcHandlers()
  }

  private initAppEvents(): void {
    app.whenReady().then(() => {
      this.windowManager.createMainWindow()

      app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
          this.windowManager.createMainWindow()
        }
      })
    })

    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit()
      }
    })

    app.on('before-quit', () => {
      this.configService.close()
    })
  }

  private initIpcHandlers(): void {
    initApiHandlers(this.apiService)
    initFileHandlers(this.fileService)
  }
}

// 启动应用
const mainProcess = new MainProcess()
mainProcess.init()
