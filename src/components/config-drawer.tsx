import { type SVGProps } from 'react'
import { Root as Radio, Item } from '@radix-ui/react-radio-group'
import { CircleCheck, RotateCcw, Settings } from 'lucide-react'
import { IconLayoutCompact } from '@/assets/custom/icon-layout-compact'
import { IconLayoutDefault } from '@/assets/custom/icon-layout-default'
import { IconLayoutFull } from '@/assets/custom/icon-layout-full'
import { IconSidebarFloating } from '@/assets/custom/icon-sidebar-floating'
import { IconSidebarInset } from '@/assets/custom/icon-sidebar-inset'
import { IconSidebarSidebar } from '@/assets/custom/icon-sidebar-sidebar'
import { IconThemeDark } from '@/assets/custom/icon-theme-dark'
import { IconThemeLight } from '@/assets/custom/icon-theme-light'
import { IconThemeSystem } from '@/assets/custom/icon-theme-system'
import { cn } from '@/lib/utils'
import { type Collapsible, useLayout } from '@/context/layout-provider'
import { useTheme } from '@/context/theme-provider'
import { Button } from '@/components/ui/button'
import { showSubmittedData } from '@/lib/show-submitted-data'
import useExportImport from '@/hooks/useExportImport'
import { ConfirmDialog } from './confirm-dialog'
import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useSidebar } from './ui/sidebar'

export function ConfigDrawer() {
  const { setOpen } = useSidebar()
  const { resetTheme } = useTheme()
  const { resetLayout } = useLayout()

  const handleReset = () => {
    setOpen(true)
    resetTheme()
    resetLayout()
  }

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size='icon'
          variant='ghost'
          aria-label='Open theme settings'
          aria-describedby='config-drawer-description'
          className='rounded-full'
        >
          <Settings aria-hidden='true' />
        </Button>
      </SheetTrigger>
      <SheetContent className='flex flex-col min-h-0'>
        <SheetHeader className='pb-0 text-start'>
          <SheetTitle>Theme Settings</SheetTitle>
          <SheetDescription id='config-drawer-description'>
            Adjust the appearance and layout to suit your preferences.
          </SheetDescription>
        </SheetHeader>
        <div className='space-y-6 overflow-y-auto px-4 min-h-0'>
          <ThemeConfig />
          <SidebarConfig />
          <LayoutConfig />
          <ExportImportSection />
        </div>
        <SheetFooter className='gap-2'>
          <Button
            variant='destructive'
            onClick={handleReset}
            aria-label='Reset all settings to default values'
          >
            Reset
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

function SectionTitle({
  title,
  showReset = false,
  onReset,
  className,
}: {
  title: string
  showReset?: boolean
  onReset?: () => void
  className?: string
}) {
  return (
    <div
      className={cn(
        'text-muted-foreground mb-2 flex items-center gap-2 text-sm font-semibold',
        className
      )}
    >
      {title}
      {showReset && onReset && (
        <Button
          size='icon'
          variant='secondary'
          className='size-4 rounded-full'
          onClick={onReset}
        >
          <RotateCcw className='size-3' />
        </Button>
      )}
    </div>
  )
}

function RadioGroupItem({
  item,
  isTheme = false,
  showLabel = true,
}: {
  item: {
    value: string
    label: string
    icon: (props: SVGProps<SVGSVGElement>) => React.ReactElement
  }
  isTheme?: boolean
  showLabel?: boolean
}) {
    return (
      <Item
        value={item.value}
      className={cn('group outline-none', 'transition duration-200 ease-in')}
      aria-label={`Select ${item.label.toLowerCase()}`}
      aria-describedby={`${item.value}-description`}
    >
      <div
        className={cn(
          'w-full p-1 rounded-xl border-2 transition-all',
          'group-data-[state=checked]:border-primary group-data-[state=checked]:bg-primary/50',
          'border-border hover:border-secondary/50 hover:bg-secondary/20'
        )}
        role='img'
        aria-hidden='false'
        aria-label={`${item.label} option preview`}
      >
        <div className='aspect-video w-full overflow-hidden rounded-lg flex items-center justify-center p-1' style={{ backgroundColor: 'var(--secondary)' }}>
              <CircleCheck
                className={cn(
                  'fill-primary size-6 stroke-white absolute top-0 right-0 translate-x-1/2 -translate-y-1/2',
                  'group-data-[state=unchecked]:hidden'
                )}
                aria-hidden='true'
              />
              <item.icon
                className={cn(
                  !isTheme &&
                    'stroke-primary fill-primary group-data-[state=unchecked]:stroke-muted-foreground group-data-[state=unchecked]:fill-muted-foreground',
                  isTheme ? 'h-4 w-4' : 'w-36 h-36'
                )}
            aria-hidden='true'
          />
        </div>
      </div>
      <div className='mt-2 text-xs text-center' id={`${item.value}-description`} aria-live='polite'>
        {showLabel && (
          <div className='mt-2 text-xs' id={`${item.value}-description`} aria-live='polite'>
            {item.label}
          </div>
        )}
      </div>
    </Item>
  )
}

function ThemeConfig() {
  const { defaultTheme, theme, setTheme } = useTheme()
  return (
    <div>
      <SectionTitle
        title='Theme'
        showReset={theme !== defaultTheme}
        onReset={() => setTheme(defaultTheme)}
      />
      <Radio
        value={theme}
        onValueChange={setTheme}
        className='grid w-full max-w-lg grid-cols-3 gap-6'
        aria-label='Select theme preference'
        aria-describedby='theme-description'
      >
        {[
          {
            value: 'system',
            label: 'System',
            icon: IconThemeSystem,
          },
          {
            value: 'light',
            label: 'Light',
            icon: IconThemeLight,
          },
          {
            value: 'dark',
            label: 'Dark',
            icon: IconThemeDark,
          },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} isTheme />
        ))}
      </Radio>
      <div id='theme-description' className='sr-only'>
        Choose between system preference, light mode, or dark mode
      </div>
    </div>
  )
}

