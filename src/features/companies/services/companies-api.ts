import axios from 'axios'
import { type Company } from '../data/schema'

// Lista extensa de símbolos de empresas de diferentes exchanges mundiales
const stockSymbols = [
  // NASDAQ - Technology
  'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'META', 'TSLA', 'NVDA', 'NFLX', 'AMD', 'INTC', 'CSCO', 'ADBE', 'PYPL', 'ZM', 'CRM', 'ORCL', 'AVGO', 'QCOM', 'TXN',
  // NASDAQ - Otros
  'COST', 'SBUX', 'ISRG', 'GILD', 'AMGN', 'BKNG', 'VRTX', 'REGN', 'ILMN', 'ALGN',
  
  // NYSE - Financial
  'JPM', 'BAC', 'WFC', 'C', 'GS', 'MS', 'BLK', 'SCHW', 'AXP', 'COF',
  // NYSE - Healthcare
  'JNJ', 'UNH', 'PFE', 'ABT', 'TMO', 'ABBV', 'BMY', 'LLY', 'MRK', 'CVS',
  // NYSE - Consumer
  'PG', 'KO', 'PEP', 'WMT', 'HD', 'MCD', 'NKE', 'TGT', 'LOW', 'SBUX',
  // NYSE - Energy
  'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'MPC', 'VLO', 'PSX', 'HES', 'FANG',
  // NYSE - Industrial
  'BA', 'CAT', 'GE', 'HON', 'MMM', 'RTX', 'LMT', 'NOC', 'GD', 'TDG',
  // NYSE - Otros
  'V', 'MA', 'DIS', 'NEE', 'SO', 'DUK', 'D', 'AEP', 'SRE', 'EXC',
  
  // LSE - Reino Unido
  'HSBA.L', 'BP.L', 'GSK.L', 'RIO.L', 'BT.L', 'VOD.L', 'BARC.L', 'ULVR.L', 'AZN.L', 'DGE.L', 'TSCO.L', 'BATS.L', 'NG.L', 'REL.L', 'PRU.L',
  
  // TSE - Japón
  '7203.T', '6758.T', '9984.T', '6098.T', '7974.T', '6861.T', '8058.T', '8306.T', '8411.T', '9434.T',
  
  // ASX - Australia
  'BHP.AX', 'CBA.AX', 'ANZ.AX', 'WBC.AX', 'NAB.AX', 'WDS.AX', 'FMG.AX', 'TLS.AX', 'CSL.AX', 'WOW.AX',
  
  // BME - España
  'ITX.MC', 'SAN.MC', 'TEF.MC', 'IBE.MC', 'BBVA.MC', 'REP.MC', 'FER.MC', 'ENG.MC', 'ACS.MC', 'GRF.MC',
  
  // XETR - Alemania
  'SAP.DE', 'SIE.DE', 'ALV.DE', 'MUV2.DE', 'DBK.DE', 'BAYN.DE', 'VOW3.DE', 'BMW.DE', 'DAI.DE', 'BAS.DE',
  
  // PAR - Francia
  'SAN.PA', 'OR.PA', 'TTE.PA', 'AIR.PA', 'MC.PA', 'BNP.PA', 'EL.PA', 'VIE.PA', 'DG.PA', 'KER.PA',
  
  // MIL - Italia
  'ENEL.MI', 'ISP.MI', 'INTESASANPAOLO.MI', 'ENI.MI', 'UNICREDIT.MI', 'STLA.MI', 'FERRARI.MI', 'MONCLER.MI', 'PRY.MI', 'G.MI',
  
  // AMS - Holanda
  'ASML.AS', 'INGA.AS', 'PHIA.AS', 'UNA.AS', 'AD.AS', 'RDSA.AS', 'WKL.AS', 'DSM.AS', 'HEIA.AS', 'AKZA.AS',
  
  // TSE - Toronto
  'RY.TO', 'TD.TO', 'BNS.TO', 'BMO.TO', 'CM.TO', 'CNR.TO', 'CP.TO', 'TRP.TO', 'ENB.TO', 'SU.TO',
  
  // B3 - Brasil
  'PBR', 'VALE', 'ITUB', 'BBD', 'ABEV', 'PETR4.SA', 'VALE3.SA', 'ITUB4.SA', 'BBDC4.SA', 'ABEV3.SA',
  
  // KRX - Corea
  '005930.KS', '000660.KS', '005380.KS', '035420.KS', '051910.KS', '006400.KS', '028260.KS', '003670.KS', '035720.KS', '207940.KS',
  
  // HKEX - Hong Kong
  '0700.HK', '9988.HK', '0005.HK', '0941.HK', '1299.HK', '2318.HK', '1398.HK', '0388.HK', '3690.HK', '1810.HK',
  
  // SSE/SZSE - China
  '600519.SS', '000858.SZ', '000002.SZ', '600036.SS', '000001.SZ', '600000.SS', '000063.SZ', '600887.SS', '000776.SZ', '600028.SS',
  
  // NSE/BSE - India
  'RELIANCE.NS', 'TCS.NS', 'HDFCBANK.NS', 'INFY.NS', 'HINDUNILVR.NS', 'ICICIBANK.NS', 'SBIN.NS', 'BHARTIARTL.NS', 'KOTAKBANK.NS', 'LT.NS',
  
  // SGX - Singapur
  'D05.SI', 'O39.SI', 'U11.SI', 'Z74.SI', 'C6L.SI', 'J36.SI', 'C09.SI', 'G13.SI', 'H78.SI', 'F34.SI',
  
  // NZX - Nueva Zelanda
  'ANZ.NZ', 'FPH.NZ', 'FRE.NZ', 'MFT.NZ', 'RYM.NZ', 'SKC.NZ', 'SPK.NZ', 'TLS.NZ', 'VCT.NZ', 'WBC.NZ',
]

