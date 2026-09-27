import { create } from 'zustand'

export type ToastTone = 'success' | 'error' | 'info'

export interface ToastItem {
  id: number
  tone: ToastTone
  message: string
}

interface ToastState {
  items: ToastItem[]
  push: (tone: ToastTone, message: string) => void
  dismiss: (id: number) => void
}

let siguienteId = 1

export const useToastStore = create<ToastState>((set, get) => ({
  items: [],
  push: (tone, message) => {
    const id = siguienteId++
    set({ items: [...get().items, { id, tone, message }].slice(-4) })
    setTimeout(() => get().dismiss(id), tone === 'error' ? 6000 : 4000)
  },
  dismiss: (id) => set({ items: get().items.filter((t) => t.id !== id) }),
}))

export const toast = {
  success: (message: string) => useToastStore.getState().push('success', message),
  error: (message: string) => useToastStore.getState().push('error', message),
  info: (message: string) => useToastStore.getState().push('info', message),
}
