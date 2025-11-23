import { useCallback } from 'react'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'

type ExportedData = {
  meta: {
    app: string
    version?: string
    timestamp: string
  }
  localStorage: Record<string, string>
  cookies: Record<string, string>
}

function getAllLocalStorage(): Record<string, string> {
  const out: Record<string, string> = {}
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        out[key] = localStorage.getItem(key) as string
      }
    }
  } catch (e) {
    // ignore
  }
  return out
}

function getAllCookies(): Record<string, string> {
  const out: Record<string, string> = {}
  const cookieString = typeof document !== 'undefined' ? document.cookie : ''
  if (!cookieString) return out
  const cookieParts = cookieString.split('; ')
  cookieParts.forEach((part) => {
    const [name, ...rest] = part.split('=')
    out[name] = rest.join('=')
  })
  return out
}

export function useExportImport(appName = '0x0FD', version?: string) {
  const exportAll = useCallback(() => {
    const payload: ExportedData = {
      meta: { app: appName, version, timestamp: new Date().toISOString() },
      localStorage: getAllLocalStorage(),
      cookies: getAllCookies(),
    }

    const json = JSON.stringify(payload, null, 2)
    const filename = `${appName}-export-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
    return payload
  }, [appName, version])

  const importAll = useCallback(async (payload: ExportedData, options?: { overwrite?: boolean }) => {
    const { overwrite = false } = options ?? {}
    if (overwrite) {
      // clear localStorage and cookies
      try {
        localStorage.clear()
      } catch (e) {
        // ignore
      }
      // clear cookies by setting expiry to 0 for those we can parse
      Object.keys(getAllCookies()).forEach((c) => removeCookie(c))
    }

    // Apply localStorage values
    if (payload.localStorage) {
      Object.entries(payload.localStorage).forEach(([k, v]) => {
        try {
          localStorage.setItem(k, v)
        } catch (e) {
          // ignore possible quota errors
        }
      })
    }

    // Set cookies
    if (payload.cookies) {
      Object.entries(payload.cookies).forEach(([k, v]) => {
        try {
          setCookie(k, v)
        } catch (e) {
          // ignore
        }
      })
    }

    // If theme color changed, dispatch event (so ThemeColorInitializer listens)
    try {
      const themeColor = payload.localStorage?.['theme-primary-color']
      if (themeColor) {
        const color = JSON.parse(themeColor)
        window.dispatchEvent(new CustomEvent('theme-color-changed', { detail: color }))
      }
    } catch (e) {
      // ignore errors reading theme color
    }

    // Return summary
    return { success: true }
  }, [])

  const parseFile = useCallback(async (file: File): Promise<ExportedData> => {
    const text = await file.text()
    const data = JSON.parse(text) as ExportedData
    return data
  }, [])

  return { exportAll, importAll, parseFile }
}

export default useExportImport