// Mapeo de exchanges a regiones
const exchangeToRegion: Record<string, string> = {
  // Norteamérica
  'US': 'North America',
  'NASDAQ': 'North America',
  'NYSE': 'North America',
  'AMEX': 'North America',
  'TSX': 'North America',
  'TSXV': 'North America',
  // Europa
  'LSE': 'Europe',
  'BME': 'Europe',
  'XETR': 'Europe',
  'MIL': 'Europe',
  'PAR': 'Europe',
  'AMS': 'Europe',
  'SWX': 'Europe',
  'OSE': 'Europe',
  'STO': 'Europe',
  'HEL': 'Europe',
  'CPH': 'Europe',
  'VIE': 'Europe',
  'WSE': 'Europe',
  'BUD': 'Europe',
  // Asia
  'TSE': 'Asia',
  'KRX': 'Asia',
  'SSE': 'Asia',
  'SZSE': 'Asia',
  'HKEX': 'Asia',
  'BSE': 'Asia',
  'NSE': 'Asia',
  'SGX': 'Asia',
  'IDX': 'Asia',
  'SET': 'Asia',
  'KLSE': 'Asia',
  'TWSE': 'Asia',
  // Oceanía
  'ASX': 'Oceania',
  'NZX': 'Oceania',
  // América del Sur
  'B3': 'South America',
  'BCS': 'South America',
  'BVC': 'South America',
}

// Mapeo de sectores comunes
const sectorMapping: Record<string, string> = {
  'Technology': 'Technology',
  'Financial Services': 'Financial',
  'Healthcare': 'Healthcare',
  'Consumer Cyclical': 'Consumer',
  'Consumer Defensive': 'Consumer',
  'Energy': 'Energy',
  'Industrials': 'Industrial',
  'Communication Services': 'Telecommunications',
  'Utilities': 'Utilities',
  'Real Estate': 'Real Estate',
  'Basic Materials': 'Materials',
  'Automotive': 'Automotive',
  'Retail': 'Retail',
  'E-commerce': 'E-commerce',
  'Mining': 'Mining',
}

