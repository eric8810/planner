import Database from 'better-sqlite3-multiple-ciphers'
import path from 'path'
import { app } from 'electron'
import fs from 'fs'
import { AppConfig, LLMConfig } from '@shared/interfaces'

export interface ConfigRow {
  key: string
  value: string
}

interface SchemaVersionRow {
  version: number
}

export class ConfigService {
  private db: Database.Database
  private configCache: Map<string, any> = new Map()
  private static readonly ENCRYPTION_KEY = 'your-secret-key-here'
  private static readonly CURRENT_SCHEMA_VERSION = 1
  private static readonly APP_CONFIG_KEY = 'app_config'

  constructor() {
    const dbPath = path.join(app.getPath('userData'), 'config.sqlite')
    console.log('dbPath', dbPath)
    const isNewDb = !fs.existsSync(dbPath)
    this.db = new Database(dbPath)

    // Enable encryption
    this.db.pragma(`key='${ConfigService.ENCRYPTION_KEY}'`)
    this.db.pragma('journal_mode = WAL')

    if (isNewDb) {
      this.initializeDatabase()
    } else {
      this.migrateIfNeeded()
    }
  }

  private initializeDatabase(): void {
    this.db.exec(`
      CREATE TABLE schema_version (
        version INTEGER PRIMARY KEY
      );

      CREATE TABLE llm_configs (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        provider TEXT NOT NULL,
        base_url TEXT,
        api_key TEXT,
        model TEXT NOT NULL,
        temperature REAL,
        max_tokens INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, name),
        UNIQUE(user_id, provider, model)
      );

      CREATE TABLE app_configs (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        encryption_key TEXT,
        db_path TEXT,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      INSERT INTO schema_version (version) VALUES (${ConfigService.CURRENT_SCHEMA_VERSION});
    `)
  }

  private migrateIfNeeded(): void {
    const version = this.db.prepare('SELECT version FROM schema_version').get() as
      | SchemaVersionRow
      | undefined
    const currentVersion = version?.version || 0

    if (currentVersion < ConfigService.CURRENT_SCHEMA_VERSION) {
      // Add migration logic here when needed
      this.db
        .prepare('UPDATE schema_version SET version = ?')
        .run(ConfigService.CURRENT_SCHEMA_VERSION)
    }
  }

  async getUserLLMConfig(
    userId: string,
    provider: string,
    model: string
  ): Promise<LLMConfig | null> {
    const cacheKey = `${userId}:${provider}:${model}`
    const cachedConfig = this.configCache.get(cacheKey)
    if (cachedConfig) {
      return cachedConfig
    }

    const rows = this.db
      .prepare(
        'SELECT * FROM llm_configs WHERE user_id = ? AND provider = ? AND model = ? ORDER BY created_at ASC'
      )
      .all(userId, provider, model) as LLMConfig[]

    if (rows.length > 0) {
      this.configCache.set(cacheKey, rows[0])
      return rows[0]
    }

    return null
  }

  async updateUserLLMConfig(
    userId: string,
    provider: string,
    model: string,
    config: Partial<LLMConfig>
  ): Promise<LLMConfig> {
    const cacheKey = `${userId}:${provider}:${model}`
    const { changes } = this.db
      .prepare('UPDATE llm_configs SET ? WHERE user_id = ? AND provider = ? AND model = ?')
      .run(config, userId, provider, model)
    if (changes > 0) {
      this.configCache.delete(cacheKey)
      const row = this.db
        .prepare('SELECT * FROM llm_configs WHERE user_id = ? AND provider = ? AND model = ?')
        .get(userId, provider, model) as LLMConfig
      this.configCache.set(cacheKey, row)
      return row
    }
    throw new Error('Failed to update LLM config')
  }

  // Add new method to delete LLM config
  async deleteLLMConfig(userId: string, provider: string, model: string): Promise<void> {
    const cacheKey = `${userId}:${provider}:${model}`
    const { changes } = this.db
      .prepare('DELETE FROM llm_configs WHERE user_id = ? AND provider = ? AND model = ?')
      .run(userId, provider, model)
    if (changes > 0) {
      this.configCache.delete(cacheKey)
      return
    }
    throw new Error('Failed to delete LLM config')
  }

  // Get the stored app configuration
  async getAppConfig(): Promise<AppConfig> {
    const defaultConfig: AppConfig = {
      encryptionKey: ConfigService.ENCRYPTION_KEY,
      dbPath: path.join(app.getPath('userData'), 'config.sqlite')
    }

    // Check cache first
    const cachedConfig = this.configCache.get(ConfigService.APP_CONFIG_KEY)
    if (cachedConfig) {
      return cachedConfig
    }

    const row = this.db
      .prepare('SELECT value FROM config WHERE key = ?')
      .get(ConfigService.APP_CONFIG_KEY) as ConfigRow

    const config = !row ? defaultConfig : (JSON.parse(row.value) as AppConfig)

    // Store in cache
    this.configCache.set(ConfigService.APP_CONFIG_KEY, config)
    return config
  }

  // Update app configuration
  async updateAppConfig(config: Partial<AppConfig>): Promise<void> {
    const currentConfig = await this.getAppConfig()
    const newConfig = {
      ...currentConfig,
      ...config
    }

    this.db
      .prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)')
      .run(ConfigService.APP_CONFIG_KEY, JSON.stringify(newConfig))

    // Update cache
    this.configCache.set(ConfigService.APP_CONFIG_KEY, newConfig)
  }

  // Clear all stored configurations
  async clearConfig(): Promise<void> {
    this.db.prepare('DELETE FROM config').run()
    this.configCache.clear() // Clear the cache
  }

  // Add this method to close the database connection
  public close(): void {
    if (this.db) {
      this.db.close()
    }
  }
}
