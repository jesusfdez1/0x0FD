import { createContext, useContext, useEffect, useState } from 'react'
import { CommandMenu } from '@/components/command-menu'

type SearchContextType = {
  open: boolean
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}

const SearchContext = createContext<SearchContextType | null>(null)

type SearchProviderProps = {
  children: React.ReactNode
}

export function SearchProvider({ children }: SearchProviderProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      // If we are typing in an input/textarea or content editable, don't toggle.
      const target = e.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return
      }

      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        // Stop the browser default (ex: focus omnibox)
        e.preventDefault()
        e.stopPropagation()
        setOpen((open) => !open)
      }
    }
    // Use capture phase and explicit passive: false so preventDefault works across browsers.
    document.addEventListener('keydown', down, { capture: true, passive: false })
    return () => document.removeEventListener('keydown', down, { capture: true })
  }, [])

  return (
    <SearchContext.Provider value={{ open, setOpen }}>
      {children}
      <CommandMenu />
    </SearchContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSearch = () => {
  const searchContext = useContext(SearchContext)

  if (!searchContext) {
    throw new Error('useSearch has to be used within SearchProvider')
  }

  return searchContext
}
