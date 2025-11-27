import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { AssetType } from '../../types'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useLanguage } from '@/context/language-provider'

const commoditySchema = z.object({
  name: z.string().min(1),
  commodityType: z.enum(['precious_metals', 'energy', 'agricultural', 'industrial_metals']),
  contractSize: z.number().min(0.01),
  unit: z.string().min(1),
  storageLocation: z.string().optional(),
  purchasePrice: z.number().min(0).optional(),
  price: z.number().min(0).optional(),
  currency: z.string().optional(),
  description: z.string().optional(),
})

type CommodityFormData = z.infer<typeof commoditySchema>

interface CommodityAssetFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function CommodityAssetForm({ onSuccess, onCancel }: CommodityAssetFormProps) {
  const queryClient = useQueryClient()
  const { t } = useLanguage()

  const form = useForm<CommodityFormData>({
    resolver: zodResolver(commoditySchema),
    defaultValues: {
      name: '',
      commodityType: 'agricultural',
      contractSize: 1,
      unit: 't',
      currency: 'EUR',
    },
  })

  const onSubmit = async (data: CommodityFormData) => {
    try {
      const newAsset = {
        id: `cm${Date.now()}`,
        type: AssetType.COMMODITY,
        ...data,
      }

      queryClient.setQueryData(['assets'], (old: any[]) => [...(old || []), newAsset])
      toast.success(t('assets.forms.commodity.success'))
      onSuccess?.()
    } catch (error) {
      toast.error(t('assets.forms.commodity.error'))
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
              <FormLabel>{t('assets.forms.commodity.nameLabel')}</FormLabel>
              <FormControl>
                <Input placeholder={t('assets.forms.commodity.namePlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          <FormField
            control={form.control}
            name='commodityType'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('assets.forms.commodity.typeLabel')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('assets.forms.common.selectPlaceholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='precious_metals'>{t('assets.forms.commodity.types.precious_metals')}</SelectItem>
                    <SelectItem value='energy'>{t('assets.forms.commodity.types.energy')}</SelectItem>
                    <SelectItem value='agricultural'>{t('assets.forms.commodity.types.agricultural')}</SelectItem>
                    <SelectItem value='industrial_metals'>{t('assets.forms.commodity.types.industrial_metals')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='contractSize'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('assets.forms.commodity.amountLabel')}</FormLabel>
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
                <FormLabel>{t('assets.forms.commodity.unitLabel')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('assets.forms.commodity.unitPlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          <FormField
            control={form.control}
            name='purchasePrice'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('assets.forms.commodity.purchasePriceLabel')}</FormLabel>
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
                <FormLabel>{t('assets.forms.commodity.currentValueLabel')}</FormLabel>
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

        <FormField
          control={form.control}
          name='storageLocation'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('assets.forms.commodity.storageLabel')}</FormLabel>
              <FormControl>
                <Input placeholder={t('assets.forms.commodity.storagePlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('assets.forms.common.notesLabel')}</FormLabel>
              <FormControl>
                <Textarea placeholder={t('assets.forms.commodity.notesPlaceholder')} className='resize-none' {...field} />
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
          <Button type='submit'>{t('assets.forms.commodity.submit')}</Button>
        </div>
      </form>
    </Form>
  )
}


