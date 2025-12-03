import { useQuery } from '@tanstack/react-query'
import { fetchAllCompanies } from '../services/companies-api'
import { type Company } from '../data/schema'

export function useCompanies() {
  return useQuery<Company[]>({
    queryKey: ['companies'],
    queryFn: fetchAllCompanies,
    staleTime: 1000 * 60 * 60, // 1 hora
    gcTime: 1000 * 60 * 60 * 24, // 24 horas (antes cacheTime)
    retry: 2,
    retryDelay: 1000,
  })
}



