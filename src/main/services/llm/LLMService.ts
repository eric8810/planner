import { OpenAI } from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources'
import { ConfigService } from '../config/ConfigService'

export type LLMProvider = 'openai' | 'anthropic' | 'deepseek' | string

export interface LLMOptions {
  provider: LLMProvider
  model: string
  stream?: boolean
}

export class DeepSeek extends OpenAI {}
export class Anthropic extends OpenAI {}
export class SiliconFlow extends OpenAI {}

export class LLMService {
  private configService: ConfigService

  constructor(configService: ConfigService) {
    this.configService = configService
  }

  private async createClient(provider: LLMProvider) {
    const config = await this.configService.getLLMConfig(provider)

    if (config.apiKey && config.baseUrl) {
      return new OpenAI({
        apiKey: config.apiKey,
        baseURL: config.baseUrl
      })
    }

    throw new Error(`Unsupported provider: ${provider}`)
  }

  async chat(messages: ChatCompletionMessageParam[], options: LLMOptions) {
    const client = await this.createClient(options.provider)

    try {
      const response = await client.chat.completions.create({
        model: options.model,
        messages,
        stream: options.stream
      })

      return response
    } catch (error) {
      console.error('LLM Error:', error)
      return null
    }
  }

  async completion(prompt: string, options: LLMOptions) {
    const client = await this.createClient(options.provider)

    try {
      const response = await client.completions.create({
        model: options.model,
        prompt,
        stream: options.stream
      })

      return response
    } catch (error) {
      console.error('LLM Error:', error)
      return null
    }
  }
}