// Función para obtener región basada en el exchange
function getRegionFromExchange(exchange: string): string {
  const upperExchange = exchange.toUpperCase()
  return exchangeToRegion[upperExchange] || 'Other'
}

// Función para normalizar el sector
function normalizeSector(sector: string | undefined): string {
  if (!sector) return 'Other'
  return sectorMapping[sector] || sector
}

// Función para obtener empresas desde Finnhub (requiere API key pero es gratuita)
async function fetchCompaniesFromFinnhub(): Promise<Company[]> {
  const apiKey = import.meta.env.VITE_FINNHUB_API_KEY || 'demo'
  
  // Lista de exchanges principales de todo el mundo
  const exchanges = [
    // Norteamérica
    'US', 'NASDAQ', 'NYSE', 'AMEX', 'TSX', 'TSXV',
    // Europa
    'LSE', 'XETR', 'MIL', 'PAR', 'AMS', 'BME', 'SWX', 'OSE', 'STO', 'HEL', 'CPH', 'VIE', 'WSE', 'BUD',
    // Asia
    'TSE', 'KRX', 'SSE', 'SZSE', 'HKEX', 'BSE', 'NSE', 'SGX', 'IDX', 'SET', 'KLSE', 'TWSE',
    // Oceanía
    'ASX', 'NZX',
    // América del Sur
    'B3', 'BCS', 'BVC',
  ]
  
  const allCompanies: Company[] = []
  const maxExchanges = apiKey === 'demo' ? 5 : exchanges.length // Limitar si es demo
  
  // Obtener símbolos de cada exchange
  for (let i = 0; i < Math.min(maxExchanges, exchanges.length); i++) {
    const exchange = exchanges[i]
    try {
      const response = await axios.get(`https://finnhub.io/api/v1/stock/symbol`, {
        params: {
          exchange,
          token: apiKey,
        },
        timeout: 15000,
      })
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        const companies: Company[] = response.data
          .filter((stock: any) => {
            // Filtrar solo acciones comunes y ADRs
            const type = (stock.type || '').toUpperCase()
            return type.includes('COMMON') || type === 'ADR' || type.includes('ORDINARY') || type === 'CS'
          })
          .map((stock: any, index: number) => ({
            id: `${exchange}-${stock.symbol}-${index}`,
            name: stock.description || stock.symbol,
            ticker: stock.symbol,
            region: getRegionFromExchange(exchange),
            market: exchange,
            sector: normalizeSector(stock.type),
          }))
        
        allCompanies.push(...companies)
        console.log(`✓ Obtenidas ${companies.length} empresas de ${exchange}`)
      }
      
      // Pausa para evitar rate limiting (más larga si es demo)
      await new Promise(resolve => setTimeout(resolve, apiKey === 'demo' ? 1000 : 300))
    } catch (error: any) {
      if (error.response?.status === 429) {
        console.warn(`Rate limit alcanzado para ${exchange}, esperando...`)
        await new Promise(resolve => setTimeout(resolve, 5000))
      } else {
        console.warn(`Error fetching from exchange ${exchange}:`, error.message)
      }
      // Continuar con el siguiente exchange
    }
  }
  
  return allCompanies
}

// Función para probar la API con una empresa específica (AAPL como ejemplo)
async function testFMPConnection(apiKey: string): Promise<boolean> {
  try {
    const testResponse = await axios.get('https://financialmodelingprep.com/stable/profile/AAPL', {
      params: { apikey: apiKey },
      timeout: 10000,
    })
    console.log('✅ Conexión exitosa con FMP. Respuesta de prueba:', testResponse.data)
    return true
  } catch (error: any) {
    console.warn('⚠️ Test de conexión falló:', error.response?.status, error.message)
    return false
  }
}

