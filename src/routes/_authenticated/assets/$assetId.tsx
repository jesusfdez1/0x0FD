import { createFileRoute } from '@tanstack/react-router'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'
import { AssetDetail } from '@/features/assets/components/asset-detail'

export const Route = createFileRoute('/_authenticated/assets/$assetId')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <Header fixed>
        <Search />
      </Header>
      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <AssetDetail />
      </Main>
    </>
  )
}
