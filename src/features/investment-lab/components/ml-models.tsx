import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useInvestmentData } from '../hooks/use-investment-data'
import { useLanguage } from '@/context/language-provider'
import { Brain, GitBranch, Activity, Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipContentMultiline,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function MLModels() {
  const { t } = useLanguage()
  const { mlModels } = useInvestmentData()

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Card id="ml-classification">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('investmentLab.ui.ml.classification')}</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {mlModels.classification.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                      <span className="font-semibold">{item.name}</span>
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
                  <span className="text-sm font-bold text-primary">{item.accuracy} Acc.</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card id="ml-timeseries">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('investmentLab.ui.ml.timeseries')}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {mlModels.timeSeries.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                      <span className="font-semibold">{item.name}</span>
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
                  <span className="text-sm font-bold text-primary">
                      {item.r2 ? `R²: ${item.r2}` : item.mse ? `MSE: ${item.mse}` : item.type}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t('investmentLab.ui.ml.overview')}</CardTitle>
          <CardDescription>
            {t('investmentLab.ui.ml.overviewDesc')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Random Forest & XGBoost:</strong> {t('investmentLab.ui.ml.rfDesc')}
            </p>
            <p>
              <strong className="text-foreground">LSTM & CNN-LSTM:</strong> {t('investmentLab.ui.ml.lstmDesc')}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
