import { StockSearchResult, CryptoSearchResult, StockDetailsResponse, CryptoDetailsResponse, ChartResponse, TimeframeType } from '@/types';

export interface IStockDataProvider {
  searchStocks(query: string): Promise<StockSearchResult[]>;
  getStockDetails(symbol: string): Promise<StockDetailsResponse>;
  getStockChartData(symbol: string, timeframe: TimeframeType): Promise<ChartResponse>;
}

export interface ICryptoDataProvider {
  searchCrypto(query: string): Promise<CryptoSearchResult[]>;
  getCryptoDetails(id: string): Promise<CryptoDetailsResponse>;
  getCryptoChartData(id: string, timeframe: TimeframeType): Promise<ChartResponse>;
}

export interface IFinancialDataProvider extends IStockDataProvider, ICryptoDataProvider {}