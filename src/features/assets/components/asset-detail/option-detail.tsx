import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { type OptionAsset } from '../../types'
import { FileText, DollarSign, Calendar, TrendingUp, TrendingDown } from 'lucide-react'

interface OptionDetailProps {
  asset: OptionAsset
}

export function OptionDetail({ asset }: OptionDetailProps) {
  return (
    <div className='grid gap-4 md:grid-cols-2'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <FileText className='h-5 w-5' />
            Información de la Opción
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <p className='text-sm text-muted-foreground'>Tipo de Opción</p>
            <Badge 
              variant={asset.optionType === 'call' ? 'default' : 'destructive'} 
              className='mt-1 text-base px-3 py-1'
            >
              {asset.optionType === 'call' ? 'Call (Compra)' : 'Put (Venta)'}
            </Badge>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Posición</p>
            <Badge variant='outline' className='mt-1'>
              {asset.position === 'buy' ? 'Comprador' : 'Vendedor'}
            </Badge>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Activo Subyacente</p>
            <p className='font-medium text-lg'>{asset.underlyingAsset}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground flex items-center gap-2'>
              <DollarSign className='h-4 w-4' />
              Precio de Ejercicio (Strike)
            </p>
            <p className='text-2xl font-bold mt-1'>{asset.strikePrice}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Calendar className='h-5 w-5' />
            Fechas y Precios
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <p className='text-sm text-muted-foreground flex items-center gap-2'>
              <Calendar className='h-4 w-4' />
              Fecha de Vencimiento
            </p>
            <p className='font-medium mt-1'>
              {asset.expirationDate.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
          {asset.premium !== undefined && (
            <div>
              <p className='text-sm text-muted-foreground'>Prima</p>
              <p className='text-xl font-semibold mt-1'>{asset.premium}</p>
            </div>
          )}
          {asset.volatility !== undefined && (
            <div>
              <p className='text-sm text-muted-foreground'>Volatilidad Implícita</p>
              <p className='text-lg font-medium mt-1'>{asset.volatility}%</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className='md:col-span-2'>
        <CardHeader>
          <CardTitle>Información sobre Opciones</CardTitle>
          <CardDescription>
            Las opciones otorgan derechos, no obligaciones, sobre un activo subyacente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-3'>
            <div className='flex items-start gap-3'>
              {asset.optionType === 'call' ? (
                <TrendingUp className='h-5 w-5 text-blue-500 mt-0.5' />
              ) : (
                <TrendingDown className='h-5 w-5 text-red-500 mt-0.5' />
              )}
              <div>
                <p className='font-medium'>
                  {asset.optionType === 'call' ? 'Call (Opción de Compra)' : 'Put (Opción de Venta)'}
                </p>
                <p className='text-sm text-muted-foreground'>
                  {asset.optionType === 'call' 
                    ? 'Derecho a comprar el activo subyacente al precio de ejercicio'
                    : 'Derecho a vender el activo subyacente al precio de ejercicio'}
                </p>
              </div>
            </div>
            <div className='text-sm text-muted-foreground space-y-1'>
              <p>• El comprador paga una prima por el derecho</p>
              <p>• El vendedor cobra la prima pero asume la obligación</p>
              <p>• La prima depende de la volatilidad y tiempo hasta vencimiento</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

