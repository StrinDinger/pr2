import { Stock, IndexComponent, IndexAPIResponse, APIConfig, IndexType } from '../types';

export abstract class BaseIndexAPI {
  protected config: APIConfig;
  protected indexType: IndexType;

  constructor(config: APIConfig, indexType: IndexType) {
    this.config = config;
    this.indexType = indexType;
  }

  // Abstract methods that all index APIs must implement
  abstract fetchIndexComponents(): Promise<IndexComponent[]>;
  abstract fetchLastPrice(ticker: string): Promise<number | null>;
  abstract searchStocks(query?: string, securities?: string | string[]): Promise<Stock[]>;

  // Common methods with default implementation
  async fetchMultiplePrices(tickers: string[]): Promise<Record<string, number | null>> {
    const pricePromises = tickers.map(async (ticker) => {
      const price = await this.fetchLastPrice(ticker);
      return { ticker, price };
    });

    const results = await Promise.all(pricePromises);
    return results.reduce((acc, { ticker, price }) => {
      acc[ticker] = price;
      return acc;
    }, {} as Record<string, number | null>);
  }

  protected async makeRequest<T>(endpoint: string, parameters: Record<string, string> = {}): Promise<T> {
    const url = new URL(`${this.config.baseUrl}/${endpoint}`);
    
    Object.entries(parameters).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(this.config.apiKey && { 'Authorization': `Bearer ${this.config.apiKey}` }),
      },
      signal: AbortSignal.timeout(this.config.timeout || 10000),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      await this.fetchLastPrice('TEST'); // Simple request to test connectivity
      return true;
    } catch {
      return false;
    }
  }
}
