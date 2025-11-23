// Common types across all indexes
export interface Stock {
  ticker: string;
  name: string;
  lotSize?: number;
  currentPrice?: number;
  currency?: string;
  exchange?: string;
}

export interface IndexComponent {
  ticker: string;
  weight: number;
  name?: string;
}

export interface IndexAPIResponse<T> {
  data: T;
  source: string;
  timestamp: Date;
}

export interface APIConfig {
  baseUrl: string;
  apiKey?: string;
  rateLimit?: number;
  timeout?: number;
}

export enum IndexType {
  MOEX = 'moex',
  NASDAQ = 'nasdaq',
  DAX = 'dax',
  SP500 = 'sp500',
}