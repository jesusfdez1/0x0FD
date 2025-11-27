import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { type Asset, AssetType, type PreciousMetalAsset } from '../../types'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useLanguage } from '@/context/language-provider'
import { InitialExpensesField } from './initial-expenses-field'

const preciousMetalSchema = z.object({
  name: z.string().min(1),
  metalType: z.enum(['gold', 'silver', 'platinum', 'palladium']),
  weight: z.number().min(0.01),
  unit: z.enum(['grams', 'ounces', 'kilograms']),
  purity: z.number().min(0).max(100).optional(),
  purchasePrice: z.number().min(0).optional(),
  price: z.number().min(0).optional(),
  storageLocation: z.string().optional(),
  currency: z.string().optional(),
  description: z.string().optional(),
  initialExpenses: z
    .array(
      z.object({
        label: z.string().min(1, 'Requerido'),
        amount: z.number().min(0, 'Requerido'),
      })
    )
    .optional(),
})

type PreciousMetalFormData = z.infer<typeof preciousMetalSchema>

interface PreciousMetalAssetFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  asset?: PreciousMetalAsset
}

export function PreciousMetalAssetForm({ onSuccess, onCancel, asset }: PreciousMetalAssetFormProps) {
  const queryClient = useQueryClient()
  const { t } = useLanguage()
  const isEditing = Boolean(asset)

  const form = useForm<PreciousMetalFormData>({
    resolver: zodResolver(preciousMetalSchema),
    defaultValues: {
      name: asset?.name ?? '',
      metalType: (asset?.metalType as PreciousMetalFormData['metalType']) ?? 'gold',
      weight: asset?.weight ?? 1,
      unit: (asset?.unit as PreciousMetalFormData['unit']) ?? 'grams',
      purity: asset?.purity,
      purchasePrice: asset?.purchasePrice,
      price: asset?.price,
      storageLocation: asset?.storageLocation ?? '',
      currency: asset?.currency ?? 'EUR',
      description: asset?.description ?? '',
      initialExpenses: asset?.initialExpenses ?? [],
    },
  })

  const onSubmit = async (data: PreciousMetalFormData) => {
    try {
      const baseAsset = asset ?? {
        id: `pm${Date.now()}`,
        type: AssetType.PRECIOUS_METAL as const,
      }

      const updatedAsset: PreciousMetalAsset = {
        ...baseAsset,
        ...data,
      }

      queryClient.setQueryData<Asset[]>(['assets'], (old = []) => {
        if (isEditing && asset) {
          return old.map((item) => (item.id === asset.id ? updatedAsset : item))
        }
        return [...old, updatedAsset]
      })

      toast.success(
        isEditing ? t('assets.forms.common.updated') : t('assets.forms.preciousMetal.success')
      )
      onSuccess?.()
    } catch (error) {
      toast.error(t('assets.forms.preciousMetal.error'))
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
              <FormLabel>{t('assets.forms.preciousMetal.nameLabel')}</FormLabel>
              <FormControl>
                <Input placeholder={t('assets.forms.preciousMetal.namePlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          <FormField
            control={form.control}
            name='metalType'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('assets.forms.preciousMetal.metalTypeLabel')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('assets.forms.common.selectPlaceholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='gold'>{t('assets.forms.preciousMetal.metalTypes.gold')}</SelectItem>
                    <SelectItem value='silver'>{t('assets.forms.preciousMetal.metalTypes.silver')}</SelectItem>
                    <SelectItem value='platinum'>{t('assets.forms.preciousMetal.metalTypes.platinum')}</SelectItem>
                    <SelectItem value='palladium'>{t('assets.forms.preciousMetal.metalTypes.palladium')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='weight'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('assets.forms.preciousMetal.weightLabel')}</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    step='0.01'
                    placeholder={t('assets.forms.common.amountPlaceholder')}
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
            name='unit'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('assets.forms.preciousMetal.unitLabel')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='grams'>{t('assets.forms.preciousMetal.units.grams')}</SelectItem>
                    <SelectItem value='ounces'>{t('assets.forms.preciousMetal.units.ounces')}</SelectItem>
                    <SelectItem value='kilograms'>{t('assets.forms.preciousMetal.units.kilograms')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          <FormField
            control={form.control}
            name='purity'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('assets.forms.preciousMetal.purityLabel')}</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    step='0.1'
                    placeholder={t('assets.forms.common.percentagePlaceholder')}
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
            name='purchasePrice'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('assets.forms.preciousMetal.purchasePriceLabel')}</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    step='0.01'
                    placeholder={t('assets.forms.common.amountPlaceholder')}
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
                <FormLabel>{t('assets.forms.preciousMetal.currentValueLabel')}</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    step='0.01'
                    placeholder={t('assets.forms.common.amountPlaceholder')}
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='storageLocation'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('assets.forms.preciousMetal.storageLabel')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('assets.forms.preciousMetal.storagePlaceholder')} {...field} />
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
                <FormLabel>{t('assets.forms.common.currencyLabel')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('assets.forms.common.currencyPlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <InitialExpensesField control={form.control} register={form.register} />

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('assets.forms.common.notesLabel')}</FormLabel>
              <FormControl>
                <Textarea placeholder={t('assets.forms.preciousMetal.notesPlaceholder')} className='resize-none' {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex justify-end gap-2'>
          {onCancel && (
            <Button type='button' variant='outline' onClick={onCancel}>
              {t('common.cancel')}
            </Button>
          )}
          <Button type='submit'>{t('assets.forms.preciousMetal.submit')}</Button>
        </div>
      </form>
    </Form>
  )
}


