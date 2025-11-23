import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { tanstackRouter } from '@tanstack/router-plugin/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    tanstackRouter({
      target: 'react',
      autoCodeSplitting: true,
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Configuración para desarrollo
    hmr: {
      overlay: true, // Muestra errores en overlay
    },
    // Continúa sirviendo incluso con errores
    strictPort: false,
  },
  build: {
    // No fallar el build por advertencias de TypeScript
    rollupOptions: {
      onwarn(warning, warn) {
        // Ignora ciertas advertencias
        if (warning.code === 'UNUSED_EXTERNAL_IMPORT') return
        warn(warning)
      },
    },
    // Genera sourcemaps para mejor debugging
    sourcemap: true,
  },
  // Configuración de optimización
  optimizeDeps: {
    // Fuerza la pre-bundling de estas dependencias
    include: ['react', 'react-dom', '@tanstack/react-router'],
    // Fuerza rebuild de dependencias
    force: true,
  },
  // Configuración de logs más detallada
  logLevel: 'info',
  // Limpia la pantalla en cada rebuild
  clearScreen: false,
})
