/**
 * Componente que inicializa el color del tema al cargar la aplicación
 * Carga el color personalizado guardado en localStorage y lo aplica
 */

import { useEffect } from 'react'

export function ThemeColorInitializer() {
  useEffect(() => {
    /**
     * Aplica el color del tema a las variables CSS
     */
    const applyThemeColor = (color: { hue: number, saturation: number, lightness: number }) => {
      const { hue, saturation, lightness } = color
      const hslValue = `${hue} ${saturation}% ${lightness}%`

      document.documentElement.style.setProperty('--primary', hslValue)
      document.documentElement.style.setProperty('--ring', hslValue)
      document.documentElement.style.setProperty('--primary-foreground', `${hue} ${saturation}% 98%`)

      // Actualizar también los valores para los gráficos si los hay
      document.documentElement.style.setProperty('--chart-1', hslValue)
      document.documentElement.style.setProperty('--chart-2', `${(hue + 30) % 360} ${saturation}% ${lightness}%`)
      document.documentElement.style.setProperty('--chart-3', `${(hue + 60) % 360} ${saturation}% ${lightness}%`)
      document.documentElement.style.setProperty('--chart-4', `${(hue + 90) % 360} ${saturation}% ${lightness}%`)
      document.documentElement.style.setProperty('--chart-5', `${(hue + 120) % 360} ${saturation}% ${lightness}%`)
    }

    // Cargar color primario guardado desde localStorage
    try {
      const savedColor = localStorage.getItem('theme-primary-color')
      if (savedColor) {
        const color = JSON.parse(savedColor)
        applyThemeColor(color)
      } else {
        // Si no hay color guardado, usar el color por defecto
        const defaultColor = { hue: 240, saturation: 100, lightness: 50 }
        applyThemeColor(defaultColor)
      }
    } catch (error) {
      console.error('Error al cargar el color del tema:', error)
      // En caso de error, aplicar color por defecto
      const defaultColor = { hue: 240, saturation: 100, lightness: 50 }
      applyThemeColor(defaultColor)
    }

    // Escuchar cambios en el color del tema desde otros componentes
    const handleThemeColorChange = (event: CustomEvent) => {
      applyThemeColor(event.detail)
    }

    window.addEventListener('theme-color-changed', handleThemeColorChange as EventListener)

    return () => {
      window.removeEventListener('theme-color-changed', handleThemeColorChange as EventListener)
    }
  }, [])

  return null
}

