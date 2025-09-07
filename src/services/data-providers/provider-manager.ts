import { alphaVantageClient } from '../alpha-vantage';
import { coinGeckoClient } from '../coingecko';
import { taiwanStockClient } from '../taiwan-stock';
import { IStockDataProvider, ICryptoDataProvider } from './index;

export class FinancialDataProviderManager {
  private stockProvider: IStockDataProvider;
  private cryptoProvider: ICryptoDataProvider;

  constructor() {
    this.stockProvider = alphaVantageClient;
    this.cryptoProvider = coinGeckoClient;
  }

  getStockProvider(): IStockDataProvider {
    return this.stockProvider;
  }

  getCryptoProvider(): ICryptoDataProvider {
    return this.cryptoProvider;
  }

  // This method can be extended to select providers based on market/country
  // For now, it returns the default stock or crypto provider
  getProvider(assetType: 'stock' | 'crypto', market?: string): IStockDataProvider | ICryptoDataProvider {
    if (assetType === 'stock') {
      if (market === 'TW') {
        return taiwanStockClient;
      }
      return this.stockProvider; // Default to Alpha Vantage for other stocks
    } else if (assetType === 'crypto') {
      return this.cryptoProvider;
    }
    throw new Error('Unsupported asset type');
  }
}

export const financialDataProviderManager = new FinancialDataProviderManager();