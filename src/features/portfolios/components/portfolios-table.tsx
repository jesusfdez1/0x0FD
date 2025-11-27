import { useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useLanguage } from '@/context/language-provider'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { portfolios as samplePortfolios, type Portfolio } from '../data/portfolios'

type Props = { data?: Portfolio[] }

export function PortfoliosTable({ data = samplePortfolios }: Props) {
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [filter, setFilter] = useState('')

  const filtered = data.filter((p) => p.name.toLowerCase().includes(filter.toLowerCase()))

  return (
    <div className='flex flex-col gap-4'>
      <div className='flex items-center gap-2'>
        <Input placeholder={t('portfolios.description')} value={filter} onChange={(e) => setFilter(e.target.value)} className='h-9 w-full lg:w-[250px]' />
        <Button onClick={() => navigate({ to: '/_authenticated/portfolios/create' } as any)}>{t('portfolios.create')}</Button>
      </div>
      <ul className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        {filtered.map((p) => (
          <li key={p.id} className='rounded-lg border p-4 hover:shadow-md'>
            <div className='mb-2 flex items-center justify-between'>
              <h3 className='font-semibold'>{p.name}</h3>
            </div>
            <p className='line-clamp-2 text-muted-foreground'>{p.description}</p>
            <div className='mt-4 flex gap-4 text-sm text-muted-foreground'>
              {p.companies.length > 0 && <span>{p.companies.length} empresas</span>}
              {p.assets && p.assets.length > 0 && <span>{p.assets.length} activos</span>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
