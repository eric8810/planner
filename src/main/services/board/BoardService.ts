import {
  Node,
  FileNode,
  FolderNode,
  LinkNode,
  FunctionNode,
  AIModelNode,
  NodeRelation,
  NodeType,
  RelationType
} from './types'
import { EventEmitter } from 'events'

export class BoardService extends EventEmitter {
  private nodes: Map<string, Node>
  private relations: Map<string, NodeRelation[]>

  constructor() {
    super()
    this.nodes = new Map()
    this.relations = new Map()
  }

  // Node CRUD operations
  async createNode(nodeData: Partial<Node>): Promise<Node> {
    const node: Node = {
      id: crypto.randomUUID(),
      type: NodeType.FILE,
      name: 'Untitled',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...nodeData
    }

    this.nodes.set(node.id, node)
    this.emit('nodeCreated', node)
    return node
  }

  async getNode(id: string): Promise<Node | null> {
    return this.nodes.get(id) || null
  }

  async updateNode(id: string, updates: Partial<Node>): Promise<Node | null> {
    const node = this.nodes.get(id)
    if (!node) return null

    const updatedNode = {
      ...node,
      ...updates,
      updatedAt: new Date()
    }

    this.nodes.set(id, updatedNode)
    this.emit('nodeUpdated', updatedNode)
    return updatedNode
  }

  async deleteNode(id: string): Promise<boolean> {
    const deleted = this.nodes.delete(id)
    if (deleted) {
      // Clean up relations
      this.relations.delete(id)
      this.relations.forEach((relations, nodeId) => {
        this.relations.set(
          nodeId,
          relations.filter((r) => r.targetId !== id)
        )
      })
      this.emit('nodeDeleted', id)
    }
    return deleted
  }

  // Relation management
  async createRelation(
    sourceId: string,
    targetId: string,
    type: RelationType
  ): Promise<NodeRelation> {
    const relation: NodeRelation = {
      sourceId,
      targetId,
      type,
      createdAt: new Date()
    }

    const nodeRelations = this.relations.get(sourceId) || []
    nodeRelations.push(relation)
    this.relations.set(sourceId, nodeRelations)

    this.emit('relationCreated', relation)
    return relation
  }

  async getNodeRelations(nodeId: string): Promise<NodeRelation[]> {
    return this.relations.get(nodeId) || []
  }

  async deleteRelation(sourceId: string, targetId: string): Promise<boolean> {
    const nodeRelations = this.relations.get(sourceId)
    if (!nodeRelations) return false

    const filteredRelations = nodeRelations.filter((r) => r.targetId !== targetId)
    this.relations.set(sourceId, filteredRelations)

    this.emit('relationDeleted', { sourceId, targetId })
    return true
  }

  // Query and filter operations
  async searchNodes(query: string): Promise<Node[]> {
    const results: Node[] = []
    for (const node of this.nodes.values()) {
      if (this.nodeMatchesQuery(node, query)) {
        results.push(node)
      }
    }
    return results
  }

  async getChildNodes(parentId: string): Promise<Node[]> {
    const relations = this.relations.get(parentId) || []
    return relations
      .filter((r) => r.type === 'parent-child')
      .map((r) => this.nodes.get(r.targetId))
      .filter((node): node is Node => node !== undefined)
  }

  private nodeMatchesQuery(node: Node, query: string): boolean {
    const searchStr = JSON.stringify(node).toLowerCase()
    return searchStr.includes(query.toLowerCase())
  }
}
