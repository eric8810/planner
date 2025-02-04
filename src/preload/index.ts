import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { FileOperation, IPC_CHANNELS } from '../shared/interfaces'

// Custom APIs for renderer
const mainService = {
  ipcRenderer: {
    invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
    readFile: (path: string) => ipcRenderer.invoke(IPC_CHANNELS.FILE.READ, path),
    writeFile: (operation: FileOperation) => ipcRenderer.invoke(IPC_CHANNELS.FILE.WRITE, operation),
    deleteFile: (path: string) => ipcRenderer.invoke(IPC_CHANNELS.FILE.DELETE, path)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', mainService)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.mainService = mainService
}
