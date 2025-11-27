import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { AssetType } from '../../types'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

const currencyAssetSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  pair: z.string().min(1, 'El par es requerido'),
  baseCurrency: z.string().min(1, 'La divisa base es requerida'),
  quoteCurrency: z.string().min(1, 'La divisa cotizada es requerida'),
  exchangeRate: z.number().min(0).optional(),
  usage: z.enum(['transactional', 'investment', 'hedge', 'refuge']).optional(),
  description: z.string().optional(),
})

type CurrencyAssetFormData = z.infer<typeof currencyAssetSchema>

interface CurrencyAssetFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function CurrencyAssetForm({ onSuccess, onCancel }: CurrencyAssetFormProps) {
  const queryClient = useQueryClient()
  
  const form = useForm<CurrencyAssetFormData>({
    resolver: zodResolver(currencyAssetSchema),
    defaultValues: {
      name: '',
      pair: '',
      baseCurrency: 'EUR',
      quoteCurrency: 'USD',
    },
  })

  const onSubmit = async (data: CurrencyAssetFormData) => {
    try {
      const newAsset = {
        id: `c${Date.now()}`,
        type: AssetType.CURRENCY,
        ...data,
      }
      
      queryClient.setQueryData(['assets'], (old: any[]) => [...(old || []), newAsset])
      toast.success('Par de divisas creado exitosamente')
      onSuccess?.()
    } catch (error) {
      toast.error('Error al crear el par de divisas')
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
              <FormLabel>Nombre del Par</FormLabel>
              <FormControl>
                <Input placeholder='Ej: EUR/USD' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid grid-cols-3 gap-4'>
          <FormField
            control={form.control}
            name='pair'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Par</FormLabel>
                <FormControl>
                  <Input placeholder='EUR/USD' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='baseCurrency'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Divisa Base</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
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

          <FormField
            control={form.control}
            name='quoteCurrency'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Divisa Cotizada</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
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

        <div className='grid grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='exchangeRate'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Cambio</FormLabel>
                <FormControl>
                  <Input 
                    type='number' 
                    step='0.0001'
                    placeholder='0.0000' 
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
            name='usage'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Uso</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Selecciona' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='transactional'>Transaccional</SelectItem>
                    <SelectItem value='investment'>Inversión</SelectItem>
                    <SelectItem value='hedge'>Cobertura</SelectItem>
                    <SelectItem value='refuge'>Refugio</SelectItem>
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
                <Textarea placeholder='Descripción del par de divisas...' className='resize-none' {...field} />
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
          <Button type='submit'>Crear Par de Divisas</Button>
        </div>
      </form>
    </Form>
  )
}

