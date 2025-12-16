import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/companies/$ticker')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authenticated/companies/$ticker"!</div>
}
