import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export class ErrorBoundary extends Component<Props> {

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Solo registramos en consola, no mostramos nada en pantalla
    console.error('❌ Error capturado por ErrorBoundary:', error)
    console.error('Información del error:', errorInfo)
    console.error('Stack trace:', error.stack)
    console.error('Component stack:', errorInfo.componentStack)
  }

  render() {
    // Si hay error, simplemente seguimos mostrando los children
    // El error ya fue registrado en consola por componentDidCatch
    return this.props.children
  }
}

