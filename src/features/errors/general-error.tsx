/**
 * Componente de manejo de errores generales (500)
 * Captura errores del servidor y muestra una interfaz amigable
 * Proporciona opciones de navegación para recuperarse del error
 */

import { useNavigate, useRouter } from '@tanstack/react-router'
import { ArrowLeft, Home } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

type GeneralErrorProps = React.HTMLAttributes<HTMLDivElement> & {
  minimal?: boolean
  error?: Error & { digest?: string }
}

/**
 * Componente de error que se ejecuta cuando ocurre un error del servidor
 * @param minimal - Si es verdadero, muestra una versión reducida sin botones
 * @param error - Objeto de error con información del problema
 */
export function GeneralError({
  className,
  minimal = false,
  error,
}: GeneralErrorProps) {
  const navigate = useNavigate()
  const { history } = useRouter()

  return (
    <main
      className={cn(
        'flex min-h-screen flex-col items-center justify-center p-4 landscape:py-1 text-center mx-5 md:mx-0',
        className
      )}
    >
      <div className='max-w-2xl'>
        {!minimal && (
          <>
            {/* Imagen ilustrativa del error */}
            <div className='mb-8 landscape:mb-4 flex justify-center'>
              <div className='relative w-full max-w-[12rem] aspect-square sm:max-w-[14rem] md:max-w-[16rem] lg:max-w-[20rem] landscape:max-w-[10rem] sm:landscape:max-w-[12rem] md:landscape:max-w-[14rem]'>
                <img
                  src='/images/error.png'
                  alt='Error illustration'
                  className='w-full h-full object-contain'
                />
              </div>
            </div>
          </>
        )}

        {/* Mensaje principal del error */}
        <h1 className='mb-2 font-heading text-2xl font-bold md:text-3xl'>
          Ha ocurrido un error
        </h1>
        <p className='mb-4 text-muted-foreground md:text-lg'>
          Lo sentimos, algo ha salido mal en la aplicación.
        </p>

        {/* Detalles técnicos del error para debugging */}
        {error && (
          <p className='mb-8 text-sm text-muted-foreground font-mono bg-muted p-2 rounded'>
            {error.message || 'Error desconocido'}
          </p>
        )}

        {!minimal && (
          /* Botones de navegación para recuperación */
          <div className='flex flex-col gap-4 sm:flex-row sm:justify-center mt-8'>
            <Button
              onClick={() => history.go(-1)}
              variant='outline'
              size='lg'
              className='w-full sm:w-auto'
            >
              <ArrowLeft className='mr-2 h-4 w-4' />
              Volver atrás
            </Button>
            <Button
              onClick={() => navigate({ to: '/' })}
              variant='default'
              size='lg'
              className='w-full sm:w-auto'
            >
              <Home className='mr-2 h-4 w-4' />
              Volver al inicio
            </Button>
          </div>
        )}
      </div>
    </main>
  )
}
