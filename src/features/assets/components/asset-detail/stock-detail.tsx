import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { type StockAsset } from '../../types'
import { TrendingUp, MapPin, Building2, DollarSign, Percent } from 'lucide-react'

interface StockDetailProps {
  asset: StockAsset
}

export function StockDetail({ asset }: StockDetailProps) {
  return (
    <div className='grid gap-4 md:grid-cols-2'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Building2 className='h-5 w-5' />
            Información de la Empresa
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <p className='text-sm text-muted-foreground'>Nombre</p>
            <p className='font-medium'>{asset.companyName}</p>
          </div>
          {asset.sector && (
            <div>
              <p className='text-sm text-muted-foreground'>Sector</p>
              <Badge variant='outline' className='mt-1'>{asset.sector}</Badge>
            </div>
          )}
          {asset.region && (
            <div>
              <p className='text-sm text-muted-foreground'>Región</p>
              <div className='flex items-center gap-2 mt-1'>
                <MapPin className='h-4 w-4 text-muted-foreground' />
                <span className='font-medium'>{asset.region}</span>
              </div>
            </div>
          )}
          {asset.market && (
            <div>
              <p className='text-sm text-muted-foreground'>Mercado</p>
              <p className='font-medium'>{asset.market}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <DollarSign className='h-5 w-5' />
            Datos Financieros
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {asset.price !== undefined && (
            <div>
              <p className='text-sm text-muted-foreground'>Precio Actual</p>
              <p className='text-2xl font-bold mt-1'>
                {asset.price.toLocaleString('es-ES', { 
                  minimumFractionDigits: 2, 
                  maximumFractionDigits: 2 
                })} {asset.currency || 'EUR'}
              </p>
            </div>
          )}
          {asset.dividendYield !== undefined && (
            <div>
              <p className='text-sm text-muted-foreground flex items-center gap-2'>
                <Percent className='h-4 w-4' />
                Rentabilidad por Dividendo
              </p>
              <p className='text-xl font-semibold text-green-600 dark:text-green-400 mt-1'>
                {asset.dividendYield}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className='md:col-span-2'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <TrendingUp className='h-5 w-5' />
            Características de la Inversión
          </CardTitle>
          <CardDescription>
            Información sobre las acciones y su comportamiento en el mercado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='grid gap-4 md:grid-cols-2'>
            <div>
              <p className='text-sm text-muted-foreground mb-2'>Ticker</p>
              <Badge variant='secondary' className='text-base px-3 py-1'>{asset.ticker}</Badge>
            </div>
            <div>
              <p className='text-sm text-muted-foreground mb-2'>Tipo de Activo</p>
              <p className='font-medium'>Acción - Renta Variable</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

