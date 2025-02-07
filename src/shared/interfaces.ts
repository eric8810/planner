// Common interfaces used across main and renderer processes
export interface AppConfig {
  encryptionKey: string
  dbPath: string
}
// File Operation Types
export interface FileOperation {
  path: string
  content?: string
}

export interface ApiResponse {
  success: boolean
  data?: any
  error?: string
}

// User Types
export interface UserInfo {
  id: string
  username: string
  email: string
  avatar: string
}

// Position Types
export interface Position {
  x: number
  y: number
}

// Node Types
export enum NodeType {
  FILE = 'file',
  FOLDER = 'folder',
  LINK = 'link',
  FUNCTION = 'function',
  AI_MODEL = 'ai_model'
}

export enum FileType {
  DOCUMENT = 'document',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  OTHER = 'other'
}

export enum LinkType {
  WEB = 'web',
  LOCAL = 'local'
}

export enum FunctionType {
  TOOL = 'tool',
  PLUGIN = 'plugin'
}

export enum AIModelType {
  CHAT = 'chat',
  IMAGE = 'image'
}

export enum RelationType {
  FORWARD = 'forward',
  BACKWARD = 'backward',
  BIDIRECTIONAL = 'bidirectional'
}

export enum ShareSettings {
  PRIVATE = 'private',
  PUBLIC = 'public',
  SHARED = 'shared'
}

// Node Interfaces
export interface Node {
  id: string
  type: NodeType
  name: string
  description?: string
  userId: string
  boardId: string
  shareSettings: ShareSettings
  position: Position
  data?: any
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, any>
}

// Specialized Node Types
export interface FileNode extends Node {
  type: NodeType.FILE
  fileType: FileType
  path: string
  size: number
  mimeType: string
}

export interface FolderNode extends Node {
  type: NodeType.FOLDER
  path: string
}

export interface LinkNode extends Node {
  type: NodeType.LINK
  linkType: LinkType
  url: string
}

export interface FunctionNode extends Node {
  type: NodeType.FUNCTION
  functionType: FunctionType
  config: Record<string, any>
}

export interface AIModelNode extends Node {
  type: NodeType.AI_MODEL
  modelType: AIModelType
  provider: string
  config: Record<string, any>
}

// Board Types
export interface Board {
  id: string
  name: string
  description: string
  userId: string
  shareSettings: ShareSettings
  nodes: Map<string, Node>
  relations: Map<string, NodeRelation[]>
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, any>
}

// Relation Types
export interface NodeRelation {
  id: string
  boardId: string
  sourceId: string
  targetId: string
  type: RelationType
  definition?: RelationDefinition
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, any>
}

export interface RelationDefinition {
  description: string
  semanticType?: string
  strength?: number
  properties?: Record<string, any>
}

// LLM Types
export type LLMProvider = 'openai' | 'anthropic' | 'deepseek' | string

export interface LLMOptions {
  provider: string
  model: string
  stream?: boolean
}

export interface LLMConfig {
  id: string
  user_id: string
  name: string
  provider: string
  base_url: string | null
  api_key: string | null
  model: string
  temperature: number | null
  max_tokens: number | null
  created_at: string
  updated_at: string
}

export type ChatCompletionMessageParam = {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// Service Interfaces
export interface ApiService {
  get<T>(url: string, params?: object): Promise<T>
  post<T>(url: string, data?: object): Promise<T>
}

export interface BoardService {
  createBoard(boardData: Partial<Board>): Promise<Board>
  getBoard(id: string): Promise<Board>
  updateBoard(id: string, updates: Partial<Board>): Promise<Board>
  deleteBoard(id: string): Promise<boolean>
  createNode(boardId: string, nodeData: Partial<Node>): Promise<Node>
  updateNode(boardId: string, id: string, updates: Partial<Node>): Promise<Node>
  deleteNode(boardId: string, id: string): Promise<boolean>
  createRelation(
    boardId: string,
    sourceId: string,
    targetId: string,
    type: RelationType
  ): Promise<NodeRelation>
  updateRelation(boardId: string, id: string, updates: Partial<NodeRelation>): Promise<NodeRelation>
  deleteRelation(boardId: string, sourceId: string, targetId: string): Promise<boolean>
  getUserBoards(userId: string): Promise<Board[]>
  getBoardNodes(boardId: string): Promise<Node[]>
  getBoardRelations(boardId: string): Promise<NodeRelation[]>
}

export interface FileService {
  readFile(path: string): Promise<string>
  writeFile(operation: FileOperation): Promise<void>
}

export interface LLMService {
  chat(messages: ChatCompletionMessageParam[], options: LLMOptions): Promise<string>
  completion(prompt: string, options: LLMOptions): Promise<string>
}

export interface UserService {
  login(token: string): Promise<string>
  autoLogin(): Promise<boolean>
  getUserId(): Promise<string>
  logout(): Promise<void>
}

export interface ConfigService {
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

// IPC Channel names as constants
export const IPC_CHANNELS = {
  FILE: {
    READ: 'file:read',
    WRITE: 'file:write',
    DELETE: 'file:delete'
  },
  API: {
    GET: 'api:get',
    POST: 'api:post'
  },
  BOARD: {
    CREATE: 'board:create',
    GET: 'board:get',
    UPDATE: 'board:update',
    DELETE: 'board:delete',
    GET_USER_BOARDS: 'board:getUserBoards',
    GET_NODES: 'board:getNodes',
    GET_RELATIONS: 'board:getRelations'
  },
  NODE: {
    CREATE: 'node:create',
    UPDATE: 'node:update',
    DELETE: 'node:delete'
  },
  RELATION: {
    CREATE: 'relation:create',
    UPDATE: 'relation:update',
    DELETE: 'relation:delete'
  },
  CONFIG: {
    GET_USER_LLM: 'config:getUserLLMConfig',
    UPDATE_USER_LLM: 'config:updateUserLLMConfig',
    GET_APP: 'config:getAppConfig',
    UPDATE_APP: 'config:updateAppConfig',
    CLEAR: 'config:clear'
  },
  LLM: {
    CHAT: 'llm:chat',
    COMPLETION: 'llm:completion'
  },
  USER: {
    LOGIN: 'user:login',
    AUTO_LOGIN: 'user:autoLogin',
    GET_USER_ID: 'user:getUserId',
    LOGOUT: 'user:logout'
  }
} as const

// Type for all IPC channel strings
export type IpcChannel =
  (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS][keyof (typeof IPC_CHANNELS)[keyof typeof IPC_CHANNELS]]
