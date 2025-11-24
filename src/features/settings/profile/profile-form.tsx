import React from 'react'
import { z } from 'zod'
import { useFieldArray, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { showSubmittedData } from '@/lib/show-submitted-data'
import useLocalStorage from '@/hooks/useLocalStorage'
import { cn } from '@/lib/utils'
import { useLanguage } from '@/context/language-provider'
import { Button } from '@/components/ui/button'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'

// This can come from your database or API.
// Default values are derived from the user's saved profile in localStorage (if any).

export function ProfileForm() {
  const { t } = useLanguage()
  
  const profileFormSchema = z.object({
    username: z
      .string()
      .min(2, t('settings.usernameMinError'))
      .max(30, t('settings.usernameMaxError')),
    email: z.string().email(t('settings.emailSelectError')),
    bio: z
      .string()
      .min(4, t('settings.bioMinError'))
      .max(160, t('settings.bioMaxError')),
    urls: z
      .array(
        z.object({
          value: z.string().url(t('settings.urlInvalidError')),
        })
      )
      .optional(),
  })

  type ProfileFormValues = z.infer<typeof profileFormSchema>

  const [profileStored, setProfileStored] = useLocalStorage<ProfileFormValues | null>('user-profile', null)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: profileStored ?? undefined,
    mode: 'onChange',
  })

  const { fields, append } = useFieldArray({
    name: 'urls',
    control: form.control,
  })

  // Keep the form in sync with the value stored in localStorage
  React.useEffect(() => {
    if (profileStored) form.reset(profileStored)
  }, [profileStored])
  

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => {
          showSubmittedData(data)
          try {
            setProfileStored(data)
          } catch (e) {
            console.error('Error saving profile to localStorage', e)
          }
        })}
        className='space-y-8'
      >
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
                {t('settings.emailDescription')}{' '}
                <Link to='/'>{t('settings.emailSettings')}</Link>.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name='bio'
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('settings.bio')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder={t('settings.bioPlaceholder')}
                  className='resize-none'
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {t('settings.bioDescription')}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          {fields.map((field, index) => (
            <FormField
              control={form.control}
              key={field.id}
              name={`urls.${index}.value`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className={cn(index !== 0 && 'sr-only')}>
                    {t('settings.urls')}
                  </FormLabel>
                  <FormDescription className={cn(index !== 0 && 'sr-only')}>
                    {t('settings.urlsDescription')}
                  </FormDescription>
                  <FormControl className={cn(index !== 0 && 'mt-1.5')}>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
          <Button
            type='button'
            variant='outline'
            size='sm'
            className='mt-2'
            onClick={() => append({ value: '' })}
          >
            {t('settings.addUrl')}
          </Button>
        </div>
        <Button type='submit'>{t('settings.updateProfile')}</Button>
      </form>
    </Form>
  )
}
