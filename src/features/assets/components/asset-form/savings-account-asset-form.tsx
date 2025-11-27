import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { type Asset, AssetType, type SavingsAccountAsset } from '../../types'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useLanguage } from '@/context/language-provider'
import { InitialExpensesField } from './initial-expenses-field'

const savingsAccountSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  bankName: z.string().min(1, 'El banco es obligatorio'),
  interestRate: z.number().min(0).max(15).optional(),
  initialAmount: z.number().min(0).optional(),
  currency: z.string().optional(),
  accountNumber: z.string().optional(),
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

type SavingsAccountFormData = z.infer<typeof savingsAccountSchema>

interface SavingsAccountAssetFormProps {
  onSuccess?: () => void
  onCancel?: () => void
  asset?: SavingsAccountAsset
}

export function SavingsAccountAssetForm({ onSuccess, onCancel, asset }: SavingsAccountAssetFormProps) {
  const queryClient = useQueryClient()
  const { t } = useLanguage()
  const isEditing = Boolean(asset)

  const form = useForm<SavingsAccountFormData>({
    resolver: zodResolver(savingsAccountSchema),
    defaultValues: {
      name: asset?.name ?? '',
      bankName: asset?.bankName ?? '',
      interestRate: asset?.interestRate,
      initialAmount: asset?.initialAmount,
      currency: asset?.currency ?? 'EUR',
      accountNumber: asset?.accountNumber ?? '',
      description: asset?.description ?? '',
      initialExpenses: asset?.initialExpenses ?? [],
    },
  })

  const onSubmit = async (data: SavingsAccountFormData) => {
    try {
      const baseAsset = asset ?? {
        id: `sa${Date.now()}`,
        type: AssetType.SAVINGS_ACCOUNT as const,
      }

      const updatedAsset: SavingsAccountAsset = {
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
        isEditing ? t('assets.forms.common.updated') : t('assets.forms.savingsAccount.success')
      )
      onSuccess?.()
    } catch (error) {
      toast.error(t('assets.forms.savingsAccount.error'))
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
              <FormLabel>{t('assets.forms.savingsAccount.nameLabel')}</FormLabel>
              <FormControl>
                <Input placeholder={t('assets.forms.savingsAccount.namePlaceholder')} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='bankName'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('assets.forms.savingsAccount.bankLabel')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('assets.forms.savingsAccount.bankPlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='accountNumber'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('assets.forms.savingsAccount.accountNumberLabel')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('assets.forms.savingsAccount.accountNumberPlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <InitialExpensesField control={form.control} register={form.register} />

        <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
          <FormField
            control={form.control}
            name='initialAmount'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('assets.forms.savingsAccount.balanceLabel')}</FormLabel>
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
            name='interestRate'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('assets.forms.savingsAccount.interestLabel')}</FormLabel>
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
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('assets.forms.common.notesLabel')}</FormLabel>
              <FormControl>
                <Textarea placeholder={t('assets.forms.savingsAccount.notesPlaceholder')} className='resize-none' {...field} />
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
          <Button type='submit'>{t('assets.forms.savingsAccount.submit')}</Button>
        </div>
      </form>
    </Form>
  )
}


