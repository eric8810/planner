import { ipcMain } from 'electron'
import { UserService } from '../../services/user/UserService'

export function initUserHandlers(userService: UserService): void {
  ipcMain.handle('user:login', async (_, token: string) => {
    try {
      return await userService.login(token)
    } catch (error) {
      console.error('User Login Error:', error)
      throw error
    }
  })

  ipcMain.handle('user:autoLogin', async () => {
    try {
      return await userService.autoLogin()
    } catch (error) {
      console.error('User Auto Login Error:', error)
      throw error
    }
  })

  ipcMain.handle('user:getUserId', async () => {
    try {
      return await userService.getUserId()
    } catch (error) {
      console.error('User Verify Session Error:', error)
      throw error
    }
  })

  ipcMain.handle('user:logout', async () => {
    try {
      return await userService.logout()
    } catch (error) {
      console.error('User Logout Error:', error)
      throw error
    }
  })
}

export function removeUserHandlers(): void {
  ipcMain.removeHandler('user:login')
  ipcMain.removeHandler('user:autoLogin')
  ipcMain.removeHandler('user:getUserId')
  ipcMain.removeHandler('user:logout')
}
