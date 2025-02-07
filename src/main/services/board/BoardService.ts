import {
  Node,
  FileNode,
  FolderNode,
  LinkNode,
  FunctionNode,
  AIModelNode,
  NodeRelation,
  NodeType,
  RelationType,
  Board,
  ShareSettings
} from './types'
import { EventEmitter } from 'events'
import Database from 'better-sqlite3-multiple-ciphers'
import path from 'path'
import { app } from 'electron'
import fs from 'fs'

export class BoardService extends EventEmitter {
  private db!: Database.Database
  private boards: Map<string, Board>
  private static readonly ENCRYPTION_KEY = 'your-secret-key-here'
  private static readonly CURRENT_DB_VERSION = 1

  constructor() {
    super()
    this.boards = new Map()
    this.initializeDatabase()
  }

  private initializeDatabase() {
    const dbPath = path.join(app.getPath('userData'), 'boards.sqlite')
    const isNewDb = !this.isDatabaseExists(dbPath)
    this.db = new Database(dbPath)

    // Enable encryption
    this.db.pragma(`key='${BoardService.ENCRYPTION_KEY}'`)
    // Enable WAL mode for better performance
    this.db.pragma('journal_mode = WAL')

    if (isNewDb) {
      this.createInitialSchema()
    } else {
      this.handleDatabaseMigration()
    }
  }

  private isDatabaseExists(dbPath: string): boolean {
    try {
      return fs.existsSync(dbPath)
    } catch (error) {
      console.error('Error checking database existence:', error)
      return false
    }
  }

