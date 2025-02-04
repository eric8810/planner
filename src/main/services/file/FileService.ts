import { app } from 'electron'
import fs from 'fs/promises'
import path from 'path'
import type { FileOperation } from '../../../shared/interfaces'

export class FileService {
  private userDataPath: string

  constructor() {
    this.userDataPath = app.getPath('userData')
  }

  async readFile(relativePath: string): Promise<string> {
    const fullPath = path.join(this.userDataPath, relativePath)
    return fs.readFile(fullPath, 'utf-8')
  }

  async writeFile(operation: FileOperation): Promise<void> {
    const fullPath = path.join(this.userDataPath, operation.path)
    await fs.mkdir(path.dirname(fullPath), { recursive: true })
    await fs.writeFile(fullPath, operation.content || '', 'utf-8')
  }

  async deleteFile(relativePath: string): Promise<void> {
    const fullPath = path.join(this.userDataPath, relativePath)
    await fs.unlink(fullPath)
  }

  // 其他文件操作方法...
}
