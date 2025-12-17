import { createFileRoute } from '@tanstack/react-router'
import { CompanyDetail } from '@/features/companies/company-detail'

export const Route = createFileRoute('/_authenticated/companies/$ticker')({
  component: RouteComponent,
})

function RouteComponent() {
  const { ticker } = Route.useParams()
  return <CompanyDetail ticker={ticker} />
}
