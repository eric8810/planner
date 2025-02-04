import { ipcMain } from 'electron'
import { LLMOptions, LLMService } from '@/services/llm/LLMService'
import { ChatCompletionMessageParam } from 'openai/resources'

export function initLLMHandlers(llmService: LLMService): void {
  ipcMain.handle(
    'llm:chat',
    async (_, messages: ChatCompletionMessageParam[], options: LLMOptions) => {
      return await llmService.chat(messages, options)
    }
  )

  ipcMain.handle('llm:completion', async (_, prompt: string, options: LLMOptions) => {
    return await llmService.completion(prompt, options)
  })
}

export function removeLLMHandlers(): void {
  ipcMain.removeHandler('llm:chat')
  ipcMain.removeHandler('llm:completion')
}
