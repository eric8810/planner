import { OpenAI } from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources'
import { ConfigService } from '../config/ConfigService'
import { UserService } from '../user/UserService'

export type LLMProvider = 'openai' | 'anthropic' | 'deepseek' | string

export interface LLMOptions {
  provider: string
  model: string
  stream?: boolean
}

export class DeepSeek extends OpenAI {}
export class Anthropic extends OpenAI {}
export class SiliconFlow extends OpenAI {}

export class LLMService {
  private configService: ConfigService
  private userService: UserService
  constructor(configService: ConfigService, userService: UserService) {
    this.configService = configService
    this.userService = userService
  }

  private async createClient(provider: string, model: string) {
    if (!this.userService.userId) {
      throw new Error('User not found')
    }
    const config = await this.configService.getUserLLMConfig(
      this.userService.userId,
      provider,
      model
    )

    if (config && config.api_key && config.base_url) {
      return new OpenAI({
        apiKey: config.api_key,
        baseURL: config.base_url
      })
    }

    throw new Error(`Unsupported provider: ${provider}`)
  }

  async chat(messages: ChatCompletionMessageParam[], options: LLMOptions) {
    const client = await this.createClient(options.provider, options.model)

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
    const client = await this.createClient(options.provider, options.model)

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
