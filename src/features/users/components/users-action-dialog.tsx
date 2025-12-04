'use client'

import { useMemo } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { showSubmittedData } from '@/lib/show-submitted-data'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/password-input'
import { SelectDropdown } from '@/components/select-dropdown'
import { useLanguage } from '@/context/language-provider'
import { roles } from '../data/data'
import { type User } from '../data/schema'

type Translate = (key: string) => string

const createFormSchema = (t: Translate) =>
  z
    .object({
      firstName: z
        .string()
        .trim()
        .min(1, { message: t('users.validation.firstNameRequired') }),
      lastName: z
        .string()
        .trim()
        .min(1, { message: t('users.validation.lastNameRequired') }),
      username: z
        .string()
        .trim()
        .min(1, { message: t('users.validation.usernameRequired') }),
      phoneNumber: z
        .string()
        .trim()
        .min(1, { message: t('users.validation.phoneRequired') }),
      email: z
        .string()
        .trim()
        .min(1, { message: t('users.validation.emailRequired') })
        .email({ message: t('users.validation.emailInvalid') }),
      password: z.string().trim(),
      role: z
        .string()
        .trim()
        .min(1, { message: t('users.validation.roleRequired') }),
      confirmPassword: z.string().trim(),
      isEdit: z.boolean(),
    })
    .superRefine(({ isEdit, password, confirmPassword }, ctx) => {
      if (isEdit && password.length === 0) {
        return
      }

      if (password.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('users.validation.passwordRequired'),
          path: ['password'],
        })
        return
      }

      if (password.length < 8) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('users.validation.passwordMinLength'),
          path: ['password'],
        })
      }

      if (!/[a-z]/.test(password)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('users.validation.passwordLowercase'),
          path: ['password'],
        })
      }

      if (!/\d/.test(password)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('users.validation.passwordNumber'),
          path: ['password'],
        })
      }

      if (password !== confirmPassword) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('users.validation.passwordMismatch'),
          path: ['confirmPassword'],
        })
      }
    })

type UserForm = z.infer<ReturnType<typeof createFormSchema>>

type UserActionDialogProps = {
  currentRow?: User
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function UsersActionDialog({
  currentRow,
  open,
  onOpenChange,
}: UserActionDialogProps) {
  const { t } = useLanguage()
  const isEdit = !!currentRow
  const formSchema = useMemo(() => createFormSchema(t), [t])
  const form = useForm<UserForm>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          ...currentRow,
          password: '',
          confirmPassword: '',
          isEdit,
        }
      : {
          firstName: '',
          lastName: '',
          username: '',
          email: '',
          role: '',
          phoneNumber: '',
          password: '',
          confirmPassword: '',
          isEdit,
        },
  })

  const onSubmit = (values: UserForm) => {
    form.reset()
    showSubmittedData(values)
    onOpenChange(false)
  }

  const isPasswordTouched = !!form.formState.dirtyFields.password

  return (
    <Dialog
      open={open}
      onOpenChange={(state) => {
        form.reset()
        onOpenChange(state)
      }}
    >
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader className='text-start'>
          <DialogTitle>
            {isEdit
              ? t('users.forms.action.editTitle')
              : t('users.forms.action.addTitle')}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? t('users.forms.action.editDescription')
              : t('users.forms.action.addDescription')}
          </DialogDescription>
        </DialogHeader>
        <div className='h-[26.25rem] w-[calc(100%+0.75rem)] overflow-y-auto py-1 pe-3'>
          <Form {...form}>
            <form
              id='user-form'
              onSubmit={form.handleSubmit(onSubmit)}
              className='space-y-4 px-0.5'
            >
              <FormField
                control={form.control}
                name='firstName'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      {t('users.forms.action.firstNameLabel')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('users.forms.action.firstNamePlaceholder')}
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='lastName'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      {t('users.forms.action.lastNameLabel')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('users.forms.action.lastNamePlaceholder')}
                        className='col-span-4'
                        autoComplete='off'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='username'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      {t('users.forms.action.usernameLabel')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('users.forms.action.usernamePlaceholder')}
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='email'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      {t('users.forms.action.emailLabel')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('users.forms.action.emailPlaceholder')}
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='phoneNumber'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      {t('users.forms.action.phoneLabel')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t('users.forms.action.phonePlaceholder')}
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='role'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      {t('users.forms.action.roleLabel')}
                    </FormLabel>
                    <SelectDropdown
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                      placeholder={t('users.forms.action.rolePlaceholder')}
                      className='col-span-4'
                      items={roles.map(({ labelKey, value }) => ({
                        label: t(labelKey),
                        value,
                      }))}
                    />
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='password'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      {t('users.forms.action.passwordLabel')}
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder={t('users.forms.action.passwordPlaceholder')}
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name='confirmPassword'
                render={({ field }) => (
                  <FormItem className='grid grid-cols-6 items-center space-y-0 gap-x-4 gap-y-1'>
                    <FormLabel className='col-span-2 text-end'>
                      {t('users.forms.action.confirmPasswordLabel')}
                    </FormLabel>
                    <FormControl>
                      <PasswordInput
                        disabled={!isPasswordTouched}
                        placeholder={t('users.forms.action.confirmPasswordPlaceholder')}
                        className='col-span-4'
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className='col-span-4 col-start-3' />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>
        <DialogFooter>
          <Button type='submit' form='user-form'>
            {t('users.forms.action.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