// Función principal para obtener empresas desde Yahoo Finance
async function fetchCompaniesFromYahooFinance(): Promise<Company[]> {
  const companies: Company[] = []
  
  try {
    console.log('🔄 Obteniendo empresas desde Yahoo Finance...')
    console.log(`📊 Total de símbolos a procesar: ${stockSymbols.length}`)
    
    // Dividir símbolos en lotes de 50 (límite recomendado por Yahoo)
    const batchSize = 50
    const batches = []
    for (let i = 0; i < stockSymbols.length; i += batchSize) {
      batches.push(stockSymbols.slice(i, i + batchSize))
    }
    
    console.log(`📦 Procesando ${batches.length} lotes...`)
    
    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex]
      const symbols = batch.join(',')
      
      try {
        const response = await axios.get('https://query1.finance.yahoo.com/v7/finance/quote', {
          params: {
            symbols,
            fields: 'symbol,longName,shortName,exchange,quoteType,sector,marketState,regularMarketPrice,regularMarketChange,regularMarketChangePercent',
          },
          timeout: 15000,
        })
        
        if (response.data?.quoteResponse?.result) {
          const results = response.data.quoteResponse.result
          
          for (const stock of results) {
            if (stock.symbol && (stock.longName || stock.shortName)) {
              // Extraer el exchange base del símbolo si está disponible
              let exchange = stock.exchange || ''
              if (!exchange && stock.symbol.includes('.')) {
                const parts = stock.symbol.split('.')
                if (parts.length > 1) {
                  const suffix = parts[1]
                  // Mapear sufijos comunes a exchanges
                  const suffixMap: Record<string, string> = {
                    'L': 'LSE', 'T': 'TSE', 'AX': 'ASX', 'MC': 'BME', 'DE': 'XETR',
                    'PA': 'PAR', 'MI': 'MIL', 'AS': 'AMS', 'TO': 'TSX', 'SA': 'B3',
                    'KS': 'KRX', 'HK': 'HKEX', 'SS': 'SSE', 'SZ': 'SZSE', 'NS': 'NSE',
                    'SI': 'SGX', 'NZ': 'NZX',
                  }
                  exchange = suffixMap[suffix] || suffix
                }
              }
              
              companies.push({
                id: `${exchange || 'UNKNOWN'}-${stock.symbol}-${companies.length}`,
                name: stock.longName || stock.shortName || stock.symbol,
                ticker: stock.symbol,
                region: getRegionFromExchange(exchange),
                market: exchange || 'Unknown',
                sector: normalizeSector(stock.sector),
              })
            }
          }
          
          console.log(`✓ Lote ${batchIndex + 1}/${batches.length}: ${results.length} empresas obtenidas (Total: ${companies.length})`)
        } else if (response.data?.quoteResponse?.error) {
          console.warn(`⚠️ Error en lote ${batchIndex + 1}:`, response.data.quoteResponse.error)
        }
        
        // Pausa entre lotes para evitar rate limiting
        if (batchIndex < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 300))
        }
      } catch (error: any) {
        console.warn(`⚠️ Error en lote ${batchIndex + 1}:`, error.message)
        // Continuar con el siguiente lote
      }
    }
    
    if (companies.length > 0) {
      console.log(`✅ Total obtenido: ${companies.length} empresas desde Yahoo Finance`)
    } else {
      console.warn('⚠️ No se obtuvieron empresas desde Yahoo Finance')
    }
  } catch (error: any) {
    console.error('❌ Error general con Yahoo Finance:', error.message)
  }
  
  return companies
}

