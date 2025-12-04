import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useLanguage } from '@/context/language-provider'

const insights = [
  {
    id: 1,
    title: "Tech Sector Rotation",
    description: "AI models detect a capital flow from Semiconductor stocks to Software Infrastructure.",
    impact: "High",
    type: "Opportunity"
  },
  {
    id: 2,
    title: "Energy Volatility Alert",
    description: "Geopolitical tensions may increase oil price volatility in the next 48 hours.",
    impact: "Medium",
    type: "Risk"
  },
  {
    id: 3,
    title: "Undervalued Dividend Aristocrats",
    description: "3 companies in the Consumer Staples sector are trading 15% below their historical average P/E.",
    impact: "Medium",
    type: "Value"
  }
]

export function AIInsights() {
  const { t } = useLanguage()
  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-1 h-full">
      <CardHeader>
        <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <CardTitle>{t('investmentLab.insights.title')}</CardTitle>
        </div>
        <CardDescription>{t('investmentLab.insights.description')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {insights.map((insight) => (
            <div key={insight.id} className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer group">
                <div className="flex justify-between items-start mb-1">
                    <h4 className="font-semibold text-sm group-hover:text-primary transition-colors">{insight.title}</h4>
                    <Badge variant={insight.type === 'Risk' ? 'destructive' : 'secondary'} className="text-[10px] h-5">
                        {insight.type}
                    </Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{insight.description}</p>
            </div>
        ))}
        <Button variant="ghost" className="w-full text-xs mt-2">
            {t('investmentLab.insights.viewAll')} <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </CardContent>
    </Card>
  )
}
