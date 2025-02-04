import { app, BrowserWindow } from 'electron'

import { WindowManager } from './window/WindowManager'
import { AppManager } from './app/AppManager'
import { ApiService } from './services/api/ApiService'
import { FileService } from './services/file/FileService'
import { initApiHandlers } from './ipc/handlers/apiHandlers'
import { initFileHandlers } from './ipc/handlers/fileHandlers'
import { ConfigService } from './services/config/ConfigService'
import { UserService } from './services/user/UserService'
import { initUserHandlers, removeUserHandlers } from './ipc/handlers/userHandlers'
import { BoardService } from './services/board/BoardService'
import { LLMService } from './services/llm/LLMService'
import { initLLMHandlers } from './ipc/handlers/llmHandlers'

class MainProcess {
  private windowManager: WindowManager
  private appManager: AppManager
  private apiService: ApiService
  private fileService: FileService
  private configService: ConfigService
  private userService: UserService
  private boardService: BoardService
  private llmService: LLMService
  constructor() {
    this.windowManager = new WindowManager()
    this.appManager = new AppManager()
    this.apiService = new ApiService()
    this.fileService = new FileService()
    this.configService = new ConfigService()
    this.boardService = new BoardService()

    this.userService = new UserService(this.boardService, this.configService)
    this.llmService = new LLMService(this.configService, this.userService)
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
      removeUserHandlers()
      this.configService.close()
      // this.boardService.close()
    })
  }

  private initIpcHandlers(): void {
    initApiHandlers(this.apiService)
    initFileHandlers(this.fileService)
    initUserHandlers(this.userService)
    initLLMHandlers(this.llmService)
  }
}

// 启动应用
const mainProcess = new MainProcess()
mainProcess.init()
