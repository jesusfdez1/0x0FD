import { useEffect, useState } from 'react'

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem(key) : null
      if (raw) return JSON.parse(raw) as T
      return initialValue
    } catch (_err) {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state))
    } catch (e) {
      // ignore
    }
  }, [key, state])

  return [state, setState] as const
}

export default useLocalStorage
