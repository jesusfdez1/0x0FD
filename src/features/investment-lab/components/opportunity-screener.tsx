import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info, TrendingUp } from "lucide-react"
import { useLanguage } from "@/context/language-provider"

const opportunities = [
  {
    symbol: "NVDA",
    name: "NVIDIA Corp",
    price: "$875.20",
    change: "+2.5%",
    smartScore: 98,
    reason: "Strong Momentum",
    sector: "Technology"
  },
  {
    symbol: "JPM",
    name: "JPMorgan Chase",
    price: "$195.40",
    change: "+0.8%",
    smartScore: 92,
    reason: "Value Play",
    sector: "Finance"
  },
  {
    symbol: "PFE",
    name: "Pfizer Inc",
    price: "$26.80",
    change: "-0.2%",
    smartScore: 88,
    reason: "High Yield",
    sector: "Healthcare"
  },
  {
    symbol: "GOOGL",
    name: "Alphabet Inc",
    price: "$172.50",
    change: "+1.1%",
    smartScore: 85,
    reason: "Growth at Reasonable Price",
    sector: "Technology"
  },
  {
    symbol: "O",
    name: "Realty Income",
    price: "$52.30",
    change: "+0.5%",
    smartScore: 82,
    reason: "Dividend Safety",
    sector: "Real Estate"
  }
]

export function OpportunityScreener() {
  const { t } = useLanguage()
  return (
    <Card className="col-span-1 md:col-span-2 lg:col-span-3">
      <CardHeader>
        <div className="flex items-center justify-between">
            <div>
                <CardTitle>{t('investmentLab.screener.title')}</CardTitle>
                <CardDescription>{t('investmentLab.screener.description')}</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('investmentLab.screener.columns.asset')}</TableHead>
              <TableHead>{t('investmentLab.screener.columns.sector')}</TableHead>
              <TableHead>{t('investmentLab.screener.columns.price')}</TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                    {t('investmentLab.screener.columns.smartScore')}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Info className="w-3 h-3 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p className="w-[200px] text-xs">{t('investmentLab.screener.tooltip')}</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
              </TableHead>
              <TableHead>{t('investmentLab.screener.columns.primaryDriver')}</TableHead>
              <TableHead className="text-right">{t('investmentLab.screener.columns.action')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {opportunities.map((asset) => (
              <TableRow key={asset.symbol}>
                <TableCell>
                    <div className="flex flex-col">
                        <span className="font-bold">{asset.symbol}</span>
                        <span className="text-xs text-muted-foreground">{asset.name}</span>
                    </div>
                </TableCell>
                <TableCell>
                    <Badge variant="outline" className="font-normal">{asset.sector}</Badge>
                </TableCell>
                <TableCell>
                    <div className="flex flex-col">
                        <span>{asset.price}</span>
                        <span className={asset.change.startsWith('+') ? "text-green-500 text-xs" : "text-red-500 text-xs"}>
                            {asset.change}
                        </span>
                    </div>
                </TableCell>
                <TableCell>
                    <div className="flex items-center gap-2">
                        <span className="font-bold text-primary">{asset.smartScore}</span>
                        <div className="h-1.5 w-16 bg-secondary rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${asset.smartScore}%` }} />
                        </div>
                    </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                    {asset.reason}
                </TableCell>
                <TableCell className="text-right">
                    <Badge className="cursor-pointer hover:bg-primary/90">{t('investmentLab.screener.analyze')}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
