import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { useLanguage } from '@/context/language-provider'

export function MarketSentiment() {
  const { t } = useLanguage()
  // Mock data
  const sentimentScore = 65 // Greed
  const sentimentLabel = t('investmentLab.sentiment.greed')
  
  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>{t('investmentLab.sentiment.title')}</CardTitle>
        <CardDescription>{t('investmentLab.sentiment.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">{t('investmentLab.sentiment.fear')}</span>
          <span className="text-2xl font-bold text-primary">{sentimentLabel}</span>
          <span className="text-sm font-medium text-muted-foreground">{t('investmentLab.sentiment.greed')}</span>
        </div>
        
        {/* Custom Progress Bar since I'm not sure if Progress component exists, and I want a gradient */}
        <div className="h-4 w-full rounded-full bg-secondary overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all duration-1000 ease-out"
            style={{ width: `${sentimentScore}%` }}
          />
        </div>
        <div className="flex justify-center">
            <span className="text-xs text-muted-foreground">{t('investmentLab.sentiment.score')}: {sentimentScore}/100</span>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
                <span className="text-xs text-muted-foreground">S&P 500</span>
                <div className="flex items-center text-green-500 text-sm font-bold">
                    <TrendingUp className="w-3 h-3 mr-1" /> +1.2%
                </div>
            </div>
            <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
                <span className="text-xs text-muted-foreground">VIX</span>
                <div className="flex items-center text-red-500 text-sm font-bold">
                    <TrendingDown className="w-3 h-3 mr-1" /> -5.4%
                </div>
            </div>
            <div className="flex flex-col items-center p-2 bg-muted/50 rounded-lg">
                <span className="text-xs text-muted-foreground">Gold</span>
                <div className="flex items-center text-yellow-500 text-sm font-bold">
                    <Minus className="w-3 h-3 mr-1" /> 0.0%
                </div>
            </div>
        </div>
      </CardContent>
    </Card>
  )
}
