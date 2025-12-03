import { useQuery } from '@tanstack/react-query'
import { assets } from '../data/assets'
import type { Asset } from '../types'

export function useAssets() {
  return useQuery<Asset[]>({
    queryKey: ['assets'],
    queryFn: async () => {
      // Simular carga asíncrona
      await new Promise((resolve) => setTimeout(resolve, 500))
      return assets
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  })
}