// Función para obtener empresas desde Alpha Vantage (requiere API key pero tiene plan gratuito)
async function fetchCompaniesFromAlphaVantage(): Promise<Company[]> {
  const apiKey = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || 'demo'
  
  if (apiKey === 'demo') {
    return []
  }
  
  try {
    console.log('🔄 Obteniendo empresas desde Alpha Vantage...')
    // Alpha Vantage tiene un endpoint de búsqueda
    const response = await axios.get('https://www.alphavantage.co/query', {
      params: {
        function: 'SYMBOL_SEARCH',
        keywords: 'stock',
        apikey: apiKey,
      },
      timeout: 15000,
    })
    
    if (response.data?.bestMatches) {
      const companies = response.data.bestMatches
        .filter((match: any) => match['1. symbol'] && match['2. name'])
        .map((match: any, index: number) => ({
          id: `AV-${match['1. symbol']}-${index}`,
          name: match['2. name'],
          ticker: match['1. symbol'],
          region: getRegionFromExchange(match['4. region'] || ''),
          market: match['4. region'] || 'Unknown',
          sector: normalizeSector(match['3. type']),
        }))
      
      console.log(`✅ Obtenidas ${companies.length} empresas desde Alpha Vantage`)
      return companies
    }
  } catch (error: any) {
    console.warn('⚠️ Error con Alpha Vantage:', error.message)
  }
  
  return []
}

// Función para obtener empresas desde Polygon.io (tiene plan gratuito)
async function fetchCompaniesFromPolygon(): Promise<Company[]> {
  const apiKey = import.meta.env.VITE_POLYGON_API_KEY || ''
  
  if (!apiKey) {
    return []
  }
  
  try {
    console.log('🔄 Obteniendo empresas desde Polygon.io...')
    const response = await axios.get('https://api.polygon.io/v3/reference/tickers', {
      params: {
        market: 'stocks',
        active: true,
        limit: 1000,
        apiKey,
      },
      timeout: 30000,
    })
    
    if (response.data?.results) {
      const companies = response.data.results
        .filter((ticker: any) => ticker.ticker && ticker.name)
        .map((ticker: any, index: number) => ({
          id: `POLYGON-${ticker.ticker}-${index}`,
          name: ticker.name,
          ticker: ticker.ticker,
          region: getRegionFromExchange(ticker.primary_exchange || ''),
          market: ticker.primary_exchange || 'Unknown',
          sector: normalizeSector(ticker.sic_description),
        }))
      
      console.log(`✅ Obtenidas ${companies.length} empresas desde Polygon.io`)
      return companies
    }
  } catch (error: any) {
    console.warn('⚠️ Error con Polygon.io:', error.message)
  }
  
  return []
}

