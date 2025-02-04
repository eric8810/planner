import { BrowserWindow, shell } from 'electron'
import { join } from 'path'
import { is } from '@electron-toolkit/utils'
import icon from '../../../resources/icon.png?asset'

export class WindowManager {
  private mainWindow: BrowserWindow | null = null
  private windows: Map<string, BrowserWindow[]> = new Map()
  private singletonWindows: Map<string, BrowserWindow> = new Map()

  createMainWindow(): BrowserWindow {
    this.mainWindow = new BrowserWindow({
      width: 900,
      height: 670,
      show: false,
      autoHideMenuBar: true,
      ...(process.platform === 'linux' ? { icon } : {}),
      webPreferences: {
        preload: join(__dirname, '../../preload/index.js'),
        sandbox: false
      }
    })

    this.setupWindowEvents()
    this.loadContent()

    return this.mainWindow
  }

  private setupWindowEvents(): void {
    if (!this.mainWindow) return

    this.mainWindow.on('ready-to-show', () => {
      this.mainWindow?.show()
    })

    this.mainWindow.webContents.setWindowOpenHandler((details) => {
      shell.openExternal(details.url)
      return { action: 'deny' }
    })

    if (is.dev) {
      this.mainWindow.webContents.openDevTools()
    }
  }

  private loadContent(): void {
    if (!this.mainWindow) return

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
    } else {
      this.mainWindow.loadFile(join(__dirname, '../../renderer/index.html'))
    }
  }

  createWindow(
    windowType: string,
    options: Electron.BrowserWindowConstructorOptions,
    isSingleton = false
  ): BrowserWindow {
    if (isSingleton) {
      const existingWindow = this.singletonWindows.get(windowType)
      if (existingWindow) {
        if (!existingWindow.isDestroyed()) {
          existingWindow.focus()
          return existingWindow
        }
        this.singletonWindows.delete(windowType)
      }
    }

    const window = new BrowserWindow({
      ...options,
      webPreferences: {
        preload: join(__dirname, '../../preload/index.js'),
        sandbox: false,
        ...options.webPreferences
      }
    })

    if (isSingleton) {
      this.singletonWindows.set(windowType, window)
    } else {
      const windows = this.windows.get(windowType) || []
      windows.push(window)
      this.windows.set(windowType, windows)
    }

    window.on('closed', () => {
      if (!isSingleton) {
        const windows = this.windows.get(windowType) || []
        const index = windows.indexOf(window)
        if (index > -1) {
          windows.splice(index, 1)
        }
      } else {
        this.singletonWindows.delete(windowType)
      }
    })

    return window
  }

  getWindows(windowType: string): BrowserWindow[] {
    return this.windows.get(windowType) || []
  }

  getSingletonWindow(windowType: string): BrowserWindow | null {
    return this.singletonWindows.get(windowType) || null
  }

  closeAllWindows(): void {
    // 关闭所有多实例窗口
    this.windows.forEach((windows, windowType) => {
      windows.forEach((window) => {
        if (!window.isDestroyed()) {
          window.close()
        }
      })
      this.windows.delete(windowType)
    })

    // 关闭所有单例窗口
    this.singletonWindows.forEach((window, windowType) => {
      if (!window.isDestroyed()) {
        window.close()
      }
      this.singletonWindows.delete(windowType)
    })

    // 关闭主窗口
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      this.mainWindow.close()
      this.mainWindow = null
    }
  }

  focusMainWindow(): void {
    if (this.mainWindow && !this.mainWindow.isDestroyed()) {
      if (this.mainWindow.isMinimized()) {
        this.mainWindow.restore()
      }
      this.mainWindow.focus()
    }
  }
}
