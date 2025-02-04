import { UserInfo } from './types'
import { BoardService } from '../board/BoardService'
// import { initBoardHandlers } from '@/ipc/handlers/boardHandlers'
import { ConfigService } from '../config/ConfigService'
import { initBoardHandlers } from '../../ipc/handlers/boardHandlers'

export class UserService {
  userId?: string
  token?: string
  userInfo?: UserInfo
  boardService: BoardService
  configService: ConfigService
  constructor(boardService: BoardService, configService: ConfigService) {
    this.boardService = boardService
    this.configService = configService
  }

  async login(token: string) {
    // TODO: Implement login logic with API call
    this.token = token
    this.userId = token
    this.initHandlers()
    return this.userId
  }

  async autoLogin() {
    // TODO: Implement auto login logic
    this.token = '123'
    this.userId = '123'
    this.userInfo = {
      id: '123',
      username: '123',
      email: '123',
      avatar: '123'
    }
    this.initHandlers()
    return this.userId
  }

  async getUserId() {
    // TODO: Implement session verification logic
    return this.userId
  }

  async getUserInfo() {
    // TODO: Implement session verification logic
    return this.getUserInfo
  }

  async logout() {
    // TODO: Implement logout logic
    this.token = undefined
    this.userId = undefined
    this.userInfo = undefined
    return true
  }

  initHandlers() {
    if (this.userId) {
      initBoardHandlers(this.boardService, this.userId)
    }
  }
}
