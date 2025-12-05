import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useInvestmentData } from '../hooks/use-investment-data'
import { useLanguage } from '@/context/language-provider'
import { Activity, AlertTriangle, TrendingUp, Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipContentMultiline,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function MarketHealth() {
  const { t } = useLanguage()
  const { marketHealthData } = useInvestmentData()

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card id="market-valuation">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('investmentLab.ui.marketHealth.valuation')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {marketHealthData.valuation.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{item.name}</span>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContentMultiline>
                                    <p>{item.description}</p>
                                </TooltipContentMultiline>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <span className="font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card id="market-sentiment-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('investmentLab.ui.marketHealth.sentiment')}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {marketHealthData.sentiment.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{item.name}</span>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContentMultiline>
                                    <p>{item.description}</p>
                                </TooltipContentMultiline>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <span className="font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card id="market-credit">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('investmentLab.ui.marketHealth.credit')}</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {marketHealthData.credit.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{item.name}</span>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                                </TooltipTrigger>
                                <TooltipContentMultiline>
                                    <p>{item.description}</p>
                                </TooltipContentMultiline>
                            </Tooltip>
                        </TooltipProvider>
                    </div>
                    <span className="font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t('investmentLab.ui.marketHealth.overview')}</CardTitle>
          <CardDescription>
            {t('investmentLab.ui.marketHealth.overviewDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('investmentLab.ui.marketHealth.analysis')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
