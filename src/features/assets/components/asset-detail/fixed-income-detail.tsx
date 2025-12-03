import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { type FixedIncomeAsset } from '../../types'
import { Shield, DollarSign, Percent, Calendar, Award } from 'lucide-react'

interface FixedIncomeDetailProps {
  asset: FixedIncomeAsset
}

export function FixedIncomeDetail({ asset }: FixedIncomeDetailProps) {
  return (
    <div className='grid gap-4 md:grid-cols-2'>
      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Shield className='h-5 w-5' />
            Información del Emisor
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          <div>
            <p className='text-sm text-muted-foreground'>Emisor</p>
            <p className='font-medium text-lg'>{asset.issuer}</p>
          </div>
          {asset.rating && (
            <div>
              <p className='text-sm text-muted-foreground flex items-center gap-2'>
                <Award className='h-4 w-4' />
                Rating Crediticio
              </p>
              <Badge variant='outline' className='mt-1 text-base px-3 py-1'>
                {asset.rating}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <DollarSign className='h-5 w-5' />
            Características Financieras
          </CardTitle>
        </CardHeader>
        <CardContent className='space-y-4'>
          {asset.coupon !== undefined && (
            <div>
              <p className='text-sm text-muted-foreground flex items-center gap-2'>
                <Percent className='h-4 w-4' />
                Cupón
              </p>
              <p className='text-2xl font-bold mt-1'>
                {asset.coupon}%
              </p>
              {asset.couponType && (
                <Badge variant='outline' className='mt-2'>
                  {asset.couponType === 'fixed' ? 'Fijo' : 'Flotante'}
                </Badge>
              )}
            </div>
          )}
          {asset.yield !== undefined && (
            <div>
              <p className='text-sm text-muted-foreground'>TIR (Tasa Interna de Retorno)</p>
              <p className='text-xl font-semibold text-green-600 dark:text-green-400 mt-1'>
                {asset.yield}%
              </p>
            </div>
          )}
          {asset.maturityDate && (
            <div>
              <p className='text-sm text-muted-foreground flex items-center gap-2'>
                <Calendar className='h-4 w-4' />
                Fecha de Vencimiento
              </p>
              <p className='font-medium mt-1'>
                {asset.maturityDate.toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className='md:col-span-2'>
        <CardHeader>
          <CardTitle>Información sobre Renta Fija</CardTitle>
          <CardDescription>
            La renta fija ofrece estabilidad y rentabilidad predecible
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='space-y-2 text-sm text-muted-foreground'>
            <p>• Pago de intereses periódicos (cupones)</p>
            <p>• Devolución del principal al vencimiento</p>
            <p>• Menor riesgo que la renta variable</p>
            <p>• Adecuado para inversores que buscan estabilidad</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


