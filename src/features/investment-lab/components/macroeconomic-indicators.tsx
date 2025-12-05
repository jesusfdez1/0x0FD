import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useInvestmentData } from '../hooks/use-investment-data'
import { useLanguage } from '@/context/language-provider'
import { Globe, TrendingUp, Building2, Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipContentMultiline,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function MacroeconomicIndicators() {
  const { t } = useLanguage()
  const { macroData } = useInvestmentData()

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-3">
        <Card id="macro-usa">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('investmentLab.ui.macro.usa')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {macroData.usa.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.name}</span>
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
        <Card id="macro-eurozone">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('investmentLab.ui.macro.eurozone')}</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {macroData.eurozone.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.name}</span>
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
        <Card id="macro-china">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('investmentLab.ui.macro.china')}</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {macroData.china.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{item.name}</span>
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
          <CardTitle>{t('investmentLab.ui.macro.overview')}</CardTitle>
          <CardDescription>
            {t('investmentLab.ui.macro.overviewDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {t('investmentLab.ui.macro.analysis')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
