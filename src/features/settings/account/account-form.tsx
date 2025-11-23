import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/language-provider'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const languages = [
  { label: 'English', value: 'en' },
  { label: 'Español', value: 'es' },
] as const

export function AccountForm() {
  const { t, language, setLanguage } = useLanguage()
  
  // This can come from your database or API.
  const defaultValues: Partial<any> = {
    username: '',
    name: '',
    email: '',
    language: language,
  }
  
  const accountFormSchema = z.object({
    username: z
      .string()
      .min(2, t('settings.usernameMinError'))
      .max(30, t('settings.usernameMaxError')),
    name: z
      .string()
      .min(1, t('settings.nameRequiredError'))
      .min(2, t('settings.nameMinError'))
      .max(30, t('settings.nameMaxError')),
    email: z.string().email(t('settings.emailSelectError')),
    language: z.string({
      errorMap: () => ({ message: t('settings.languageError') }),
    }),
  })

  type AccountFormValues = z.infer<typeof accountFormSchema>

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues,
  })

  function onSubmit(data: AccountFormValues) {
    // Cambiar el idioma si es diferente
    if (data.language !== language) {
      setLanguage(data.language)
    }
    showSubmittedData(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('settings.username')}</FormLabel>
              <FormControl>
                <Input placeholder={t('settings.usernamePlaceholder')} {...field} />
              </FormControl>
              <FormDescription>
                {t('settings.usernameDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('settings.name')}</FormLabel>
              <FormControl>
                <Input placeholder={t('settings.namePlaceholder')} {...field} />
              </FormControl>
              <FormDescription>
                {t('settings.nameDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('settings.email')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder={t('settings.emailPlaceholder')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value='m@example.com'>m@example.com</SelectItem>
                  <SelectItem value='m@google.com'>m@google.com</SelectItem>
                  <SelectItem value='m@support.com'>m@support.com</SelectItem>
                </SelectContent>
              </Select>
              <FormDescription>
                {t('settings.emailDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='language'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel>{t('settings.language')}</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className='w-[200px]'>
                    <SelectValue placeholder={t('settings.selectLanguage')} />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                {t('settings.languageDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type='submit'>{t('settings.updateAccount')}</Button>
      </form>
    </Form>
  )
}
