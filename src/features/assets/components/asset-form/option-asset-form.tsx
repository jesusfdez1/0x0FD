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

const optionAssetSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  underlyingAsset: z.string().min(1, 'El activo subyacente es requerido'),
  optionType: z.enum(['call', 'put']),
  position: z.enum(['buy', 'sell']),
  strikePrice: z.number().min(0),
  expirationDate: z.string().min(1, 'La fecha de vencimiento es requerida'),
  premium: z.number().min(0).optional(),
  volatility: z.number().min(0).max(100).optional(),
  description: z.string().optional(),
})

type OptionAssetFormData = z.infer<typeof optionAssetSchema>

interface OptionAssetFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function OptionAssetForm({ onSuccess, onCancel }: OptionAssetFormProps) {
  const queryClient = useQueryClient()
  
  const form = useForm<OptionAssetFormData>({
    resolver: zodResolver(optionAssetSchema),
    defaultValues: {
      name: '',
      underlyingAsset: '',
      optionType: 'call',
      position: 'buy',
      strikePrice: 0,
      expirationDate: '',
    },
  })

  const onSubmit = async (data: OptionAssetFormData) => {
    try {
      const newAsset = {
        id: `o${Date.now()}`,
        type: AssetType.OPTION,
        ...data,
        expirationDate: new Date(data.expirationDate),
      }
      
      queryClient.setQueryData(['assets'], (old: any[]) => [...(old || []), newAsset])
      toast.success('Opción creada exitosamente')
      onSuccess?.()
    } catch (error) {
      toast.error('Error al crear la opción')
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
              <FormLabel>Nombre de la Opción</FormLabel>
              <FormControl>
                <Input placeholder='Ej: Call AAPL 180' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='underlyingAsset'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Activo Subyacente</FormLabel>
                <FormControl>
                  <Input placeholder='Ej: AAPL' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='strikePrice'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Precio de Ejercicio (Strike)</FormLabel>
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
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='optionType'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Opción</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='call'>Call (Compra)</SelectItem>
                    <SelectItem value='put'>Put (Venta)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='position'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Posición</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='buy'>Comprador</SelectItem>
                    <SelectItem value='sell'>Vendedor</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid grid-cols-3 gap-4'>
          <FormField
            control={form.control}
            name='expirationDate'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha de Vencimiento</FormLabel>
                <FormControl>
                  <Input type='date' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='premium'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prima</FormLabel>
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
            name='volatility'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Volatilidad (%)</FormLabel>
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
        </div>

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea placeholder='Descripción de la opción...' className='resize-none' {...field} />
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
          <Button type='submit'>Crear Opción</Button>
        </div>
      </form>
    </Form>
  )
}

