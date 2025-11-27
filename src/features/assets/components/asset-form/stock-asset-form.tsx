import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { AssetType } from '../../types'
import { useAssets } from '../../hooks/use-assets'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const stockAssetSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  ticker: z.string().min(1, 'El ticker es requerido'),
  companyName: z.string().min(1, 'El nombre de la empresa es requerido'),
  sector: z.string().optional(),
  region: z.string().optional(),
  market: z.string().optional(),
  dividendYield: z.number().min(0).max(100).optional(),
  price: z.number().min(0).optional(),
  currency: z.string().optional(),
  description: z.string().optional(),
})

type StockAssetFormData = z.infer<typeof stockAssetSchema>

interface StockAssetFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  initialData?: Partial<StockAssetFormData>
}

export function StockAssetForm({ onSuccess, onCancel, initialData }: StockAssetFormProps) {
  const queryClient = useQueryClient()
  
  const form = useForm<StockAssetFormData>({
    resolver: zodResolver(stockAssetSchema),
    defaultValues: initialData || {
      name: '',
      ticker: '',
      companyName: '',
      sector: '',
      region: '',
      market: '',
      currency: 'EUR',
    },
  })

  const onSubmit = async (data: StockAssetFormData) => {
    try {
      // Aquí iría la llamada a la API
      // Por ahora simulamos la creación
      const newAsset = {
        id: `a${Date.now()}`,
        type: AssetType.STOCK,
        ...data,
      }
      
      // Actualizar cache
      queryClient.setQueryData(['assets'], (old: any[]) => [...(old || []), newAsset])
      
      toast.success('Activo creado exitosamente')
      onSuccess?.()
    } catch (error) {
      toast.error('Error al crear el activo')
      console.error(error)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre del Activo</FormLabel>
              <FormControl>
                <Input placeholder='Ej: Apple Inc' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='ticker'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ticker</FormLabel>
                <FormControl>
                  <Input placeholder='Ej: AAPL' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='companyName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre de la Empresa</FormLabel>
                <FormControl>
                  <Input placeholder='Ej: Apple Inc' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid grid-cols-3 gap-4'>
          <FormField
            control={form.control}
            name='sector'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sector</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Selecciona' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='Technology'>Technology</SelectItem>
                    <SelectItem value='Financial'>Financial</SelectItem>
                    <SelectItem value='Retail'>Retail</SelectItem>
                    <SelectItem value='Healthcare'>Healthcare</SelectItem>
                    <SelectItem value='Energy'>Energy</SelectItem>
                    <SelectItem value='Automotive'>Automotive</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='region'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Región</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Selecciona' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='North America'>North America</SelectItem>
                    <SelectItem value='Europe'>Europe</SelectItem>
                    <SelectItem value='Asia'>Asia</SelectItem>
                    <SelectItem value='South America'>South America</SelectItem>
                    <SelectItem value='Oceania'>Oceania</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='market'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mercado</FormLabel>
                <FormControl>
                  <Input placeholder='Ej: NASDAQ' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid grid-cols-3 gap-4'>
          <FormField
            control={form.control}
            name='price'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio</FormLabel>
                <FormControl>
                  <Input 
                    type='number' 
                    step='0.01'
                    placeholder='0.00' 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='dividendYield'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dividendo (%)</FormLabel>
                <FormControl>
                  <Input 
                    type='number' 
                    step='0.1'
                    placeholder='0.0' 
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='currency'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Moneda</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='EUR' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='EUR'>EUR</SelectItem>
                    <SelectItem value='USD'>USD</SelectItem>
                    <SelectItem value='GBP'>GBP</SelectItem>
                    <SelectItem value='JPY'>JPY</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder='Descripción del activo...' 
                  className='resize-none'
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex justify-end gap-2'>
          {onCancel && (
            <Button type='button' variant='outline' onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type='submit'>Crear Activo</Button>
        </div>
      </form>
    </Form>
  )
}

