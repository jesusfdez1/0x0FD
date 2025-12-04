import { createFileRoute } from '@tanstack/react-router'
import InvestmentLab from '@/features/investment-lab'

export const Route = createFileRoute('/_authenticated/investment-lab/')({
  component: InvestmentLab,
})
