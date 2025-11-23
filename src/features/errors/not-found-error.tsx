/**
 * Componente de página no encontrada (404)
 * Se muestra cuando el usuario intenta acceder a una ruta que no existe
 * Proporciona una interfaz amigable con opciones de navegación
 */

import { useNavigate, useRouter } from '@tanstack/react-router'
import { ArrowLeft, Home } from 'lucide-react'

import { Button } from '@/components/ui/button'

/**
 * Componente NotFound que se renderiza automáticamente para rutas inexistentes
 * Muestra un mensaje claro y opciones de navegación para el usuario
 */
export function NotFoundError() {
  const navigate = useNavigate()
  const { history } = useRouter()

  return (
    <main className='flex min-h-screen flex-col items-center justify-center p-4 landscape:py-1 text-center mx-5 md:mx-0'>
      <div className='max-w-2xl'>
        {/* Contenedor con imagen y número 404 */}
        <div className='mb-8 landscape:mb-4 flex flex-col items-center justify-center gap-4 landscape:gap-2 landscape:flex-row md:flex-row md:gap-8'>
          {/* Imagen ilustrativa */}
          <div className='relative w-full max-w-[10rem] aspect-square sm:max-w-[10rem] md:max-w-[12rem] lg:max-w-[24rem] landscape:max-w-[9rem] sm:landscape:max-w-[10rem] md:landscape:max-w-[12rem]'>
            <img
              src='/images/error.png'
              alt='Error illustration'
              className='w-full h-full object-contain'
            />
          </div>

          {/* Número 404 con efecto de gradiente */}
          <div className='flex flex-col items-center justify-center'>
            <span
              aria-hidden='true'
              className='bg-gradient-to-b from-foreground to-transparent bg-clip-text text-[5rem] font-extrabold leading-none text-transparent mt-2 sm:text-[4.5rem] md:text-[5.5rem] lg:text-[10rem]'
            >
              404
            </span>
          </div>
        </div>

        {/* Mensaje principal explicativo */}
        <h1 className='mb-2 font-heading text-2xl font-bold md:text-3xl'>
          Algo ha fallado
        </h1>
        <p className='mb-8 text-muted-foreground md:text-lg'>
          Lo sentimos, la página que estás buscando no existe o ha sido movida.
        </p>

        {/* Botones de navegación para recuperación */}
        <div className='flex flex-col gap-4 sm:flex-row sm:justify-center'>
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
      </div>
    </main>
  )
}
