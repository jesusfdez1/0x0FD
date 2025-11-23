/**
 * Componente de error de mantenimiento (503)
 * Se muestra cuando el sitio está en mantenimiento
 * Proporciona información al usuario sobre el estado del servicio
 */

import { Home } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useNavigate } from '@tanstack/react-router'

/**
 * Componente MaintenanceError que se muestra durante el mantenimiento del sitio
 * Informa al usuario que el servicio volverá pronto
 */
export function MaintenanceError() {
  const navigate = useNavigate()

  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-4 landscape:py-1 text-center mx-5 md:mx-0'>
      <div className='max-w-2xl'>
        {/* Imagen ilustrativa del error */}
        <div className='mb-8 landscape:mb-4 flex justify-center'>
          <div className='relative w-full max-w-[12rem] aspect-square sm:max-w-[14rem] md:max-w-[16rem] lg:max-w-[20rem] landscape:max-w-[10rem] sm:landscape:max-w-[12rem] md:landscape:max-w-[14rem]'>
            <img
              src='/images/error.png'
              alt='Maintenance illustration'
              className='w-full h-full object-contain'
            />
          </div>
        </div>

        {/* Mensaje principal */}
        <h1 className='mb-2 font-heading text-2xl font-bold md:text-3xl'>
          Sitio en mantenimiento
        </h1>
        <p className='mb-8 text-muted-foreground md:text-lg'>
          El sitio no está disponible en este momento. <br />
          Volveremos a estar en línea en breve.
        </p>

        {/* Botones de navegación */}
        <div className='flex flex-col gap-4 sm:flex-row sm:justify-center'>
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
      </div>
    </main>
  )
}
