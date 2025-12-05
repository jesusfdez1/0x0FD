import { useState } from 'react'
import { useLanguage } from '@/context/language-provider'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { Search } from '@/components/search'

// Existing components
import { MarketSentiment } from './components/market-sentiment'
import { AIInsights } from './components/ai-insights'
import { OpportunityScreener } from './components/opportunity-screener'
import { InvestmentGuide } from './components/investment-guide'
import { InvestmentWizard } from './components/investment-wizard'

// New components
import { FundamentalAnalysis } from './components/fundamental-analysis'
import { TechnicalAnalysis } from './components/technical-analysis'
import { MacroeconomicIndicators } from './components/macroeconomic-indicators'
import { GoldInvestment } from './components/gold-investment'
import { MLModels } from './components/ml-models'
import { MarketHealth } from './components/market-health'

export default function InvestmentLab() {
  const { t } = useLanguage()
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <>
      <Header fixed>
        <Search />
      </Header>

      <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
        <div className='flex flex-wrap items-end justify-between gap-2'>
          <div>
            <h2 className='text-2xl font-bold tracking-tight'>{t('investmentLab.title')}</h2>
            <p className='text-muted-foreground'>
              {t('investmentLab.description')}
            </p>
          </div>
          <div className='flex items-center space-x-2'>
            <Button>{t('investmentLab.dashboard.export')}</Button>
          </div>
        </div>

        <Tabs
          orientation='vertical'
          defaultValue='overview'
          value={activeTab}
          onValueChange={setActiveTab}
          className='space-y-4'
        >
          <div className='w-full overflow-x-auto pb-2'>
            <TabsList>
              <TabsTrigger value='overview'>{t('investmentLab.tabs.overview')}</TabsTrigger>
              <TabsTrigger value='market-health'>Market Health</TabsTrigger>
              <TabsTrigger value='macro'>{t('investmentLab.tabs.macro')}</TabsTrigger>
              <TabsTrigger value='fundamental'>{t('investmentLab.tabs.fundamental')}</TabsTrigger>
              <TabsTrigger value='technical'>{t('investmentLab.tabs.technical')}</TabsTrigger>
              <TabsTrigger value='gold'>{t('investmentLab.tabs.gold')}</TabsTrigger>
              <TabsTrigger value='ml-models'>{t('investmentLab.tabs.mlModels')}</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value='overview' className='space-y-4'>
             <div className="space-y-6">
                <InvestmentWizard />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="col-span-1">
                        <MarketSentiment />
                    </div>
                    <div className="col-span-1 md:col-span-2 lg:col-span-1 h-full">
                        <AIInsights />
                    </div>
                    <div className="col-span-1 md:col-span-2 lg:col-span-3">
                        <OpportunityScreener />
                    </div>
                </div>
             </div>
          </TabsContent>

          <TabsContent value='market-health' className='space-y-4'>
            <MarketHealth />
          </TabsContent>

          <TabsContent value='macro' className='space-y-4'>
            <MacroeconomicIndicators />
          </TabsContent>

          <TabsContent value='fundamental' className='space-y-4'>
            <FundamentalAnalysis />
          </TabsContent>

          <TabsContent value='technical' className='space-y-4'>
            <TechnicalAnalysis />
          </TabsContent>

          <TabsContent value='gold' className='space-y-4'>
            <GoldInvestment />
          </TabsContent>
          <TabsContent value='ml-models' className='space-y-4'>
            <MLModels />
          </TabsContent>
        </Tabs>

        <InvestmentGuide activeTab={activeTab} />
      </Main>
    </>
  )
}