  private createInitialSchema() {
    // Create version tracking table first
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS db_version (
        version INTEGER PRIMARY KEY,
        updated_at TEXT NOT NULL
      );
      INSERT INTO db_version (version, updated_at) VALUES (${BoardService.CURRENT_DB_VERSION}, datetime('now'));
    `)

    // Create application tables
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS boards (
        id TEXT PRIMARY KEY,
        userId TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        shareSettings TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS nodes (
        id TEXT PRIMARY KEY,
        boardId TEXT NOT NULL,
        userId TEXT NOT NULL,
        type TEXT NOT NULL,
        name TEXT NOT NULL,
        shareSettings TEXT NOT NULL,
        position TEXT NOT NULL,
        data TEXT,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (boardId) REFERENCES boards(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS relations (
        id TEXT PRIMARY KEY,
        boardId TEXT NOT NULL,
        sourceId TEXT NOT NULL,
        targetId TEXT NOT NULL,
        type TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL,
        FOREIGN KEY (boardId) REFERENCES boards(id) ON DELETE CASCADE,
        FOREIGN KEY (sourceId) REFERENCES nodes(id) ON DELETE CASCADE,
        FOREIGN KEY (targetId) REFERENCES nodes(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_boards_userId ON boards(userId);
      CREATE INDEX IF NOT EXISTS idx_nodes_boardId ON nodes(boardId);
      CREATE INDEX IF NOT EXISTS idx_relations_boardId ON relations(boardId);
    `)
  }

  private handleDatabaseMigration() {
    const currentVersion = this.getCurrentDatabaseVersion()

    if (currentVersion < BoardService.CURRENT_DB_VERSION) {
      // Start a transaction for the migration
      this.db.exec('BEGIN TRANSACTION;')

      try {
        // Apply migrations sequentially
        for (
          let version = currentVersion + 1;
          version <= BoardService.CURRENT_DB_VERSION;
          version++
        ) {
          this.applyMigration(version)
        }

        // Update the database version
        this.db
          .prepare(
            'INSERT OR REPLACE INTO db_version (version, updated_at) VALUES (?, datetime("now"))'
          )
          .run(BoardService.CURRENT_DB_VERSION)

        this.db.exec('COMMIT;')
      } catch (error) {
        this.db.exec('ROLLBACK;')
        console.error('Database migration failed:', error)
        throw error
      }
    }
  }

  private getCurrentDatabaseVersion(): number {
    try {
      const row = this.db
        .prepare('SELECT version FROM db_version ORDER BY version DESC LIMIT 1')
        .get()
      return row ? (row as any).version : 0
    } catch (error) {
      // If the version table doesn't exist, assume version 0
      return 0
    }
  }

  private applyMigration(version: number) {
    // Add migration logic for each version
    switch (version) {
      case 1:
        // Migration for version 1 (initial schema) - no need to do anything as it's created in createInitialSchema
        break
      // Add future migrations here
      // case 2:
      //   this.db.exec(`ALTER TABLE nodes ADD COLUMN new_column TEXT;`)
      //   break
      default:
        throw new Error(`Unknown database version: ${version}`)
    }
  }

  // Board management
  async createBoard(boardData: Partial<Board>): Promise<Board> {
    if (!boardData.userId) {
      throw new Error('User ID is required')
    }

    const board: Board = {
      id: crypto.randomUUID(),
      name: 'Untitled Board',
      description: '',
      userId: boardData.userId,
      shareSettings: ShareSettings.PRIVATE,
      nodes: new Map(),
      relations: new Map(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...boardData
    }

    this.db
      .prepare(
        `
      INSERT INTO boards (id, userId, name, description, shareSettings, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
      )
      .run(
        board.id,
        board.userId,
        board.name,
        board.description,
        board.shareSettings,
        board.createdAt.toISOString(),
        board.updatedAt.toISOString()
      )

    this.boards.set(board.id, board)
    this.emit('boardCreated', board)
    return board
  }

  async getBoard(id: string): Promise<Board | null> {
    const boardRow = this.db.prepare('SELECT * FROM boards WHERE id = ?').get(id) as any

    if (!boardRow) return null

    const nodesRows = this.db.prepare('SELECT * FROM nodes WHERE boardId = ?').all(id) as any[]

    const relationsRows = this.db
      .prepare('SELECT * FROM relations WHERE boardId = ?')
      .all(id) as any[]

    const nodes = new Map()
    const relations = new Map()

    nodesRows.forEach((row) => {
      nodes.set(row.id, {
        ...row,
        position: JSON.parse(row.position),
        data: row.data ? JSON.parse(row.data) : undefined,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt)
      })
    })

    relationsRows.forEach((row) => {
      const sourceRelations = relations.get(row.sourceId) || []
      sourceRelations.push({
        ...row,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt)
      })
      relations.set(row.sourceId, sourceRelations)
    })

    const board: Board = {
      ...boardRow,
      nodes,
      relations,
      createdAt: new Date(boardRow.createdAt),
      updatedAt: new Date(boardRow.updatedAt)
    }

    this.boards.set(board.id, board)
    return board
  }

  async updateBoard(id: string, updates: Partial<Board>): Promise<Board | null> {
    const board = await this.getBoard(id)
    if (!board) return null

    const updatedBoard = {
      ...board,
      ...updates,
      updatedAt: new Date()
    }

    this.db
      .prepare(
        `
      UPDATE boards 
      SET name = ?, description = ?, shareSettings = ?, updatedAt = ?
      WHERE id = ?
    `
      )
      .run(
        updatedBoard.name,
        updatedBoard.description,
        updatedBoard.shareSettings,
        updatedBoard.updatedAt.toISOString(),
        id
      )

    this.boards.set(id, updatedBoard)
    this.emit('boardUpdated', updatedBoard)
    return updatedBoard
  }

  async deleteBoard(id: string): Promise<boolean> {
    const result = this.db.prepare('DELETE FROM boards WHERE id = ?').run(id)
    const deleted = result.changes > 0

    if (deleted) {
      this.boards.delete(id)
      this.emit('boardDeleted', id)
    }
    return deleted
  }

  // Node CRUD operations
  async createNode(boardId: string, nodeData: Partial<Node>): Promise<Node> {
    const board = await this.getBoard(boardId)
    if (!board) {
      throw new Error('Board not found')
    }

    const node: Node = {
      id: crypto.randomUUID(),
      type: nodeData.type || NodeType.FILE,
      name: nodeData.name || 'Untitled',
      userId: board.userId,
      boardId: board.id,
      shareSettings: ShareSettings.PRIVATE,
      position: nodeData.position || { x: 0, y: 0 },
      createdAt: new Date(),
      updatedAt: new Date(),
      ...nodeData
    }

    this.db
      .prepare(
        `
      INSERT INTO nodes (
        id, boardId, userId, type, name, shareSettings, position, data, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
      )
      .run(
        node.id,
        node.boardId,
        node.userId,
        node.type,
        node.name,
        node.shareSettings,
        JSON.stringify(node.position),
        node.data ? JSON.stringify(node.data) : null,
        node.createdAt.toISOString(),
        node.updatedAt.toISOString()
      )

    board.nodes.set(node.id, node)
    this.emit('nodeCreated', { boardId, node })
    return node
  }

  async getNode(boardId: string, id: string): Promise<Node | null> {
    const nodeRow = this.db
      .prepare('SELECT * FROM nodes WHERE id = ? and boardId = ?')
      .get(id, boardId) as any

    if (!nodeRow) return null

    return {
      ...nodeRow,
      position: JSON.parse(nodeRow.position),
      data: nodeRow.data ? JSON.parse(nodeRow.data) : undefined,
      createdAt: new Date(nodeRow.createdAt),
      updatedAt: new Date(nodeRow.updatedAt)
    }
  }

  async updateNode(boardId: string, id: string, updates: Partial<Node>): Promise<Node | null> {
    const node = await this.getNode(boardId, id)
    if (!node) return null

    const updatedNode = {
      ...node,
      ...updates,
      updatedAt: new Date()
    }

    this.db
      .prepare(
        `
      UPDATE nodes 
      SET name = ?, type = ?, shareSettings = ?, position = ?, data = ?, updatedAt = ?
      WHERE id = ?
    `
      )
      .run(
        updatedNode.name,
        updatedNode.type,
        updatedNode.shareSettings,
        JSON.stringify(updatedNode.position),
        updatedNode.data ? JSON.stringify(updatedNode.data) : null,
        updatedNode.updatedAt.toISOString(),
        id
      )

    const board = await this.getBoard(updatedNode.boardId)
    if (board) {
      board.nodes.set(id, updatedNode)
    }

    this.emit('nodeUpdated', updatedNode)
    return updatedNode
  }

  async deleteNode(boardId: string, id: string): Promise<boolean> {
    const node = await this.getNode(boardId, id)
    if (!node) return false

    const result = this.db.prepare('DELETE FROM nodes WHERE id = ?').run(id)
    const deleted = result.changes > 0

    if (deleted) {
      const board = await this.getBoard(node.boardId)
      if (board) {
        board.nodes.delete(id)
      }
      this.emit('nodeDeleted', id)
    }
    return deleted
  }

  // Relation management
  async createRelation(
    boardId: string,
    sourceId: string,
    targetId: string,
    type: RelationType
  ): Promise<NodeRelation> {
    const board = await this.getBoard(boardId)
    if (!board) {
      throw new Error('Board not found')
    }

    const sourceNode = await this.getNode(boardId, sourceId)
    const targetNode = await this.getNode(boardId, targetId)
    if (!sourceNode || !targetNode) {
      throw new Error('Source node or target node not found')
    }

    const relation: NodeRelation = {
      id: crypto.randomUUID(),
      boardId,
      sourceId,
      targetId,
      type,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.db
      .prepare(
        `
      INSERT INTO relations (id, boardId, sourceId, targetId, type, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `
      )
      .run(
        relation.id,
        relation.boardId,
        relation.sourceId,
        relation.targetId,
        relation.type,
        relation.createdAt.toISOString(),
        relation.updatedAt.toISOString()
      )

    const nodeRelations = board.relations.get(sourceId) || []
    nodeRelations.push(relation)
    board.relations.set(sourceId, nodeRelations)

    this.emit('relationCreated', { boardId, relation })
    return relation
  }

  async deleteRelation(boardId: string, sourceId: string, targetId: string): Promise<boolean> {
    const result = this.db
      .prepare('DELETE FROM relations WHERE sourceId = ? AND targetId = ? AND boardId = ?')
      .run(sourceId, targetId, boardId)
    const deleted = result.changes > 0

    if (deleted) {
      const board = this.boards.get(boardId)
      if (board) {
        const nodeRelations = board.relations.get(sourceId) || []
        const filteredRelations = nodeRelations.filter((r) => r.targetId !== targetId)
        board.relations.set(sourceId, filteredRelations)
      }
      this.emit('relationDeleted', { boardId, sourceId, targetId })
    }
    return deleted
  }

  async updateRelation(
    boardId: string,
    id: string,
    updates: Partial<NodeRelation>
  ): Promise<NodeRelation | null> {
    const relationRow = this.db
      .prepare('SELECT * FROM relations WHERE id = ? and boardId = ?')
      .get(id, boardId) as any

    if (!relationRow) return null

    // Verify that the new source and target nodes exist if they're being updated
    if (updates.sourceId) {
      const sourceNode = await this.getNode(boardId, updates.sourceId)
      if (!sourceNode) throw new Error('Source node not found')
    }
    if (updates.targetId) {
      const targetNode = await this.getNode(boardId, updates.targetId)
      if (!targetNode) throw new Error('Target node not found')
    }

    const updatedRelation = {
      ...relationRow,
      ...updates,
      updatedAt: new Date()
    }

    this.db
      .prepare(
        `
      UPDATE relations 
      SET sourceId = ?, targetId = ?, type = ?, updatedAt = ?
      WHERE id = ? AND boardId = ?
    `
      )
      .run(
        updatedRelation.sourceId,
        updatedRelation.targetId,
        updatedRelation.type,
        updatedRelation.updatedAt.toISOString(),
        id,
        boardId
      )

    const board = this.boards.get(boardId)
    if (board) {
      // Remove the relation from the old source's relations list
      if (updates.sourceId && relationRow.sourceId !== updates.sourceId) {
        const oldSourceRelations = board.relations.get(relationRow.sourceId) || []
        const filteredRelations = oldSourceRelations.filter((r) => r.id !== id)
        board.relations.set(relationRow.sourceId, filteredRelations)
      }

      // Add/Update the relation in the new/current source's relations list
      const nodeRelations = board.relations.get(updatedRelation.sourceId) || []
      const relationIndex = nodeRelations.findIndex((r) => r.id === id)
      if (relationIndex !== -1) {
        nodeRelations[relationIndex] = updatedRelation
      } else {
        nodeRelations.push(updatedRelation)
      }
      board.relations.set(updatedRelation.sourceId, nodeRelations)
    }

    this.emit('relationUpdated', updatedRelation)
    return updatedRelation
  }

  // User-specific operations
  async getUserBoards(userId: string): Promise<Board[]> {
    const boardRows = this.db.prepare('SELECT * FROM boards WHERE userId = ?').all(userId) as any[]

    const boards: Board[] = []
    for (const boardRow of boardRows) {
      const board = await this.getBoard(boardRow.id)
      if (board) {
        boards.push(board)
      }
    }
    return boards
  }

  async getBoardNodes(boardId: string): Promise<Node[]> {
    const nodesRows = this.db.prepare('SELECT * FROM nodes WHERE boardId = ?').all(boardId) as any[]

    return nodesRows.map((row) => ({
      ...row,
      position: JSON.parse(row.position),
      data: row.data ? JSON.parse(row.data) : undefined,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    }))
  }

  async getBoardRelations(boardId: string): Promise<NodeRelation[]> {
    const relationsRows = this.db
      .prepare('SELECT * FROM relations WHERE boardId = ?')
      .all(boardId) as any[]

    return relationsRows.map((row) => ({
      ...row,
      createdAt: new Date(row.createdAt),
      updatedAt: new Date(row.updatedAt)
    }))
  }

  // Add this method to close the database connection
  public close(): void {
    if (this.db) {
      this.db.close()
    }
  }
}
