import { ElectronAPI } from '@electron-toolkit/preload'
import type {
  FileOperation,
  ApiResponse,
  Board,
  Node,
  NodeRelation,
  RelationType,
  LLMConfig,
  ChatCompletionMessageParam,
  LLMOptions,
  AppConfig
} from '../shared/interfaces'

declare global {
  interface Window {
    electron: ElectronAPI
    mainService: {
      file: {
        // File operations
        readFile(path: string): Promise<string>
        writeFile(operation: FileOperation): Promise<void>
        deleteFile(path: string): Promise<void>
      }
      api: {
        // API operations
        apiGet<T>(url: string, params?: object): Promise<T>
        apiPost<T>(url: string, data?: object): Promise<T>
      }
      board: {
        // Board operations
        createBoard(boardData: Partial<Board>): Promise<Board>
        getBoard(id: string): Promise<Board>
        updateBoard(id: string, updates: Partial<Board>): Promise<Board>
        deleteBoard(id: string): Promise<boolean>
        getUserBoards(userId: string): Promise<Board[]>
        getBoardNodes(boardId: string): Promise<Node[]>
        getBoardRelations(boardId: string): Promise<NodeRelation[]>

        // Node operations
        createNode(boardId: string, nodeData: Partial<Node>): Promise<Node>
        updateNode(id: string, updates: Partial<Node>): Promise<Node>
        deleteNode(id: string): Promise<boolean>

        // Relation operations
        createRelation(
          boardId: string,
          sourceId: string,
          targetId: string,
          type: RelationType
        ): Promise<NodeRelation>
        updateRelation(id: string, updates: Partial<NodeRelation>): Promise<NodeRelation>
        deleteRelation(sourceId: string, targetId: string): Promise<boolean>
      }
      config: {
        // Config operations
        getUserLLMConfig(userId: string, provider: string, model: string): Promise<LLMConfig>
        updateUserLLMConfig(
          userId: string,
          provider: string,
          model: string,
          config: LLMConfig
        ): Promise<void>
        getAppConfig(): Promise<AppConfig>
        updateAppConfig(config: Partial<AppConfig>): Promise<void>
        clearConfig(): Promise<void>
      }
      llm: {
        // LLM operations
        chat(messages: ChatCompletionMessageParam[], options: LLMOptions): Promise<string>
        completion(prompt: string, options: LLMOptions): Promise<string>
      }
      user: {
        // User operations
        login(token: string): Promise<boolean>
        autoLogin(): Promise<boolean>
        getUserId(): Promise<string>
        logout(): Promise<void>
      }
    }
  }
}
