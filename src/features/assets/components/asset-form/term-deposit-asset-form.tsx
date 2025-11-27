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

const termDepositSchema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  bankName: z.string().min(1, 'El banco es obligatorio'),
  initialAmount: z.number().min(0, 'Importe requerido'),
  interestRate: z.number().min(0).max(20),
  maturityDate: z.string().min(1, 'Fecha requerida'),
  depositType: z.enum(['fixed', 'variable']).optional(),
  currency: z.string().optional(),
  description: z.string().optional(),
})

type TermDepositFormData = z.infer<typeof termDepositSchema>

interface TermDepositAssetFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export function TermDepositAssetForm({ onSuccess, onCancel }: TermDepositAssetFormProps) {
  const queryClient = useQueryClient()
  const { t } = useLanguage()

  const form = useForm<TermDepositFormData>({
    resolver: zodResolver(termDepositSchema),
    defaultValues: {
      name: '',
      bankName: '',
      initialAmount: 0,
      interestRate: 2,
      maturityDate: '',
      depositType: 'fixed',
      currency: 'EUR',
    },
  })

  const onSubmit = async (data: TermDepositFormData) => {
    try {
      const newAsset = {
        id: `td${Date.now()}`,
        type: AssetType.TERM_DEPOSIT,
        ...data,
        maturityDate: new Date(data.maturityDate),
      }

      queryClient.setQueryData(['assets'], (old: any[]) => [...(old || []), newAsset])
      toast.success(t('assets.forms.termDeposit.success'))
      onSuccess?.()
    } catch (error) {
      toast.error(t('assets.forms.termDeposit.error'))
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
              <FormLabel>{t('assets.forms.termDeposit.nameLabel')}</FormLabel>
              <FormControl>
                <Input placeholder={t('assets.forms.termDeposit.namePlaceholder')} {...field} />
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
                <FormLabel>{t('assets.forms.termDeposit.bankLabel')}</FormLabel>
                <FormControl>
                  <Input placeholder={t('assets.forms.termDeposit.bankPlaceholder')} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='depositType'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('assets.forms.termDeposit.depositTypeLabel')}</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={t('assets.forms.common.selectPlaceholder')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value='fixed'>{t('assets.forms.termDeposit.depositTypes.fixed')}</SelectItem>
                    <SelectItem value='variable'>{t('assets.forms.termDeposit.depositTypes.variable')}</SelectItem>
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
            name='initialAmount'
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('assets.forms.termDeposit.amountLabel')}</FormLabel>
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
                <FormLabel>{t('assets.forms.termDeposit.interestLabel')}</FormLabel>
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
          name='maturityDate'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('assets.forms.termDeposit.maturityDateLabel')}</FormLabel>
              <FormControl>
                <Input type='date' {...field} />
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
                <Textarea placeholder={t('assets.forms.termDeposit.notesPlaceholder')} className='resize-none' {...field} />
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
          <Button type='submit'>{t('assets.forms.termDeposit.submit')}</Button>
        </div>
      </form>
    </Form>
  )
}


