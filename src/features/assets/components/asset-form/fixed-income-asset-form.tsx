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

const fixedIncomeAssetSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  issuer: z.string().min(1, 'El emisor es requerido'),
  coupon: z.number().min(0).max(100).optional(),
  couponType: z.enum(['fixed', 'floating']).optional(),
  yield: z.number().min(0).max(100).optional(),
  rating: z.string().optional(),
  currency: z.string().optional(),
  description: z.string().optional(),
})

type FixedIncomeAssetFormData = z.infer<typeof fixedIncomeAssetSchema>

interface FixedIncomeAssetFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function FixedIncomeAssetForm({ onSuccess, onCancel }: FixedIncomeAssetFormProps) {
  const queryClient = useQueryClient()
  
  const form = useForm<FixedIncomeAssetFormData>({
    resolver: zodResolver(fixedIncomeAssetSchema),
    defaultValues: {
      name: '',
      issuer: '',
      currency: 'EUR',
      couponType: 'fixed',
    },
  })

  const onSubmit = async (data: FixedIncomeAssetFormData) => {
    try {
      const newAsset = {
        id: `f${Date.now()}`,
        type: AssetType.FIXED_INCOME,
        ...data,
      }
      
      queryClient.setQueryData(['assets'], (old: any[]) => [...(old || []), newAsset])
      toast.success('Activo de renta fija creado exitosamente')
      onSuccess?.()
    } catch (error) {
      toast.error('Error al crear el activo')
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
              <FormLabel>Nombre del Bono</FormLabel>
              <FormControl>
                <Input placeholder='Ej: Bono España 10 años' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='issuer'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Emisor</FormLabel>
              <FormControl>
                <Input placeholder='Ej: España' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid grid-cols-3 gap-4'>
          <FormField
            control={form.control}
            name='coupon'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cupón (%)</FormLabel>
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
            name='couponType'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Cupón</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='fixed'>Fijo</SelectItem>
                    <SelectItem value='floating'>Flotante</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='rating'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Rating</FormLabel>
                <FormControl>
                  <Input placeholder='Ej: AAA' {...field} />
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
                <Textarea placeholder='Descripción del bono...' className='resize-none' {...field} />
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


