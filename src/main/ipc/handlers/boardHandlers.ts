import { ipcMain } from 'electron'
import { BoardService } from '../../services/board/BoardService'
import { Board, Node, NodeRelation, RelationType } from '../../services/board/types'

export function initBoardHandlers(boardService: BoardService, userId: string): void {
  removeBoardHandlers()
  // Board operations
  ipcMain.handle('board:create', async (_, boardData: Partial<Board>) => {
    try {
      return await boardService.createBoard({ ...boardData, userId })
    } catch (error) {
      console.error('Board Create Error:', error)
      throw error
    }
  })

  ipcMain.handle('board:get', async (_, id: string) => {
    try {
      return await boardService.getBoard(id)
    } catch (error) {
      console.error('Board Get Error:', error)
      throw error
    }
  })

  ipcMain.handle('board:update', async (_, id: string, updates) => {
    try {
      return await boardService.updateBoard(id, updates)
    } catch (error) {
      console.error('Board Update Error:', error)
      throw error
    }
  })

  ipcMain.handle('board:delete', async (_, id: string) => {
    try {
      return await boardService.deleteBoard(id)
    } catch (error) {
      console.error('Board Delete Error:', error)
      throw error
    }
  })

  // Node operations
  ipcMain.handle('node:create', async (_, boardId: string, nodeData: Partial<Node>) => {
    try {
      return await boardService.createNode(boardId, nodeData)
    } catch (error) {
      console.error('Node Create Error:', error)
      throw error
    }
  })

  ipcMain.handle('node:update', async (_, boardId: string, id: string, updates: Partial<Node>) => {
    try {
      return await boardService.updateNode(boardId, id, updates)
    } catch (error) {
      console.error('Node Update Error:', error)
      throw error
    }
  })

  ipcMain.handle('node:delete', async (_, boardId: string, id: string) => {
    try {
      return await boardService.deleteNode(boardId, id)
    } catch (error) {
      console.error('Node Delete Error:', error)
      throw error
    }
  })

  // Relation operations
  ipcMain.handle(
    'relation:create',
    async (_, boardId: string, sourceId: string, targetId: string, type: RelationType) => {
      try {
        return await boardService.createRelation(boardId, sourceId, targetId, type)
      } catch (error) {
        console.error('Relation Create Error:', error)
        throw error
      }
    }
  )

  ipcMain.handle(
    'relation:update',
    async (_, boardId: string, id: string, updates: Partial<NodeRelation>) => {
      try {
        return await boardService.updateRelation(boardId, id, updates)
      } catch (error) {
        console.error('Relation Update Error:', error)
        throw error
      }
    }
  )

  ipcMain.handle(
    'relation:delete',
    async (_, boardId: string, sourceId: string, targetId: string) => {
      try {
        return await boardService.deleteRelation(boardId, sourceId, targetId)
      } catch (error) {
        console.error('Relation Delete Error:', error)
        throw error
      }
    }
  )

  // Query operations
  ipcMain.handle('board:getUserBoards', async () => {
    try {
      return await boardService.getUserBoards(userId)
    } catch (error) {
      console.error('Get User Boards Error:', error)
      throw error
    }
  })

  ipcMain.handle('board:getNodes', async (_, boardId: string) => {
    try {
      return await boardService.getBoardNodes(boardId)
    } catch (error) {
      console.error('Get Board Nodes Error:', error)
      throw error
    }
  })

  ipcMain.handle('board:getRelations', async (_, boardId: string) => {
    try {
      return await boardService.getBoardRelations(boardId)
    } catch (error) {
      console.error('Get Board Relations Error:', error)
      throw error
    }
  })
}

export function removeBoardHandlers(): void {
  ipcMain.removeHandler('board:create')
  ipcMain.removeHandler('board:get')
  ipcMain.removeHandler('board:update')
  ipcMain.removeHandler('board:delete')
  ipcMain.removeHandler('node:create')
  ipcMain.removeHandler('node:update')
  ipcMain.removeHandler('node:delete')
  ipcMain.removeHandler('relation:create')
  ipcMain.removeHandler('relation:update')
  ipcMain.removeHandler('relation:delete')
}
