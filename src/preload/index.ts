import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import {
  FileOperation,
  IPC_CHANNELS,
  Board,
  Node,
  NodeRelation,
  RelationType,
  LLMConfig,
  ChatCompletionMessageParam,
  LLMOptions,
  AppConfig
} from '../shared/interfaces'

// Custom APIs for renderer
const mainService = {
  file: {
    readFile: (path: string) => ipcRenderer.invoke(IPC_CHANNELS.FILE.READ, path),
    writeFile: (operation: FileOperation) => ipcRenderer.invoke(IPC_CHANNELS.FILE.WRITE, operation),
    deleteFile: (path: string) => ipcRenderer.invoke(IPC_CHANNELS.FILE.DELETE, path)
  },

  api: {
    apiGet: (url: string, params?: object) => ipcRenderer.invoke(IPC_CHANNELS.API.GET, url, params),
    apiPost: (url: string, data?: object) => ipcRenderer.invoke(IPC_CHANNELS.API.POST, url, data)
  },

  board: {
    createBoard: (boardData: Partial<Board>) =>
      ipcRenderer.invoke(IPC_CHANNELS.BOARD.CREATE, boardData),
    getBoard: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.BOARD.GET, id),
    updateBoard: (id: string, updates: Partial<Board>) =>
      ipcRenderer.invoke(IPC_CHANNELS.BOARD.UPDATE, id, updates),
    deleteBoard: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.BOARD.DELETE, id),
    getUserBoards: (userId: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.BOARD.GET_USER_BOARDS, userId),
    getBoardNodes: (boardId: string) => ipcRenderer.invoke(IPC_CHANNELS.BOARD.GET_NODES, boardId),
    getBoardRelations: (boardId: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.BOARD.GET_RELATIONS, boardId),

    createNode: (boardId: string, nodeData: Partial<Node>) =>
      ipcRenderer.invoke(IPC_CHANNELS.NODE.CREATE, boardId, nodeData),
    updateNode: (id: string, updates: Partial<Node>) =>
      ipcRenderer.invoke(IPC_CHANNELS.NODE.UPDATE, id, updates),
    deleteNode: (id: string) => ipcRenderer.invoke(IPC_CHANNELS.NODE.DELETE, id),

    createRelation: (boardId: string, sourceId: string, targetId: string, type: RelationType) =>
      ipcRenderer.invoke(IPC_CHANNELS.RELATION.CREATE, boardId, sourceId, targetId, type),
    updateRelation: (id: string, updates: Partial<NodeRelation>) =>
      ipcRenderer.invoke(IPC_CHANNELS.RELATION.UPDATE, id, updates),
    deleteRelation: (sourceId: string, targetId: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.RELATION.DELETE, sourceId, targetId)
  },

  config: {
    getUserLLMConfig: (userId: string, provider: string, model: string) =>
      ipcRenderer.invoke(IPC_CHANNELS.CONFIG.GET_USER_LLM, userId, provider, model),
    updateUserLLMConfig: (userId: string, provider: string, model: string, config: LLMConfig) =>
      ipcRenderer.invoke(IPC_CHANNELS.CONFIG.UPDATE_USER_LLM, userId, provider, model, config),
    getAppConfig: () => ipcRenderer.invoke(IPC_CHANNELS.CONFIG.GET_APP),
    updateAppConfig: (config: Partial<AppConfig>) =>
      ipcRenderer.invoke(IPC_CHANNELS.CONFIG.UPDATE_APP, config),
    clearConfig: () => ipcRenderer.invoke(IPC_CHANNELS.CONFIG.CLEAR)
  },

  llm: {
    chat: (messages: ChatCompletionMessageParam[], options: LLMOptions) =>
      ipcRenderer.invoke(IPC_CHANNELS.LLM.CHAT, messages, options),
    completion: (prompt: string, options: LLMOptions) =>
      ipcRenderer.invoke(IPC_CHANNELS.LLM.COMPLETION, prompt, options)
  },

  user: {
    login: (token: string) => ipcRenderer.invoke(IPC_CHANNELS.USER.LOGIN, token),
    autoLogin: () => ipcRenderer.invoke(IPC_CHANNELS.USER.AUTO_LOGIN),
    getUserId: () => ipcRenderer.invoke(IPC_CHANNELS.USER.GET_USER_ID),
    logout: () => ipcRenderer.invoke(IPC_CHANNELS.USER.LOGOUT)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('mainService', mainService)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.mainService = mainService
}
