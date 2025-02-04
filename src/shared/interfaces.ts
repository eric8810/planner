// Common interfaces used across main and renderer processes
export interface FileOperation {
  path: string
  content?: string
}

export interface ApiResponse {
  success: boolean
  data?: any
  error?: string
}

// IPC Channel names as constants
export const IPC_CHANNELS = {
  FILE: {
    READ: 'file:read',
    WRITE: 'file:write',
    DELETE: 'file:delete'
  },
  API: {
    REQUEST: 'api:request',
    RESPONSE: 'api:response'
  }
} as const
