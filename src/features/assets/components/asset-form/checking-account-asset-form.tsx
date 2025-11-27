import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { AssetType } from '../../types'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useLanguage } from '@/context/language-provider'

const checkingAccountSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  bankName: z.string().min(1, 'El banco es obligatorio'),
  balance: z.number().min(0).optional(),
  currency: z.string().optional(),
  accountNumber: z.string().optional(),
  description: z.string().optional(),
})

type CheckingAccountFormData = z.infer<typeof checkingAccountSchema>

interface CheckingAccountAssetFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function CheckingAccountAssetForm({ onSuccess, onCancel }: CheckingAccountAssetFormProps) {
  const queryClient = useQueryClient()
  const { t } = useLanguage()

  const form = useForm<CheckingAccountFormData>({
    resolver: zodResolver(checkingAccountSchema),
    defaultValues: {
      name: '',
      bankName: '',
      currency: 'EUR',
    },
  })

  const onSubmit = async (data: CheckingAccountFormData) => {
    try {
      const newAsset = {
        id: `ca${Date.now()}`,
        type: AssetType.CHECKING_ACCOUNT,
        ...data,
      }

      queryClient.setQueryData(['assets'], (old: any[]) => [...(old || []), newAsset])
      toast.success(t('assets.forms.checkingAccount.success'))
      onSuccess?.()
    } catch (error) {
      toast.error(t('assets.forms.checkingAccount.error'))
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
              <FormLabel>{t('assets.forms.checkingAccount.nameLabel')}</FormLabel>
              <FormControl>
                <Input placeholder={t('assets.forms.checkingAccount.namePlaceholder')} {...field} />
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
                <FormLabel>{t('assets.forms.checkingAccount.bankLabel')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('assets.forms.checkingAccount.bankPlaceholder')} {...field} />
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
                <FormLabel>{t('assets.forms.checkingAccount.accountNumberLabel')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('assets.forms.checkingAccount.accountNumberPlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='balance'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('assets.forms.checkingAccount.balanceLabel')}</FormLabel>
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
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('assets.forms.common.notesLabel')}</FormLabel>
              <FormControl>
                <Textarea placeholder={t('assets.forms.checkingAccount.notesPlaceholder')} className='resize-none' {...field} />
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
          <Button type='submit'>{t('assets.forms.checkingAccount.submit')}</Button>
        </div>
      </form>
    </Form>
  )
}


