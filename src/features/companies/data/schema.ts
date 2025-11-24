import { z } from 'zod'

const companySchema = z.object({
  id: z.string(),
  name: z.string(),
  ticker: z.string(),
  region: z.string(),
  market: z.string(),
  sector: z.string().optional(),
})

export type Company = z.infer<typeof companySchema>
export const companyListSchema = z.array(companySchema)
