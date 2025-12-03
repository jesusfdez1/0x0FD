import { createFileRoute } from '@tanstack/react-router'
import { Assets } from '@/features/assets'

export const Route = createFileRoute('/_authenticated/assets/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <Assets />
}


