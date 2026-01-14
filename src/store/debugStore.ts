import { create } from 'zustand'

interface DebugMessage {
  id: number
  timestamp: Date
  level: 'info' | 'warn' | 'error'
  source: string
  message: string
  data?: unknown
}

interface DebugStore {
  enabled: boolean
  messages: DebugMessage[]
  maxMessages: number

  toggleDebug: () => void
  log: (source: string, message: string, data?: unknown) => void
  warn: (source: string, message: string, data?: unknown) => void
  error: (source: string, message: string, data?: unknown) => void
  clear: () => void
}

let messageId = 0

export const useDebugStore = create<DebugStore>((set, get) => ({
  enabled: typeof localStorage !== 'undefined' && localStorage.getItem('debug') === 'true',
  messages: [],
  maxMessages: 100,

  toggleDebug: () => {
    const newEnabled = !get().enabled
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('debug', String(newEnabled))
    }
    set({ enabled: newEnabled })
  },

  log: (source, message, data) => {
    const msg: DebugMessage = {
      id: ++messageId,
      timestamp: new Date(),
      level: 'info',
      source,
      message,
      data
    }
    if (get().enabled) {
      console.log(`[${source}]`, message, data ?? '')
    }
    set(state => ({
      messages: [...state.messages.slice(-state.maxMessages + 1), msg]
    }))
  },

  warn: (source, message, data) => {
    const msg: DebugMessage = {
      id: ++messageId,
      timestamp: new Date(),
      level: 'warn',
      source,
      message,
      data
    }
    if (get().enabled) {
      console.warn(`[${source}]`, message, data ?? '')
    }
    set(state => ({
      messages: [...state.messages.slice(-state.maxMessages + 1), msg]
    }))
  },

  error: (source, message, data) => {
    // Always log errors to console
    const msg: DebugMessage = {
      id: ++messageId,
      timestamp: new Date(),
      level: 'error',
      source,
      message,
      data
    }
    console.error(`[${source}]`, message, data ?? '')
    set(state => ({
      messages: [...state.messages.slice(-state.maxMessages + 1), msg]
    }))
  },

  clear: () => set({ messages: [] })
}))

// Helper functions for easy importing throughout the codebase
export const debug = {
  log: (source: string, message: string, data?: unknown) =>
    useDebugStore.getState().log(source, message, data),
  warn: (source: string, message: string, data?: unknown) =>
    useDebugStore.getState().warn(source, message, data),
  error: (source: string, message: string, data?: unknown) =>
    useDebugStore.getState().error(source, message, data),
}
