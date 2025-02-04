// Base Node interface
export interface Node {
  id: string
  type: NodeType
  name: string
  description?: string
  userId: string
  boardId: string
  shareSettings: ShareSettings
  position: Position
  data?: any // Added to support storing additional node-specific data
  createdAt: Date
  updatedAt: Date
  metadata?: Record<string, any>
}

// Add Position interface
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

// File Node Types
export interface FileNode extends Node {
  type: NodeType.FILE
  fileType: FileType
  path: string
  size: number
  mimeType: string
}

export enum FileType {
  DOCUMENT = 'document',
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  OTHER = 'other'
}

// Folder Node
export interface FolderNode extends Node {
  type: NodeType.FOLDER
  path: string
}

// Link Node Types
export interface LinkNode extends Node {
  type: NodeType.LINK
  linkType: LinkType
  url: string
}

export enum LinkType {
  WEB = 'web',
  LOCAL = 'local'
}

// Function Node Types
export interface FunctionNode extends Node {
  type: NodeType.FUNCTION
  functionType: FunctionType
  config: Record<string, any>
}

export enum FunctionType {
  TOOL = 'tool',
  PLUGIN = 'plugin'
}

// AI Model Node Types
export interface AIModelNode extends Node {
  type: NodeType.AI_MODEL
  modelType: AIModelType
  provider: string
  config: Record<string, any>
}

export enum AIModelType {
  CHAT = 'chat',
  IMAGE = 'image'
}

// Node Relations
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

export enum RelationType {
  FORWARD = 'forward',
  BACKWARD = 'backward',
  BIDIRECTIONAL = 'bidirectional'
}

// Specialized Node Types
export interface DocumentNode extends FileNode {
  fileType: FileType.DOCUMENT
  format: string // pdf, md, doc, etc.
}

export interface ImageNode extends FileNode {
  fileType: FileType.IMAGE
  dimensions?: {
    width: number
    height: number
  }
}

export interface VideoNode extends FileNode {
  fileType: FileType.VIDEO
  duration?: number
}

export interface AudioNode extends FileNode {
  fileType: FileType.AUDIO
  duration?: number
}

export interface WebLinkNode extends LinkNode {
  linkType: LinkType.WEB
  title?: string
  favicon?: string
}

export interface LocalLinkNode extends LinkNode {
  linkType: LinkType.LOCAL
  targetPath: string
}

export interface ToolNode extends FunctionNode {
  functionType: FunctionType.TOOL
  command: string
  args?: string[]
}

export interface PluginNode extends FunctionNode {
  functionType: FunctionType.PLUGIN
  entryPoint: string
  version: string
}

export interface ChatModelNode extends AIModelNode {
  modelType: AIModelType.CHAT
  maxTokens?: number
  temperature?: number
}

export interface ImageModelNode extends AIModelNode {
  modelType: AIModelType.IMAGE
  supportedSizes: string[]
  supportedFormats: string[]
}

// Board related types
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

export enum ShareSettings {
  PRIVATE = 'private',
  PUBLIC = 'public',
  SHARED = 'shared' // For specific users/groups
}
