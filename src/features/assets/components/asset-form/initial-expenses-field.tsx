import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useLanguage } from '@/context/language-provider'
import { cn } from '@/lib/utils'
import { Trash2 } from 'lucide-react'
import { type Control, type UseFormRegister, useFieldArray } from 'react-hook-form'

interface InitialExpensesFieldProps {
  control: Control<any>
  register: UseFormRegister<any>
  className?: string
}

export function InitialExpensesField({ control, register, className }: InitialExpensesFieldProps) {
  const { t } = useLanguage()
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'initialExpenses',
  })

  return (
    <div className={cn('space-y-3', className)}>
      <div>
        <Label>{t('assets.forms.common.initialExpenses.title')}</Label>
        <p className='text-xs text-muted-foreground'>
          {t('assets.forms.common.initialExpenses.description')}
        </p>
      </div>

      {fields.length === 0 && (
        <p className='text-xs text-muted-foreground'>
          {t('assets.forms.common.initialExpenses.empty')}
        </p>
      )}

      <div className='space-y-2'>
        {fields.map((field, index) => (
          <div key={field.id} className='flex flex-wrap items-center gap-2'>
            <Input
              className='flex-1 min-w-[140px]'
              placeholder={t('assets.forms.common.initialExpenses.placeholderLabel')}
              {...register(`initialExpenses.${index}.label` as const)}
            />
            <Input
              className='w-36'
              type='number'
              step='0.01'
              placeholder={t('assets.forms.common.initialExpenses.placeholderAmount')}
              {...register(`initialExpenses.${index}.amount` as const, { valueAsNumber: true })}
            />
            <Button
              type='button'
              variant='ghost'
              size='icon'
              onClick={() => remove(index)}
              aria-label={t('assets.forms.common.initialExpenses.remove')}
            >
              <Trash2 className='h-4 w-4' />
            </Button>
          </div>
        ))}
      </div>

      <Button
        type='button'
        variant='outline'
        size='sm'
        onClick={() => append({ label: '', amount: 0 })}
      >
        {t('assets.forms.common.initialExpenses.add')}
      </Button>
    </div>
  )
}


