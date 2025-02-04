让我来总结一下这个项目的技术架构：

### 1. 整体架构

这是一个基于 Electron 的桌面应用程序，采用了主进程(Main Process)和渲染进程(Renderer Process)的架构模式。

### 2. 主进程 (Main Process)

- **核心服务层**：

  - `BoardService`: 节点管理服务

    - 核心功能：
      - 管理所有类型的节点（文件节点、文件夹节点、链接节点、功能节点、AI模型节点等）
      - 维护节点间的关系和层级结构
      - 节点的 CRUD 操作
      - 节点的查询和过滤
    - 数据模型：
      - `Board`: 画板模型
        - `id`: 画板唯一标识
        - `name`: 画板名称
        - `description`: 画板描述
        - `userId`: 所属用户ID
        - `shareSettings`: 画板共享设置
        - `createdAt`: 创建时间
        - `updatedAt`: 更新时间
      - `Node`: 基础节点接口
        - 新增 `userId`: 节点所属用户ID
        - 新增 `shareSettings`: 节点共享设置
        - 新增 `boardId`: 所属画板ID
      - `FileNode`: 文件类型节点
        - `DocumentNode`: 文档类型节点
        - `ImageNode`: 图片类型节点
        - `VideoNode`: 视频类型节点
        - `AudioNode`: 音频类型节点
      - `FolderNode`: 文件夹类型节点
      - `LinkNode`: 链接类型节点
        - `WebLinkNode`: 网页链接节点
        - `LocalLinkNode`: 本地文件链接节点
      - `FunctionNode`: 功能类型节点
        - `ToolNode`: 工具类节点
        - `PluginNode`: 插件类节点
      - `AIModelNode`: 大模型类型节点
        - `ChatModelNode`: 对话模型节点
        - `ImageModelNode`: 图像模型节点
      - `NodeRelation`: 节点关系模型
    - 用户数据绑定：
      - 所有节点都与用户账号关联
      - 支持多用户数据隔离
      - 提供节点共享机制

  - `FileService`: 文件服务

    - 核心功能：
      - 文件系统操作（读写、删除等）
      - 文件内容处理
      - 文件变更通知
    - 职责范围：
      - 仅负责文件系统层面的操作
      - 不直接管理节点关系
      - 与 BoardService 配合，提供文件相关信息
    - 用户数据绑定：
      - 文件存储路径按用户隔离
      - 支持用户间文件共享权限控制

  - `MetadataService`: 元数据服务

    - 核心功能：
      - 提取和管理各类型节点的元数据
      - 支持不同类型的元数据解析器
      - 元数据缓存管理
    - 数据模型：
      - `Metadata`: 基础元数据接口
      - `FileMetadata`: 文件元数据
      - `LinkMetadata`: 链接元数据
    - 用户数据绑定：
      - 元数据与用户账号关联
      - 缓存按用户隔离存储

  - `FileSystemWatcher`: 文件监听服务
    - 监听文件系统变化
    - 通知 BoardService 更新相关节点
    - 触发元数据更新

- **服务协作流程**：

  1. FileService 处理文件系统操作
  2. MetadataService 提取相关元数据
  3. BoardService 创建/更新节点并维护关系
  4. FileSystemWatcher 监听变化并触发更新流程

- **IPC 通信层**：
  - `boardHandlers`:
    - 节点操作相关接口
    - 节点查询和过滤
    - 节点关系管理
  - `fileHandlers`:
    - 基础文件操作
    - 文件内容读写
  - 示例接口：
    - `getNode(id: string): Promise<Node>`
    - `createFileNode(path: string): Promise<FileNode>`
    - `updateNodeRelation(nodeId: string, parentId: string): Promise<void>`

### 3. 渲染进程 (Renderer Process)

- **技术栈**：

  - Vue 3 作为前端框架
  - TypeScript 作为开发语言
  - Tailwind CSS 用于样式管理

- **组件设计**：
  - 通过 BoardService 接口获取节点信息
  - 展示节点内容和关系
  - 处理用户交互
  - 不直接进行文件操作

### 4. 通信机制

- 使用 Electron 的 IPC (进程间通信) 机制
- 通过 preload 脚本暴露安全的 API 给渲染进程
- 使用 contextBridge 确保安全的进程间通信

### 5. 数据存储

- 使用 SQLite 数据库进行本地数据存储
- 支持数据加密
- 采用 WAL 模式提升性能
- 数据所有权：
  - 数据库表设计包含 userId 字段
  - 实现多用户数据隔离
  - 支持用户数据导入导出
  - 提供数据迁移机制

### 6. 安全特性

- 使用 contextIsolation 隔离主进程和渲染进程
- 实现了安全的 IPC 通信机制
- 配置了 CSP (Content Security Policy)

### 7. 开发工具集成

- 使用 electron-toolkit 提供的工具和优化
- 集成了开发者工具
- 支持热重载等开发特性

这个架构设计清晰，职责分明，具有良好的可扩展性和可维护性。同时也注重了安全性和性能的考虑。
