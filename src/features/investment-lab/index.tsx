import { MarketSentiment } from './components/market-sentiment'
import { AIInsights } from './components/ai-insights'
import { OpportunityScreener } from './components/opportunity-screener'
import { InvestmentGuide } from './components/investment-guide'
import { Button } from '@/components/ui/button'
import { Download, Filter } from 'lucide-react'
import { useLanguage } from '@/context/language-provider'

export default function InvestmentLab() {
  const { t } = useLanguage()
  return (
    <div className="space-y-6 p-6 pb-16 relative">
      <InvestmentGuide />
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('investmentLab.title')}</h1>
          <p className="text-muted-foreground mt-1">
            {t('investmentLab.description')}
          </p>
        </div>
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                {t('investmentLab.dashboard.customize')}
            </Button>
            <Button size="sm">
                <Download className="w-4 h-4 mr-2" />
                {t('investmentLab.dashboard.export')}
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Top Row: Sentiment & Insights */}
        <div id="market-sentiment" className="col-span-1">
            <MarketSentiment />
        </div>
        <div className="hidden lg:block lg:col-span-1">
            {/* Placeholder for another widget, maybe a mini-chart or news feed */}
            <div className="h-full rounded-xl border bg-card text-card-foreground shadow p-6 flex flex-col justify-center items-center text-center space-y-2">
                <h3 className="font-semibold">{t('investmentLab.dashboard.healthCheck')}</h3>
                <p className="text-sm text-muted-foreground">{t('investmentLab.dashboard.connectText')}</p>
                <Button variant="secondary" className="mt-2">{t('investmentLab.dashboard.connectButton')}</Button>
            </div>
        </div>
        <div id="ai-insights" className="col-span-1 md:col-span-2 lg:col-span-1 h-full">
            <AIInsights />
        </div>
        
        {/* Middle Row: Screener */}
        <div id="opportunity-screener" className="col-span-1 md:col-span-2 lg:col-span-3">
            <OpportunityScreener />
        </div>
      </div>
    </div>
  )
}
