import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createRouter, RouterProvider } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { DirectionProvider } from './context/direction-provider'
import { ErrorBoundary } from './components/error-boundary'
import { FontProvider } from './context/font-provider'
import { LanguageProvider } from './context/language-provider'
import { LayoutProvider } from './context/layout-provider'
import { SearchProvider } from './context/search-provider'
import { ThemeProvider } from './context/theme-provider'
import { ThemeColorInitializer } from './components/theme-color-initializer'
import './styles/index.css'
import './styles/theme.css'

// Create a new query client instance
const queryClient = new QueryClient()

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    queryClient,
  },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

// Render the app con manejo de errores
const rootElement = document.getElementById('root')!

try {
  if (!rootElement.innerHTML) {
    const root = createRoot(rootElement)
    
    // Intenta renderizar la app
    root.render(
      <StrictMode>
        <ErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <LanguageProvider>
              <ThemeProvider>
                <ThemeColorInitializer />
                <DirectionProvider>
                  <FontProvider>
                    <LayoutProvider>
                      <SearchProvider>
                        <RouterProvider router={router} />
                      </SearchProvider>
                    </LayoutProvider>
                  </FontProvider>
                </DirectionProvider>
              </ThemeProvider>
            </LanguageProvider>
          </QueryClientProvider>
        </ErrorBoundary>
      </StrictMode>
    )
  }
} catch (error) {
  console.error('❌ Error al renderizar la aplicación:', error)
  console.error('Stack trace:', (error as Error).stack)
}
