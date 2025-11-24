import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { Trash2, CircleArrowUp, ArrowUpDown, Download } from 'lucide-react'
import { toast } from 'sonner'
import { sleep } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/context/language-provider'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { DataTableBulkActions as BulkActionsToolbar } from '@/components/data-table'
import { priorities, statuses } from '../data/data'
import { type Task } from '../data/schema'
import { TasksMultiDeleteDialog } from './tasks-multi-delete-dialog'

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const { t } = useLanguage()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const handleBulkStatusChange = (status: string) => {
    const selectedTasks = selectedRows.map((row) => row.original as Task)
    toast.promise(sleep(2000), {
      loading: t('common.updatingStatusLoading'),
      success: () => {
        table.resetRowSelection()
        return t('common.updatedStatusSuccess')
          .replace('{status}', `${status}`)
          .replace('{count}', `${selectedTasks.length}`)
      },
      error: t('common.updatingStatusError'),
    })
    table.resetRowSelection()
  }

  const handleBulkPriorityChange = (priority: string) => {
    const selectedTasks = selectedRows.map((row) => row.original as Task)
    toast.promise(sleep(2000), {
      loading: t('common.updatingPriorityLoading'),
      success: () => {
        table.resetRowSelection()
        return t('common.updatedPrioritySuccess')
          .replace('{priority}', `${priority}`)
          .replace('{count}', `${selectedTasks.length}`)
      },
      error: t('common.updatingPriorityError'),
    })
    table.resetRowSelection()
  }

  const handleBulkExport = () => {
    const selectedTasks = selectedRows.map((row) => row.original as Task)
    toast.promise(sleep(2000), {
      loading: t('common.exportingTasksLoading'),
      success: () => {
        table.resetRowSelection()
        return t('common.exportingTasksSuccess').replace('{count}', `${selectedTasks.length}`)
      },
      error: t('common.exportingTasksError'),
    })
    table.resetRowSelection()
  }

  return (
    <>
      <BulkActionsToolbar table={table} entityName='task'>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  className='size-8'
                  aria-label={t('common.updateStatus')}
                  title={t('common.updateStatus')}
                >
                  <CircleArrowUp />
                  <span className='sr-only'>{t('common.updateStatus')}</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('common.updateStatus')}</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent sideOffset={14}>
            {statuses.map((status) => (
              <DropdownMenuItem
                key={status.value}
                defaultValue={status.value}
                onClick={() => handleBulkStatusChange(status.value)}
              >
                {status.icon && (
                  <status.icon className='text-muted-foreground size-4' />
                )}
                {status.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  className='size-8'
                  aria-label={t('common.updatePriority')}
                  title={t('common.updatePriority')}
                >
                  <ArrowUpDown />
                  <span className='sr-only'>{t('common.updatePriority')}</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t('common.updatePriority')}</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent sideOffset={14}>
            {priorities.map((priority) => (
              <DropdownMenuItem
                key={priority.value}
                defaultValue={priority.value}
                onClick={() => handleBulkPriorityChange(priority.value)}
              >
                {priority.icon && (
                  <priority.icon className='text-muted-foreground size-4' />
                )}
                {priority.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              size='icon'
              onClick={() => handleBulkExport()}
              className='size-8'
                aria-label={t('common.exportTasks')}
              title={t('common.exportTasks')}
            >
              <Download />
              <span className='sr-only'>{t('common.exportTasks')}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('common.exportTasks')}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label={t('common.deleteSelectedTasks')}
              title={t('common.deleteSelectedTasks')}
            >
              <Trash2 />
              <span className='sr-only'>{t('common.deleteSelectedTasks')}</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t('common.deleteSelectedTasks')}</p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <TasksMultiDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        table={table}
      />
    </>
  )
}
