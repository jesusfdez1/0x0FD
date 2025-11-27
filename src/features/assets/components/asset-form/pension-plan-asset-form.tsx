import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { type Asset, AssetType, type PensionPlanAsset } from '../../types'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useLanguage } from '@/context/language-provider'

const pensionPlanSchema = z.object({
  name: z.string().min(1),
  planType: z.enum(['individual', 'employment', 'associated']),
  provider: z.string().optional(),
  riskProfile: z.enum(['low', 'medium', 'high']).optional(),
  price: z.number().min(0).optional(),
  annualContribution: z.number().min(0).optional(),
  expectedReturn: z.number().min(0).max(100).optional(),
  currency: z.string().optional(),
  description: z.string().optional(),
})

type PensionPlanFormData = z.infer<typeof pensionPlanSchema>

interface PensionPlanAssetFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  asset?: PensionPlanAsset
}

export function PensionPlanAssetForm({ onSuccess, onCancel, asset }: PensionPlanAssetFormProps) {
  const queryClient = useQueryClient()
  const { t } = useLanguage()
  const isEditing = Boolean(asset)

  const form = useForm<PensionPlanFormData>({
    resolver: zodResolver(pensionPlanSchema),
    defaultValues: {
      name: asset?.name ?? '',
      planType: (asset?.planType as PensionPlanFormData['planType']) ?? 'individual',
      provider: asset?.provider ?? '',
      riskProfile: (asset?.riskProfile as PensionPlanFormData['riskProfile']) ?? undefined,
      price: asset?.price,
      annualContribution: asset?.annualContribution,
      expectedReturn: asset?.expectedReturn,
      currency: asset?.currency ?? 'EUR',
      description: asset?.description ?? '',
    },
  })

  const onSubmit = async (data: PensionPlanFormData) => {
    try {
      const baseAsset = asset ?? {
        id: `pp${Date.now()}`,
        type: AssetType.PENSION_PLAN as const,
      }

      const updatedAsset: PensionPlanAsset = {
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
        isEditing ? t('assets.forms.common.updated') : t('assets.forms.pensionPlan.success')
      )
      onSuccess?.()
    } catch (error) {
      toast.error(t('assets.forms.pensionPlan.error'))
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
              <FormLabel>{t('assets.forms.pensionPlan.nameLabel')}</FormLabel>
              <FormControl>
                <Input placeholder={t('assets.forms.pensionPlan.namePlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          <FormField
            control={form.control}
            name='planType'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('assets.forms.pensionPlan.typeLabel')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('assets.forms.common.selectPlaceholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='individual'>{t('assets.forms.pensionPlan.types.individual')}</SelectItem>
                    <SelectItem value='employment'>{t('assets.forms.pensionPlan.types.employment')}</SelectItem>
                    <SelectItem value='associated'>{t('assets.forms.pensionPlan.types.associated')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='provider'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('assets.forms.pensionPlan.providerLabel')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('assets.forms.pensionPlan.providerPlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='riskProfile'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('assets.forms.pensionPlan.riskLabel')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('assets.forms.common.selectPlaceholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='low'>{t('assets.forms.pensionPlan.riskLevels.low')}</SelectItem>
                    <SelectItem value='medium'>{t('assets.forms.pensionPlan.riskLevels.medium')}</SelectItem>
                    <SelectItem value='high'>{t('assets.forms.pensionPlan.riskLevels.high')}</SelectItem>
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
            name='price'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('assets.forms.pensionPlan.currentValueLabel')}</FormLabel>
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
            name='annualContribution'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('assets.forms.pensionPlan.annualContributionLabel')}</FormLabel>
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
            name='expectedReturn'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('assets.forms.pensionPlan.expectedReturnLabel')}</FormLabel>
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
        </div>

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

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('assets.forms.common.notesLabel')}</FormLabel>
              <FormControl>
                <Textarea placeholder={t('assets.forms.pensionPlan.notesPlaceholder')} className='resize-none' {...field} />
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
          <Button type='submit'>{t('assets.forms.pensionPlan.submit')}</Button>
        </div>
      </form>
    </Form>
  )
}


