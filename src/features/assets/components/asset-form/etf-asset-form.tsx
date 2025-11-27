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

const etfAssetSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  ticker: z.string().min(1, 'El ticker es requerido'),
  theme: z.string().optional(),
  assetClass: z.string().optional(),
  region: z.string().optional(),
  sector: z.string().optional(),
  expenseRatio: z.number().min(0).max(10).optional(),
  price: z.number().min(0).optional(),
  currency: z.string().optional(),
  description: z.string().optional(),
})

type ETFAssetFormData = z.infer<typeof etfAssetSchema>

interface ETFAssetFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function ETFAssetForm({ onSuccess, onCancel }: ETFAssetFormProps) {
  const queryClient = useQueryClient()
  
  const form = useForm<ETFAssetFormData>({
    resolver: zodResolver(etfAssetSchema),
    defaultValues: {
      name: '',
      ticker: '',
      currency: 'EUR',
    },
  })

  const onSubmit = async (data: ETFAssetFormData) => {
    try {
      const newAsset = {
        id: `e${Date.now()}`,
        type: AssetType.ETF,
        ...data,
      }
      
      queryClient.setQueryData(['assets'], (old: any[]) => [...(old || []), newAsset])
      toast.success('ETF creado exitosamente')
      onSuccess?.()
    } catch (error) {
      toast.error('Error al crear el ETF')
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
              <FormLabel>Nombre del ETF</FormLabel>
              <FormControl>
                <Input placeholder='Ej: SPDR S&P 500 ETF' {...field} />
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
                  <Input placeholder='Ej: SPY' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='theme'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tema/Enfoque</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder='Selecciona' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='Geográfico'>Geográfico</SelectItem>
                    <SelectItem value='Sectorial'>Sectorial</SelectItem>
                    <SelectItem value='Temático'>Temático</SelectItem>
                    <SelectItem value='Estilos'>Estilos</SelectItem>
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
            name='expenseRatio'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ratio de Gastos (%)</FormLabel>
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
        </div>

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción</FormLabel>
              <FormControl>
                <Textarea placeholder='Descripción del ETF...' className='resize-none' {...field} />
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
          <Button type='submit'>Crear ETF</Button>
        </div>
      </form>
    </Form>
  )
}