// Función para generar una lista extensa de empresas conocidas (fallback)
async function fetchCompaniesFromStaticList(): Promise<Company[]> {
  console.log('🔄 Generando lista estática de empresas conocidas...')
  
  // Lista extensa de empresas conocidas de diferentes exchanges
  const staticCompanies: Array<{name: string, ticker: string, exchange: string, sector: string}> = [
    // NASDAQ - Technology
    { name: 'Apple Inc', ticker: 'AAPL', exchange: 'NASDAQ', sector: 'Technology' },
    { name: 'Microsoft Corporation', ticker: 'MSFT', exchange: 'NASDAQ', sector: 'Technology' },
    { name: 'Alphabet Inc', ticker: 'GOOGL', exchange: 'NASDAQ', sector: 'Technology' },
    { name: 'Amazon.com Inc', ticker: 'AMZN', exchange: 'NASDAQ', sector: 'E-commerce' },
    { name: 'Meta Platforms Inc', ticker: 'META', exchange: 'NASDAQ', sector: 'Technology' },
    { name: 'Tesla Inc', ticker: 'TSLA', exchange: 'NASDAQ', sector: 'Automotive' },
    { name: 'Nvidia Corporation', ticker: 'NVDA', exchange: 'NASDAQ', sector: 'Technology' },
    { name: 'Netflix Inc', ticker: 'NFLX', exchange: 'NASDAQ', sector: 'Technology' },
    { name: 'Advanced Micro Devices', ticker: 'AMD', exchange: 'NASDAQ', sector: 'Technology' },
    { name: 'Intel Corporation', ticker: 'INTC', exchange: 'NASDAQ', sector: 'Technology' },
    { name: 'Cisco Systems', ticker: 'CSCO', exchange: 'NASDAQ', sector: 'Technology' },
    { name: 'Adobe Inc', ticker: 'ADBE', exchange: 'NASDAQ', sector: 'Technology' },
    { name: 'PayPal Holdings', ticker: 'PYPL', exchange: 'NASDAQ', sector: 'Financial' },
    { name: 'Zoom Video Communications', ticker: 'ZM', exchange: 'NASDAQ', sector: 'Technology' },
    { name: 'Salesforce.com', ticker: 'CRM', exchange: 'NASDAQ', sector: 'Technology' },
    
    // NYSE - Diversos sectores
    { name: 'JPMorgan Chase & Co', ticker: 'JPM', exchange: 'NYSE', sector: 'Financial' },
    { name: 'Johnson & Johnson', ticker: 'JNJ', exchange: 'NYSE', sector: 'Healthcare' },
    { name: 'Visa Inc', ticker: 'V', exchange: 'NYSE', sector: 'Financial' },
    { name: 'Procter & Gamble', ticker: 'PG', exchange: 'NYSE', sector: 'Consumer' },
    { name: 'UnitedHealth Group', ticker: 'UNH', exchange: 'NYSE', sector: 'Healthcare' },
    { name: 'Home Depot', ticker: 'HD', exchange: 'NYSE', sector: 'Retail' },
    { name: 'Mastercard Inc', ticker: 'MA', exchange: 'NYSE', sector: 'Financial' },
    { name: 'Walt Disney Company', ticker: 'DIS', exchange: 'NYSE', sector: 'Consumer' },
    { name: 'Bank of America', ticker: 'BAC', exchange: 'NYSE', sector: 'Financial' },
    { name: 'Exxon Mobil', ticker: 'XOM', exchange: 'NYSE', sector: 'Energy' },
    { name: 'Coca-Cola Company', ticker: 'KO', exchange: 'NYSE', sector: 'Consumer' },
    { name: 'Walmart Inc', ticker: 'WMT', exchange: 'NYSE', sector: 'Retail' },
    { name: 'Chevron Corporation', ticker: 'CVX', exchange: 'NYSE', sector: 'Energy' },
    { name: 'Verizon Communications', ticker: 'VZ', exchange: 'NYSE', sector: 'Telecommunications' },
    { name: 'Pfizer Inc', ticker: 'PFE', exchange: 'NYSE', sector: 'Healthcare' },
    
    // LSE - Europa
    { name: 'HSBC Holdings', ticker: 'HSBA', exchange: 'LSE', sector: 'Financial' },
    { name: 'BP plc', ticker: 'BP', exchange: 'LSE', sector: 'Energy' },
    { name: 'GlaxoSmithKline', ticker: 'GSK', exchange: 'LSE', sector: 'Healthcare' },
    { name: 'Rio Tinto', ticker: 'RIO', exchange: 'LSE', sector: 'Mining' },
    { name: 'British Telecom', ticker: 'BT', exchange: 'LSE', sector: 'Telecommunications' },
    { name: 'Vodafone Group', ticker: 'VOD', exchange: 'LSE', sector: 'Telecommunications' },
    { name: 'Barclays', ticker: 'BARC', exchange: 'LSE', sector: 'Financial' },
    { name: 'Unilever', ticker: 'ULVR', exchange: 'LSE', sector: 'Consumer' },
    
    // TSE - Japón
    { name: 'Toyota Motor', ticker: '7203', exchange: 'TSE', sector: 'Automotive' },
    { name: 'Sony Group', ticker: '6758', exchange: 'TSE', sector: 'Technology' },
    { name: 'SoftBank Group', ticker: '9984', exchange: 'TSE', sector: 'Technology' },
    { name: 'Recruit Holdings', ticker: '6098', exchange: 'TSE', sector: 'Technology' },
    { name: 'Nintendo', ticker: '7974', exchange: 'TSE', sector: 'Consumer' },
    
    // ASX - Australia
    { name: 'BHP Group', ticker: 'BHP', exchange: 'ASX', sector: 'Mining' },
    { name: 'Commonwealth Bank', ticker: 'CBA', exchange: 'ASX', sector: 'Financial' },
    { name: 'ANZ Banking Group', ticker: 'ANZ', exchange: 'ASX', sector: 'Financial' },
    { name: 'Westpac Banking', ticker: 'WBC', exchange: 'ASX', sector: 'Financial' },
    
    // BME - España
    { name: 'Inditex', ticker: 'ITX', exchange: 'BME', sector: 'Retail' },
    { name: 'Banco Santander', ticker: 'SAN', exchange: 'BME', sector: 'Financial' },
    { name: 'Telefónica', ticker: 'TEF', exchange: 'BME', sector: 'Telecommunications' },
    { name: 'Iberdrola', ticker: 'IBE', exchange: 'BME', sector: 'Utilities' },
    
    // B3 - Brasil
    { name: 'Petrobras', ticker: 'PBR', exchange: 'B3', sector: 'Energy' },
    { name: 'Vale SA', ticker: 'VALE', exchange: 'B3', sector: 'Mining' },
    { name: 'Itaú Unibanco', ticker: 'ITUB', exchange: 'B3', sector: 'Financial' },
    
    // KRX - Corea
    { name: 'Samsung Electronics', ticker: '005930', exchange: 'KRX', sector: 'Technology' },
    { name: 'SK Hynix', ticker: '000660', exchange: 'KRX', sector: 'Technology' },
    { name: 'Hyundai Motor', ticker: '005380', exchange: 'KRX', sector: 'Automotive' },
    
    // HKEX - Hong Kong
    { name: 'Tencent Holdings', ticker: '0700', exchange: 'HKEX', sector: 'Technology' },
    { name: 'Alibaba Group', ticker: '9988', exchange: 'HKEX', sector: 'E-commerce' },
    { name: 'HSBC Holdings', ticker: '0005', exchange: 'HKEX', sector: 'Financial' },
  ]
  
  const companies = staticCompanies.map((company, index) => ({
    id: `${company.exchange}-${company.ticker}-${index}`,
    name: company.name,
    ticker: company.ticker,
    region: getRegionFromExchange(company.exchange),
    market: company.exchange,
    sector: company.sector,
  }))
  
  console.log(`✅ Generadas ${companies.length} empresas desde lista estática`)
  return companies
}

