import { ipcMain } from 'electron'
import { FileService } from '@/services/file/FileService'

export function initFileHandlers(fileService: FileService): void {
  ipcMain.handle('file:read', async (_, path: string) => {
    try {
      return await fileService.readFile(path)
    } catch (error) {
      console.error('File Read Error:', error)
      throw error
    }
  })

  ipcMain.handle('file:write', async (_, path: string, content: string) => {
    try {
      await fileService.writeFile({ path, content })
      return true
    } catch (error) {
      console.error('File Write Error:', error)
      throw error
    }
  })
}

export function removeFileHandlers(): void {
  ipcMain.removeHandler('file:read')
  ipcMain.removeHandler('file:write')
}
