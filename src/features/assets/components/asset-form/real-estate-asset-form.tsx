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

const realEstateAssetSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  propertyType: z.enum(['residential', 'commercial', 'industrial', 'land']).optional(),
  location: z.string().optional(),
  purchasePrice: z.number().min(0).optional(),
  price: z.number().min(0).optional(),
  rentalYield: z.number().min(0).max(100).optional(),
  squareMeters: z.number().min(0).optional(),
  currency: z.string().optional(),
  description: z.string().optional(),
})

type RealEstateAssetFormData = z.infer<typeof realEstateAssetSchema>

interface RealEstateAssetFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function RealEstateAssetForm({ onSuccess, onCancel }: RealEstateAssetFormProps) {
  const queryClient = useQueryClient()
  const { t } = useLanguage()

  const form = useForm<RealEstateAssetFormData>({
    resolver: zodResolver(realEstateAssetSchema),
    defaultValues: {
      name: '',
      propertyType: 'residential',
      currency: 'EUR',
    },
  })

  const onSubmit = async (data: RealEstateAssetFormData) => {
    try {
      const newAsset = {
        id: `re${Date.now()}`,
        type: AssetType.REAL_ESTATE,
        ...data,
      }

      queryClient.setQueryData(['assets'], (old: any[]) => [...(old || []), newAsset])
      toast.success(t('assets.forms.realEstate.success'))
      onSuccess?.()
    } catch (error) {
      toast.error(t('assets.forms.realEstate.error'))
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
              <FormLabel>{t('assets.forms.realEstate.nameLabel')}</FormLabel>
              <FormControl>
                <Input placeholder={t('assets.forms.realEstate.namePlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='propertyType'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('assets.forms.realEstate.typeLabel')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('assets.forms.common.selectPlaceholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='residential'>{t('assets.forms.realEstate.propertyTypes.residential')}</SelectItem>
                    <SelectItem value='commercial'>{t('assets.forms.realEstate.propertyTypes.commercial')}</SelectItem>
                    <SelectItem value='industrial'>{t('assets.forms.realEstate.propertyTypes.industrial')}</SelectItem>
                    <SelectItem value='land'>{t('assets.forms.realEstate.propertyTypes.land')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='location'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('assets.forms.realEstate.locationLabel')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('assets.forms.realEstate.locationPlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='purchasePrice'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('assets.forms.realEstate.purchasePriceLabel')}</FormLabel>
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
                <FormLabel>{t('assets.forms.realEstate.currentValueLabel')}</FormLabel>
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

        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          <FormField
            control={form.control}
            name='rentalYield'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('assets.forms.realEstate.rentalYieldLabel')}</FormLabel>
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
            name='squareMeters'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('assets.forms.realEstate.squareMetersLabel')}</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    step='1'
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
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('assets.forms.common.currencyPlaceholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='EUR'>EUR</SelectItem>
                    <SelectItem value='USD'>USD</SelectItem>
                    <SelectItem value='GBP'>GBP</SelectItem>
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
              <FormLabel>{t('assets.forms.common.notesLabel')}</FormLabel>
              <FormControl>
                <Textarea placeholder={t('assets.forms.realEstate.notesPlaceholder')} className='resize-none' {...field} />
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
          <Button type='submit'>{t('assets.forms.realEstate.submit')}</Button>
        </div>
      </form>
    </Form>
  )
}


