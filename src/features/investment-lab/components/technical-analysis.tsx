import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useInvestmentData } from '../hooks/use-investment-data'
import { useLanguage } from '@/context/language-provider'
import { LineChart, BarChart, Activity, Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function TechnicalAnalysis() {
  const { t } = useLanguage()
  const { technicalData } = useInvestmentData()

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card id="technical-trend">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('investmentLab.ui.technical.trend')}</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {technicalData.trend.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.name}</span>
                      <TooltipProvider>
                          <Tooltip>
                              <TooltipTrigger>
                                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                                <TooltipContent>
                                    <p className="max-w-xs text-xs whitespace-pre-line">{item.description}</p>
                                </TooltipContent>
                          </Tooltip>
                      </TooltipProvider>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-bold">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card id="technical-momentum">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('investmentLab.ui.technical.momentum')}</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {technicalData.momentum.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.name}</span>
                      <TooltipProvider>
                          <Tooltip>
                              <TooltipTrigger>
                                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                  <p className="max-w-xs text-xs">{item.description}</p>
                              </TooltipContent>
                          </Tooltip>
                      </TooltipProvider>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-bold">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card id="technical-volatility">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('investmentLab.ui.technical.volatility')}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {technicalData.volatility.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{item.name}</span>
                      <TooltipProvider>
                          <Tooltip>
                              <TooltipTrigger>
                                  <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent>
                                  <p className="max-w-xs text-xs">{item.description}</p>
                              </TooltipContent>
                          </Tooltip>
                      </TooltipProvider>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-2xl font-bold">{item.current || item.price}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t('investmentLab.ui.technical.overview')}</CardTitle>
          <CardDescription>
            {t('investmentLab.ui.technical.overviewDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('investmentLab.ui.technical.analysis')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