// Función principal usando Financial Modeling Prep (mantener por si acaso)
async function fetchCompaniesFromFMP(): Promise<Company[]> {
  // Usar el token proporcionado como valor por defecto, o el de la variable de entorno
  const apiKey = import.meta.env.VITE_FMP_API_KEY || 'xz1Lv0wCSuOddCys0o4POuaw3xpHJ2AL'
  
  // Probar conexión primero
  await testFMPConnection(apiKey)
  
  // Intentar múltiples endpoints posibles
  const endpoints = [
    'https://financialmodelingprep.com/stable/stock/list',
    'https://financialmodelingprep.com/api/v3/stock/list',
    'https://financialmodelingprep.com/stable/search',
  ]
  
  for (const endpoint of endpoints) {
    try {
      console.log(`🔄 Intentando endpoint: ${endpoint}`)
      
      let response
      if (endpoint.includes('/search')) {
        // Para el endpoint de búsqueda, buscar empresas populares
        response = await axios.get(endpoint, {
          params: {
            query: 'AAPL',
            apikey: apiKey,
            limit: 1000,
          },
          timeout: 60000,
        })
      } else {
        response = await axios.get(endpoint, {
          params: {
            apikey: apiKey,
          },
          timeout: 60000,
        })
      }
      
      console.log('📦 Respuesta de la API:', {
        endpoint,
        status: response.status,
        dataType: Array.isArray(response.data) ? 'array' : typeof response.data,
        dataLength: Array.isArray(response.data) ? response.data.length : 'N/A',
        firstItem: Array.isArray(response.data) && response.data.length > 0 ? response.data[0] : null,
      })
      
      if (!Array.isArray(response.data)) {
        console.warn(`⚠️ La respuesta de ${endpoint} no es un array:`, response.data)
        continue
      }
      
      if (response.data.length === 0) {
        console.warn(`⚠️ La API devolvió un array vacío desde ${endpoint}`)
        continue
      }
      
      // Procesar los datos
      const companies = response.data
        .filter((stock: any) => {
          // Filtrar solo empresas válidas
          const isValid = stock.exchange && stock.symbol && stock.name
          return isValid
        })
        .map((stock: any, index: number) => ({
          id: `${stock.exchange || 'UNKNOWN'}-${stock.symbol}-${index}`,
          name: stock.name,
          ticker: stock.symbol,
          region: getRegionFromExchange(stock.exchange || ''),
          market: stock.exchange || 'Unknown',
          sector: normalizeSector(stock.sector),
        }))
      
      if (companies.length > 0) {
        console.log(`✅ Obtenidas ${companies.length} empresas desde ${endpoint} (de ${response.data.length} totales)`)
        return companies
      }
    } catch (error: any) {
      console.warn(`⚠️ Error con endpoint ${endpoint}:`, {
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      })
      
      if (error.response?.status === 401 || error.response?.status === 403) {
        // Si es un error de autenticación, no intentar más endpoints
        break
      }
      // Continuar con el siguiente endpoint
    }
  }
  
  // Si todos los endpoints fallan, intentar obtener empresas por exchange
  console.log('🔄 Intentando obtener empresas por exchanges individuales...')
  const exchanges = ['NASDAQ', 'NYSE', 'LSE', 'TSE']
  
  for (const exchange of exchanges) {
    try {
      const response = await axios.get('https://financialmodelingprep.com/stable/stock-screener', {
        params: {
          exchange,
          apikey: apiKey,
          limit: 1000,
        },
        timeout: 30000,
      })
      
      if (Array.isArray(response.data) && response.data.length > 0) {
        const companies = response.data
          .filter((stock: any) => stock.exchange && stock.symbol && stock.name)
          .map((stock: any, index: number) => ({
            id: `${stock.exchange}-${stock.symbol}-${index}`,
            name: stock.name,
            ticker: stock.symbol,
            region: getRegionFromExchange(stock.exchange),
            market: stock.exchange,
            sector: normalizeSector(stock.sector),
          }))
        
        if (companies.length > 0) {
          console.log(`✅ Obtenidas ${companies.length} empresas desde exchange ${exchange}`)
          return companies
        }
      }
    } catch (error: any) {
      console.warn(`⚠️ Error obteniendo empresas de ${exchange}:`, error.message)
    }
  }
  
  return []
}

// Función principal - Solo usa Yahoo Finance
export async function fetchAllCompanies(): Promise<Company[]> {
  console.log('🚀 Iniciando obtención de empresas desde Yahoo Finance...')
  
  try {
    const companies = await fetchCompaniesFromYahooFinance()
    
    if (companies.length > 0) {
      console.log(`✅ Total final: ${companies.length} empresas obtenidas`)
      return companies
    } else {
      console.warn('⚠️ No se obtuvieron empresas, usando lista estática como fallback...')
      return await fetchCompaniesFromStaticList()
    }
  } catch (error) {
    console.error('❌ Error obteniendo empresas:', error)
    console.info('💡 Usando lista estática como fallback...')
    return await fetchCompaniesFromStaticList()
  }
}

