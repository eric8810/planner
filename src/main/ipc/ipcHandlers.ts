import { ipcMain } from 'electron'
import { WindowManager } from '../window/WindowManager'

export function initIpcHandlers(windowManager: WindowManager): void {
  // 在这里添加所有IPC处理程序
  ipcMain.on('ping', () => console.log('pong'))

  ipcMain.on('focus-main-window', () => {
    windowManager.focusMainWindow()
  })
}
