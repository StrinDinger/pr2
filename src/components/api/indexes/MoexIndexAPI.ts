import { BaseIndexAPI } from './BaseIndexAPI';
import { Stock, IndexComponent, IndexType } from '../types';

export class MoexIndexAPI extends BaseIndexAPI {
  constructor() {
    super({
      baseUrl: 'https://iss.moex.com',
      timeout: 15000,
    }, IndexType.MOEX);
  }

  async fetchIndexComponents(): Promise<IndexComponent[]> {
    const data = await this.makeRequest<any>(
      'iss/statistics/engines/stock/markets/index/analytics/IMOEX.json',
      {
        'limit': '100',
        'iss.only': 'analytics',
        'iss.meta': 'off',
        'iss.json': 'extended'
      }
    );

    return data[1].analytics.map((item: any) => ({
      ticker: item.ticker,
      weight: item.weight,
      name: item.shortnames
    }));
  }

  async getStockDetails(tickers: string | string[]): Promise<Stock[]> {
    const tickersArray = Array.isArray(tickers) ? tickers : [tickers];
    const securitiesParam = tickersArray.join(',');
    
    const data = await this.makeRequest<any>(
        'iss/engines/stock/markets/shares/boards/TQBR/securities.json',
        {
        'securities.columns': 'SECID,LOTSIZE,SHORTNAME,PREVPRICE',
        'securities': securitiesParam,
        'iss.json': 'extended',
        'iss.meta': 'off'
        }
    );

    const securities = data[1].securities;
    
    return securities.map((security: any) => ({
        ticker: security.SECID,
        name: security.SHORTNAME,
        lotSize: security.LOTSIZE,
        currentPrice: security.PREVPRICE,
        currency: 'RUB',
        exchange: 'MOEX'
    }));
 }

  async fetchLastPrice(ticker: string): Promise<number | null> {
    try {
      const data = await this.makeRequest<any>(
        'iss/engines/stock/markets/shares/boards/tqbr/trades.json',
        {
          'reversed': '1',
          'securities': ticker,
          'limit': '1',
          'iss.meta': 'off',
          'iss.only': 'trades',
          'iss.json': 'extended'
        }
      );

      return data[1].trades?.[0]?.PRICE || null;
    } catch {
      return null;
    }
  }

    async searchStocks(query?: string, securities?: string | string[]): Promise<Stock[]> {
    const parameters: Record<string, string> = {
        'iss.json': 'extended',
        'iss.meta': 'off',
        'securities.columns': 'SECID,LOTSIZE,SHORTNAME,PREVPRICE'
    };

    // Add securities parameter if provided
    if (securities) {
        const securitiesParam = Array.isArray(securities) ? securities.join(',') : securities;
        parameters['securities'] = securitiesParam;
    }

    const data = await this.makeRequest<any>(
        'iss/engines/stock/markets/shares/boards/TQBR/securities.json',
        parameters
    );

    const allStocks = data[1].securities.map((security: any) => ({
        ticker: security.SECID,
        name: security.SHORTNAME,
        lotSize: security.LOTSIZE,
        currentPrice: security.PREVPRICE,
        currency: 'RUB',
        exchange: 'MOEX'
    }));

    // Filter by query if provided
    if (query) {
        const lowerQuery = query.toLowerCase();
        return allStocks.filter((stock: Stock) =>
        stock.ticker.toLowerCase().includes(lowerQuery) ||
        stock.name.toLowerCase().includes(lowerQuery)
        );
    }

    return allStocks;
    }
}