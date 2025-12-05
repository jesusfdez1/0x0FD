import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useInvestmentData } from '../hooks/use-investment-data'
import { useLanguage } from '@/context/language-provider'
import { Coins, Flame, Scale, TrendingUp, Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function GoldInvestment() {
  const { t } = useLanguage()
  const { goldData, commoditiesData } = useInvestmentData()

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card id="gold-metals">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('investmentLab.ui.gold.metals')}</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {commoditiesData.metals.map((item) => (
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
                  <span className="font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card id="gold-energy">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('investmentLab.ui.gold.energy')}</CardTitle>
            <Flame className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {commoditiesData.energy.map((item) => (
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
                  <span className="font-bold">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card id="gold-drivers">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('investmentLab.ui.gold.drivers')}</CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {goldData.factors.map((item) => (
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
                    <span className="font-bold">{item.value || item.level}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t('investmentLab.ui.gold.overview')}</CardTitle>
          <CardDescription>
            {t('investmentLab.ui.gold.overviewDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('investmentLab.ui.gold.analysis')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
