import { useLanguage } from '@/context/language-provider'

export const useInvestmentData = () => {
  const { t } = useLanguage()

  const marketHealthData = {
    valuation: [
      { 
        name: 'S&P 500 Fwd P/E', 
        value: '20.4x', 
        status: t('investmentLab.data.status.elevated'), 
        description: t('investmentLab.data.marketHealth.valuation.sp500pe.description') 
      },
      { 
        name: 'Equity Risk Premium', 
        value: '3.8%', 
        status: t('investmentLab.data.status.tight'), 
        description: t('investmentLab.data.marketHealth.valuation.erp.description') 
      },
      { 
        name: 'Shiller PE (CAPE)', 
        value: '34.2', 
        status: t('investmentLab.data.status.overvalued'), 
        description: t('investmentLab.data.marketHealth.valuation.shiller.description') 
      },
      { 
        name: 'Buffett Indicator', 
        value: '185%', 
        status: t('investmentLab.data.status.extreme'), 
        description: t('investmentLab.data.marketHealth.valuation.buffett.description') 
      },
    ],
    sentiment: [
      { 
        name: 'Fear & Greed', 
        value: '76', 
        status: t('investmentLab.data.status.extremeGreed'), 
        description: t('investmentLab.data.marketHealth.sentiment.fng.description') 
      },
      { 
        name: 'AAII Bull-Bear', 
        value: '+22%', 
        status: t('investmentLab.data.status.bullish'), 
        description: t('investmentLab.data.marketHealth.sentiment.aaii.description') 
      },
      { 
        name: 'VIX Index', 
        value: '13.5', 
        status: t('investmentLab.data.status.complacency'), 
        description: t('investmentLab.data.marketHealth.sentiment.vix.description') 
      },
      { 
        name: 'Put/Call Ratio', 
        value: '0.85', 
        status: t('investmentLab.data.status.bullish'), 
        description: t('investmentLab.data.marketHealth.sentiment.pcr.description') 
      },
    ],
    credit: [
      { 
        name: 'US 10Y-2Y Spread', 
        value: '-42 bps', 
        status: t('investmentLab.data.status.inverted'), 
        description: t('investmentLab.data.marketHealth.credit.spread.description') 
      },
      { 
        name: 'US 10Y Yield', 
        value: '4.25%', 
        status: t('investmentLab.data.status.rising'), 
        description: t('investmentLab.data.marketHealth.credit.yield.description') 
      },
      { 
        name: 'US 10Y Real Yield', 
        value: '1.95%', 
        status: t('investmentLab.data.status.restrictive'), 
        description: t('investmentLab.data.marketHealth.credit.realYield.description') 
      },
      { 
        name: 'HY OAS Spread', 
        value: '315 bps', 
        status: t('investmentLab.data.status.tight'), 
        description: t('investmentLab.data.marketHealth.credit.hyOas.description') 
      },
    ]
  }

  const macroData = {
    usa: [
      { name: 'GDP Growth (QoQ)', value: '3.2%', trend: t('investmentLab.data.status.resilient'), description: t('investmentLab.data.macro.usa.gdp.description') },
      { name: 'Unemployment Rate', value: '3.9%', trend: t('investmentLab.data.status.stable'), description: t('investmentLab.data.macro.usa.unemployment.description') },
      { name: 'Non-Farm Payrolls', value: '+275k', trend: t('investmentLab.data.status.strong'), description: t('investmentLab.data.macro.usa.nfp.description') },
      { name: 'CPI (YoY)', value: '3.2%', trend: t('investmentLab.data.status.sticky'), description: t('investmentLab.data.macro.usa.cpi.description') },
      { name: 'Core PCE (YoY)', value: '2.8%', trend: t('investmentLab.data.status.decreasing'), description: t('investmentLab.data.macro.usa.pce.description') },
      { name: 'Fed Funds Rate', value: '5.25-5.50%', trend: t('investmentLab.data.status.peak'), description: t('investmentLab.data.macro.usa.fedRate.description') },
      { name: 'ISM Manufacturing', value: '47.8', trend: t('investmentLab.data.status.contraction'), description: t('investmentLab.data.macro.usa.ismMfg.description') },
      { name: 'ISM Services', value: '52.6', trend: t('investmentLab.data.status.expansion'), description: t('investmentLab.data.macro.usa.ismServices.description') },
    ],
    eurozone: [
      { name: 'GDP Growth (QoQ)', value: '0.0%', trend: t('investmentLab.data.status.stagnant'), description: t('investmentLab.data.macro.eurozone.gdp.description') },
      { name: 'HICP Inflation', value: '2.6%', trend: t('investmentLab.data.status.decreasing'), description: t('investmentLab.data.macro.eurozone.hicp.description') },
      { name: 'ECB Deposit Rate', value: '4.00%', trend: t('investmentLab.data.status.peak'), description: t('investmentLab.data.macro.eurozone.ecbRate.description') },
      { name: 'ZEW Sentiment', value: '33.5', trend: t('investmentLab.data.status.improving'), description: t('investmentLab.data.macro.eurozone.zew.description') },
      { name: 'HCOB Mfg PMI', value: '46.5', trend: t('investmentLab.data.status.contraction'), description: t('investmentLab.data.macro.eurozone.pmi.description') },
    ],
    china: [
      { name: 'GDP Growth (YoY)', value: '5.2%', trend: t('investmentLab.data.status.moderate'), description: t('investmentLab.data.macro.china.gdp.description') },
      { name: 'Industrial Prod.', value: '7.0%', trend: t('investmentLab.data.status.recovering'), description: t('investmentLab.data.macro.china.industrial.description') },
      { name: 'Retail Sales', value: '5.5%', trend: t('investmentLab.data.status.soft'), description: t('investmentLab.data.macro.china.retail.description') },
      { name: 'CPI (YoY)', value: '0.7%', trend: t('investmentLab.data.status.low'), description: t('investmentLab.data.macro.china.cpi.description') },
      { name: '1Y LPR', value: '3.45%', trend: t('investmentLab.data.status.easing'), description: t('investmentLab.data.macro.china.lpr.description') },
    ]
  }

  const fundamentalData = {
    profitability: [
      { name: 'P/E Ratio', value: '25.4', description: t('investmentLab.data.fundamental.profitability.pe.description'), status: t('investmentLab.data.status.high') },
      { name: 'ROE', value: '18.5%', description: t('investmentLab.data.fundamental.profitability.roe.description'), status: t('investmentLab.data.status.good') },
      { name: 'ROA', value: '7.2%', description: t('investmentLab.data.fundamental.profitability.roa.description'), status: t('investmentLab.data.status.healthy') },
    ],
    liquidity: [
      { name: 'Current Ratio', value: '1.2', description: t('investmentLab.data.fundamental.liquidity.currentRatio.description'), status: t('investmentLab.data.status.balanced') },
      { name: 'Quick Ratio', value: '0.9', description: t('investmentLab.data.fundamental.liquidity.quickRatio.description'), status: t('investmentLab.data.status.watch') },
      { name: 'Solvency Ratio', value: '1.6', description: t('investmentLab.data.fundamental.liquidity.solvencyRatio.description'), status: t('investmentLab.data.status.optimal') },
    ],
    operating: [
      { name: 'EBITDA', value: '$4.5M', description: t('investmentLab.data.fundamental.operating.ebitda.description'), status: t('investmentLab.data.status.strong') },
      { name: 'Free Cash Flow', value: '$1.2M', description: t('investmentLab.data.fundamental.operating.fcf.description'), status: t('investmentLab.data.status.positive') },
    ]
  }

  const technicalData = {
    trend: [
      { name: 'SMA (50)', value: '145.20', signal: t('investmentLab.data.status.bullish'), description: t('investmentLab.data.technical.trend.sma50.description') },
      { name: 'EMA (200)', value: '138.50', signal: t('investmentLab.data.status.bullish'), description: t('investmentLab.data.technical.trend.ema200.description') },
      { name: 'MACD', value: '2.5', signal: t('investmentLab.data.status.buy'), description: t('investmentLab.data.technical.trend.macd.description') },
    ],
    momentum: [
      { name: 'RSI', value: '65', signal: t('investmentLab.data.status.neutral'), description: t('investmentLab.data.technical.momentum.rsi.description') },
    ],
    volatility: [
      { name: 'Bollinger Bands', upper: '155.00', lower: '135.00', current: '148.00', signal: t('investmentLab.data.status.normal'), description: t('investmentLab.data.technical.volatility.bb.description') },
      { name: 'Fibonacci Retracement', level: '61.8%', price: '142.00', type: t('investmentLab.data.status.support'), description: t('investmentLab.data.technical.volatility.fib.description') },
    ]
  }

  const commoditiesData = {
    metals: [
      { name: t('investmentLab.data.commodities.gold'), value: '$2,150', change: '+1.2%', trend: t('investmentLab.data.status.bullish'), description: t('investmentLab.data.commodities.gold.description') },
      { name: t('investmentLab.data.commodities.silver'), value: '$24.50', change: '+0.8%', trend: t('investmentLab.data.status.neutral'), description: t('investmentLab.data.commodities.silver.description') },
      { name: t('investmentLab.data.commodities.copper'), value: '$3.95', change: '+0.5%', trend: t('investmentLab.data.status.recovering'), description: t('investmentLab.data.commodities.copper.description') },
    ],
    energy: [
      { name: t('investmentLab.data.commodities.oil'), value: '$78.50', change: '-0.3%', trend: t('investmentLab.data.status.neutral'), description: t('investmentLab.data.commodities.oil.description') },
      { name: t('investmentLab.data.commodities.gas'), value: '$1.85', change: '-1.5%', trend: t('investmentLab.data.status.bearish'), description: t('investmentLab.data.commodities.gas.description') },
    ]
  }

  const goldData = {
    correlations: [
      { name: t('investmentLab.data.gold.correlations.usd'), value: '-0.85', description: t('investmentLab.data.gold.correlations.usd.description') },
    ],
    factors: [
      { name: t('investmentLab.data.gold.factors.rates'), value: '1.5%', impact: t('investmentLab.data.status.neutral'), description: t('investmentLab.data.gold.factors.rates.description') },
      { name: t('investmentLab.data.gold.factors.banks'), value: t('investmentLab.data.status.high'), impact: t('investmentLab.data.status.positive'), description: t('investmentLab.data.gold.factors.banks.description') },
      { name: t('investmentLab.data.gold.factors.risk'), level: t('investmentLab.data.status.elevated'), impact: t('investmentLab.data.status.positive'), description: t('investmentLab.data.gold.factors.risk.description') },
    ]
  }

  const mlModels = {
    classification: [
      { name: 'Random Forest', accuracy: '92%', description: t('investmentLab.data.ml.classification.rf.purpose'), auc: '0.93' },
      { name: 'XGBoost', accuracy: '89%', description: t('investmentLab.data.ml.classification.xgb.purpose'), auc: '0.90' },
      { name: 'Logistic Regression', accuracy: '78%', description: t('investmentLab.data.ml.classification.lr.purpose'), auc: '0.82' },
    ],
    timeSeries: [
      { name: 'LSTM', r2: '0.98', description: t('investmentLab.data.ml.timeseries.lstm.purpose'), horizon: t('investmentLab.data.ml.timeseries.lstm.horizon') },
      { name: 'CNN-LSTM Hybrid', mse: '0.002', description: t('investmentLab.data.ml.timeseries.hybrid.purpose'), performance: t('investmentLab.data.status.superior') },
      { name: 'ARIMA', type: t('investmentLab.data.ml.timeseries.arima.type'), description: t('investmentLab.data.ml.timeseries.arima.purpose'), interpretable: t('investmentLab.data.status.high') },
    ]
  }

  return { marketHealthData, macroData, fundamentalData, technicalData, commoditiesData, goldData, mlModels }
}
