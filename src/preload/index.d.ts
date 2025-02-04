import { ElectronAPI } from '@electron-toolkit/preload'
import type { FileOperation, ApiResponse } from '../shared/interfaces'

declare global {
  interface Window {
    electron: ElectronAPI
    mainService: {
      ipcRenderer: {
        invoke(channel: string, ...args: any[]): Promise<any>
        // Add typed methods
        readFile(path: string): Promise<string>
        writeFile(operation: FileOperation): Promise<void>
        deleteFile(path: string): Promise<void>
      }
    }
  }
}