function SidebarConfig() {
  const { defaultVariant, variant, setVariant } = useLayout()
  return (
    <div className='max-md:hidden'>
      <SectionTitle
        title='Sidebar'
        showReset={defaultVariant !== variant}
        onReset={() => setVariant(defaultVariant)}
      />
      <Radio
        value={variant}
        onValueChange={setVariant}
        className='grid w-full max-w-lg grid-cols-3 gap-6'
        aria-label='Select sidebar style'
        aria-describedby='sidebar-description'
      >
        {[
          {
            value: 'inset',
            label: 'Inset',
            icon: IconSidebarInset,
          },
          {
            value: 'floating',
            label: 'Floating',
            icon: IconSidebarFloating,
          },
          {
            value: 'sidebar',
            label: 'Sidebar',
            icon: IconSidebarSidebar,
          },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} showLabel={false} />
        ))}
      </Radio>
      <div id='sidebar-description' className='sr-only'>
        Choose between inset, floating, or standard sidebar layout
      </div>
    </div>
  )
}

function LayoutConfig() {
  const { open, setOpen } = useSidebar()
  const { defaultCollapsible, collapsible, setCollapsible } = useLayout()

  const radioState = open ? 'default' : collapsible

  return (
    <div className='max-md:hidden'>
      <SectionTitle
        title='Layout'
        showReset={radioState !== 'default'}
        onReset={() => {
          setOpen(true)
          setCollapsible(defaultCollapsible)
        }}
      />
      <Radio
        value={radioState}
        onValueChange={(v) => {
          if (v === 'default') {
            setOpen(true)
            return
          }
          setOpen(false)
          setCollapsible(v as Collapsible)
        }}
        className='grid w-full max-w-md grid-cols-3 gap-4'
        aria-label='Select layout style'
        aria-describedby='layout-description'
      >
        {[
          {
            value: 'default',
            label: 'Default',
            icon: IconLayoutDefault,
          },
          {
            value: 'icon',
            label: 'Compact',
            icon: IconLayoutCompact,
          },
          {
            value: 'offcanvas',
            label: 'Full layout',
            icon: IconLayoutFull,
          },
        ].map((item) => (
          <RadioGroupItem key={item.value} item={item} showLabel={false} />
        ))}
      </Radio>
      <div id='layout-description' className='sr-only'>
        Choose between default expanded, compact icon-only, or full layout mode
      </div>
    </div>
  )
}

function ExportImportSection() {
  const { exportAll, parseFile, importAll } = useExportImport('0x0FD')
  const [openConfirm, setOpenConfirm] = useState(false)
  const [pendingPayload, setPendingPayload] = useState<any | null>(null)
  const [overwrite, setOverwrite] = useState(false)

  const onExportClick = () => {
    const payload = exportAll()
    showSubmittedData(payload, 'Export process: Completed')
  }

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const parsed = await parseFile(file)
      setPendingPayload(parsed)
      showSubmittedData(parsed, 'Preview of imported data')
      // ask user whether they want overwrite or merge via confirm.
      setOpenConfirm(true)
    } catch (err) {
      console.error('Error parsing import file', err)
      alert('Invalid JSON file')
    } finally {
      e.currentTarget.value = ''
    }
  }

  const handleConfirmImport = async () => {
    if (!pendingPayload) return
    await importAll(pendingPayload, { overwrite })
    setOpenConfirm(false)
    setPendingPayload(null)
    showSubmittedData(pendingPayload, 'Import completed: new data applied')
  }

  return (
    <div>
      <SectionTitle title='Export & Import' />
      <div className='flex items-center gap-2'>
        <Button variant='secondary' size='icon' onClick={onExportClick}>Export</Button>
        <label className='w-full'>
          <input
            type='file'
            accept='.json,application/json'
            onChange={onFileChange}
            className='hidden'
          />
          <Button variant='outline' className='ms-2'>Import</Button>
        </label>
      </div>
      <ConfirmDialog
        open={openConfirm}
        onOpenChange={setOpenConfirm}
        title='Import app data'
        desc={<span>Do you want to overwrite all existing data? Uncheck to merge.</span>}
        confirmText='Import'
        cancelBtnText='Cancel'
        destructive={false}
        handleConfirm={handleConfirmImport}
      >
        <div className='mt-2 flex items-center gap-2'>
          <label className='inline-flex items-center gap-2'>
            <input type='checkbox' checked={overwrite} onChange={(e) => setOverwrite(e.target.checked)} className='form-checkbox' />
            <span>Overwrite all existing data</span>
          </label>
        </div>
      </ConfirmDialog>
    </div>
  )
}

