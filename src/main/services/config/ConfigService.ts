import Database from 'better-sqlite3-multiple-ciphers'
import path from 'path'
import { app } from 'electron'
import fs from 'fs'

export interface LLMConfig {
  provider?: 'openai' | 'anthropic' | 'local' | string
  baseUrl?: string
  apiKey?: string
  model?: string
  temperature?: number
  maxTokens?: number
}

interface LLMConfigRow {
  key: string
  value: string
}

export class ConfigService {
  private db: Database.Database
  private configCache: Map<string, any> = new Map()
  private static readonly LLM_CONFIG_KEY = 'llm-config'
  private static readonly ENCRYPTION_KEY = 'your-secret-key-here' // You should store this securely

  constructor() {
    const dbPath = path.join(app.getPath('userData'), 'config.sqlite')
    console.log('dbPath', dbPath)
    const isNewDb = !fs.existsSync(dbPath)
    this.db = new Database(dbPath)

    // Enable encryption
    this.db.pragma(`key='${ConfigService.ENCRYPTION_KEY}'`)
    // Enable WAL mode for better performance
    this.db.pragma('journal_mode = WAL')

    // Only create table if this is a new database
    if (isNewDb) {
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS config (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        )
      `)
    }
  }

  // Get the stored LLM configuration or return defaults
  async getLLMConfig(provider?: string): Promise<LLMConfig> {
    const defaultConfig: LLMConfig = {
      provider: 'openai',
      baseUrl: 'https://api.openai.com/v1',
      model: 'gpt-3.5-turbo',
      temperature: 0.7,
      maxTokens: 2000
    }

    if (!provider) {
      provider = defaultConfig.provider
    }

    const configKey = `${ConfigService.LLM_CONFIG_KEY}-${provider}`

    // Check cache first
    const cachedConfig = this.configCache.get(configKey)
    if (cachedConfig) {
      return cachedConfig
    }

    const row = this.db
      .prepare('SELECT value FROM config WHERE key = ?')
      .get(configKey) as LLMConfigRow

    const config = !row ? { ...defaultConfig, provider } : (JSON.parse(row.value) as LLMConfig)

    // Store in cache
    this.configCache.set(configKey, config)
    return config
  }

  // Update LLM configuration
  async updateLLMConfig(config: Partial<LLMConfig>): Promise<void> {
    const provider = config.provider || (await this.getLLMConfig()).provider
    const currentConfig = await this.getLLMConfig(provider)
    const newConfig = {
      ...currentConfig,
      ...config
    }

    const configKey = `${ConfigService.LLM_CONFIG_KEY}-${provider}`
    this.db
      .prepare('INSERT OR REPLACE INTO config (key, value) VALUES (?, ?)')
      .run(configKey, JSON.stringify(newConfig))

    // Update cache
    this.configCache.set(configKey, newConfig)
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
